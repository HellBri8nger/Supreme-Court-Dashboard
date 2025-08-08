import React, { useState } from 'react'
import {Card, Button, Collapse, Text, Group, Stack, Divider, ScrollArea, Title, Box} from '@mantine/core'

const PreviousCasesDropdown = ({ cases }) => {
  const [openedIndex, setOpenedIndex] = useState(null)

  const toggleCase = (index) => {
    setOpenedIndex((prev) => (prev === index ? null : index))
  }

  return (
    <Box shadow="sm" radius="md" p="md" mt="md">
      <Title order={4} mb="sm"> Previous Cases </Title>

      <Stack gap="sm">
        {cases.length === 0 && (<Text c="dimmed" size="sm">No previous cases found.</Text>)}

        {cases.map((item, index) => {
          let parsedData
          try {parsedData = JSON.parse(item.caseData)}
          catch (e) {parsedData = { Error: 'Invalid case data format' }}

          return (
            <Card key={item.id} withBorder shadow="xs" radius="md" p="sm">
              <Group justify="space-between">
                <Text fw={500}>{item.caseType} – {item.caseYear} – {item.caseNumber}</Text>
                <Button size="xs" variant="light" onClick={() => toggleCase(index)}>
                  {openedIndex === index ? 'Hide' : 'View'}
                </Button>
              </Group>

              <Collapse in={openedIndex === index}>
                <Divider my="sm" />
                <ScrollArea h={250}>
                  <Stack gap="xs">
                    {Object.entries(parsedData).map(([key, value]) => (
                      <div key={key}>
                        <Text fw={500} size="sm"> {key} </Text>
                        <Text size="sm" c="dimmed" style={{ whiteSpace: 'pre-line' }}>
                          {Array.isArray(value) ? (
                            value.map((v, i) => (
                              <div key={i}> <a href={v.href} target="_blank" rel="noopener noreferrer"> {v.text} </a> </div>
                            ))
                          ) : (value)}
                        </Text>
                      </div>
                    ))}
                  </Stack>
                </ScrollArea>
              </Collapse>
            </Card>
          )
        })}
      </Stack>
    </Box>
  )
}

export default PreviousCasesDropdown
