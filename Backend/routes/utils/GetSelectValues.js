async function GetSelectValues(page, id, closePage = true){
  await page.goto("https://www.sci.gov.in/judgements-case-no/")
  try{
    await page.waitForSelector(id)
  }catch (err) { return null }

  const select_values = await page.evaluate((id) => {
    const optionsObj = {}

    const options = Array.from(document.querySelectorAll(`${id} option`))
    options.map(element => optionsObj[element.value] = element.innerText) // We are not using the value but we're still scraping it incase something changes in the future

    return optionsObj
  }, id)

  if(closePage) await page.close()
  return select_values
}

module.exports = GetSelectValues