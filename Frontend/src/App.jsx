import './App.css'
import { useEffect, useState } from 'react'
import {Button, Select, TextInput, Box, Notification, LoadingOverlay, Card} from '@mantine/core'
import { useForm } from '@mantine/form'
import CaseDetails from './Components/CaseDetails.jsx'
import PreviousCases from "./Components/PreviousCases.jsx";

function App() {
  const clientURL = "http://localhost:3000"

  const [caseTypeData, setCaseTypeData] = useState([])
  const [caseYearData, setCaseYearData] = useState([])
  const [caseValue, setCaseValue] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [caseHistoryData, setCaseHistoryData] = useState([])

  const form = useForm({
    initialValues: {caseType: '', caseYear: '', caseNumber: '',},

    validate: {
      caseType: (value) => (value ? null : 'Please select a case type'),
      caseYear: (value) => (value ? null : 'Please select a case year'),
      caseNumber: (value) => /^\d+$/.test(value) ? null : 'Case number must be numeric',}
  })

  useEffect(() => {
    async function fetchDropdownData() {
      try {
        const [typesResponse, yearsResponse, historyResponse] = await Promise.all([
          fetch(`${clientURL}/fetch/get-case-types`),
          fetch(`${clientURL}/fetch/get-year`),
          fetch(`${clientURL}/fetch/get-history`),
        ])

        const [types, years, history] = await Promise.all([typesResponse.json(), yearsResponse.json(), historyResponse.json()])
        console.log(history)

        setCaseTypeData(Object.values(types))
        setCaseYearData(Object.values(years))
        setCaseHistoryData(history)
      } catch (err) {
        console.error('Error fetching dropdown data:', err)
        setFetchError('Failed to load dropdown data.')
      }
    }

    fetchDropdownData().then()
  }, [])

  const handleSubmit = async (values) => {
    setLoading(true)
    setFetchError(null)
    setCaseValue(null)

    try {
      const res = await fetch(`${clientURL}/fetch/get-case`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Unknown error')
      }

      setCaseValue(data)
    } catch (err) {
      console.error('Error submitting case data:', err)
      setFetchError(err.message || 'Failed to fetch case details.')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <h2 className="title">Supreme Court Case Lookup</h2>

      {fetchError && (<Notification className="error" color="red" title="Error" mb="sm"> {fetchError} </Notification>)}

      <Card className="form-wrapper" pos="relative" withBorder>
        <LoadingOverlay visible={caseTypeData.length === 0 || caseYearData.length === 0} zIndex={1000} overlayBlur={2}/>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Select
            label="Case Type"
            placeholder="Select a case type"
            data={caseTypeData}
            searchable
            disabled={caseTypeData.length === 0}
            {...form.getInputProps('caseType')}
          />

          <Select
            label="Case Year"
            placeholder="Select a year"
            data={caseYearData}
            searchable
            className="spacing-top"
            disabled={caseYearData.length === 0}
            {...form.getInputProps('caseYear')}
          />

          <TextInput
            label="Case Number"
            placeholder="Enter case number"
            className="spacing-top"
            {...form.getInputProps('caseNumber')}
          />

          <Button
            type="submit"
            className="submit-button"
            fullWidth
            loading={loading}
            disabled={caseTypeData.length === 0 || caseYearData.length === 0}
          >
            Submit
          </Button>
        </form>
      </Card>

      <Box className="results-wrapper"> <CaseDetails data={caseValue} /> </Box>
      <PreviousCases cases={caseHistoryData}/>
    </div>
  )
}

export default App