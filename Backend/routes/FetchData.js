const { Router } = require('express')
const puppeteer = require("puppeteer")
const GetSelectValues = require("./utils/GetSelectValues")
const SolveCaptcha = require("./utils/SolveCaptcha")
require("dotenv").config()

let browser;
const userAgent = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.3";

function delayTime(time) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time)
  });
}

(async () => { browser = await puppeteer.launch({ headless: false })})().catch(console.error)

const router = Router()

router.get("/get-case-types", async (req, res) => {
  const page = await browser.newPage()
  await page.setUserAgent(userAgent)
  res.send(await GetSelectValues(page, "#case_type"))
})

router.get("/get-year", async (req, res) => {
  const page = await browser.newPage()
  await page.setUserAgent(userAgent)
  res.send(await GetSelectValues(page, "#year"))
})

router.get("/get-case", async (req, res) => {
  async function HandleInputs(page, selector, value, delay = 0, press_enter = true){
    await page.click(selector)
    if(delay > 0) await delayTime(delay)
    await page.keyboard.type(value)
    if(delay > 0) await delayTime(delay)
    if(press_enter) await page.keyboard.press("Enter")
  }


  console.log(req.body)
  const page = await browser.newPage()
  await page.setUserAgent(userAgent)
  await page.goto("https://www.sci.gov.in/judgements-case-no/")

  const {caseType, caseYear, caseNumber} = req.body

  await HandleInputs(page, "#select2-case_type-container", caseType, 100)
  await HandleInputs(page, "#select2-year-container", caseYear, 100)
  await HandleInputs(page, "#case_no", caseNumber, 0, false)


  await delayTime(2000)
  console.log("Delay Finished")
  const captchaAnswer = await SolveCaptcha(page)
  console.log(captchaAnswer)
  await HandleInputs(page, ".enter-captcha", captchaAnswer, 0, false)
  await page.click("#sciapi-services-judgements-case-no > div.form-row.mr-none > div.second_col > input:nth-child(1)")


})

module.exports = router