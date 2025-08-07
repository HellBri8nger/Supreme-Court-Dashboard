async function GetSelectValues(page, id){
  await page.goto("https://www.sci.gov.in/judgements-case-no/")
  try{
    await page.waitForSelector(id)
  }catch (err) { return null }

  const select_values = await page.evaluate((id) => {
    const options = Array.from(document.querySelectorAll(`${id} option`))
    return options.map(element => element = {[element.value]: element.innerText})
  }, id)

  await page.close()
  return select_values
}

module.exports = GetSelectValues