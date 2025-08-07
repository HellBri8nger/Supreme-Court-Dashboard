const { Router } = require('express')
const puppeteer = require("puppeteer")
const GetSelectValues = require("./utils/GetSelectValues")
const SolveCaptcha = require("./utils/SolveCaptcha")
require("dotenv").config()

let browser
const userAgent = "Mozilla/5.0 (Linux Android 10 K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.3"

function delayTime(time) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time)
  })
}

(async () => { browser = await puppeteer.launch({ headless: true })})().catch(console.error)

const router = Router()

router.get("/get-case-types", async (req, res) => {
  const page = await browser.newPage()
  await page.setUserAgent(userAgent)

  const caseTypes = await GetSelectValues(page, "#case_type", res)
  if(caseTypes) res.send(caseTypes)
  else res.status(502).json({error: "Bad gateway", message: "Target site failed to load"})
})

router.get("/get-year", async (req, res) => {
  const page = await browser.newPage()
  await page.setUserAgent(userAgent)

  const caseYears = await GetSelectValues(page, "#year", res)
  if(caseYears) res.send(caseYears)
  else res.status(502).json({error: "Bad gateway", message: "Target site failed to load"})
})

router.get("/get-case", async (req, res) => {
  async function HandleInputs(page, selector, value, delay = 0, press_enter = true){
    await page.click(selector)
    if(delay > 0) await delayTime(delay)
    await page.keyboard.type(value)
    if(delay > 0) await delayTime(delay)
    if(press_enter) await page.keyboard.press("Enter")
  }

  const page = await browser.newPage()
  await page.setUserAgent(userAgent)
  await page.goto("https://www.sci.gov.in/judgements-case-no/")

  const {caseType, caseYear, caseNumber} = req.body

  await HandleInputs(page, "#select2-case_type-container", caseType, 100)
  await HandleInputs(page, "#select2-year-container", caseYear, 100)
  await HandleInputs(page, "#case_no", caseNumber, 0, false)

  await delayTime(2000)
  const captchaAnswer = await SolveCaptcha(page)
  if(captchaAnswer){
    await HandleInputs(page, ".enter-captcha", captchaAnswer, 0, false)
    await page.click("#sciapi-services-judgements-case-no > div.form-row.mr-none > div.second_col > input:nth-child(1)")
  }else res.status(500).json({error: "Internal Server Error", message: "Captcha failed"})

  try{
    await page.waitForSelector(".notfound", {timeout: 2300})
    const result = await page.$('.notfound')
    const innerText = await page.evaluate(element => element.innerText, result)

    await page.close()

    if(innerText === "The captcha code entered was incorrect.") res.status(500).json({error: "Internal Server Error", message: "Captcha failed"})
    else res.status(404).json({error: "Not Found", message: innerText})

  }catch(err){
    const result = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('thead th')).map(th => th.innerText.trim())
      const rowElements = Array.from(document.querySelectorAll('tbody tr'))

      const rows = rowElements.map((tr, rowIndex) => {
        const tdElements = Array.from(tr.querySelectorAll('td'))

        return tdElements.map(td => {
          if (rowIndex === rowElements.length - 1) {
            const aTags = td.querySelectorAll('a')
            if (aTags.length > 0) return Array.from(aTags).map(a => ({text: a.innerText.trim(), href: a.href}))
          }
          return td.innerText.trim()
        })
      })
      return { headers, rows }
    })

    await page.close()

    const row = result.rows[0]
    const parsedData = {}
    result.headers.forEach((header, i) => parsedData[header] = row[i])

    res.send(parsedData)
  }
})

module.exports = router