import React from "react"
import { Table, Anchor, Title, Card, ScrollArea, Stack } from "@mantine/core"
import './CaseDetails.css'

export default function CaseDetailsTable({ data }) {
  if (!data) return null

  const {
    "Diary Number": diaryNumber,
    "Case Number": caseNumber,
    "Petitioner / Respondent": parties,
    "Petitioner/Respondent Advocate": advocate,
    "Bench": bench,
    "Judgment By": judgmentBy,
    "Judgment": judgments
  } = data

  const rows = [
    ["Diary Number", diaryNumber],
    ["Case Number", caseNumber],
    ["Petitioner / Respondent", parties],
    ["Petitioner/Respondent Advocate", advocate],
    ["Bench", bench],
    ["Judgment By", judgmentBy]
  ]

  return (
    <ScrollArea h={600}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack spacing="md">
          <Title order={3}>Case Details</Title>

          <Table withColumnBorders striped className="case-table">
            <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <td className="label-cell">{label}</td>
                <td className="value-cell">{value}</td>
              </tr>
            ))}

            {judgments?.length > 0 && (
              <tr>
                <td className="label-cell">Judgments</td>
                <td className="value-cell">
                  <Stack spacing={4}>
                    {judgments.map((item, i) => (
                      <Anchor key={i} href={item.href} target="_blank" rel="noopener noreferrer" size="sm"> {item.text} </Anchor>
                    ))}
                  </Stack>
                </td>
              </tr>
            )}
            </tbody>
          </Table>
        </Stack>
      </Card>
    </ScrollArea>
  )
}
