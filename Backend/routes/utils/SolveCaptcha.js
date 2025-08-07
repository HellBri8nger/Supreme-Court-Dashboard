const {GoogleGenAI} = require("@google/genai");

async function SolveCaptcha(page) {
  const gemini = new GoogleGenAI({})

  try{
    await page.waitForSelector("#siwp_captcha_image_0")
  }catch (err){
    return null
  }

  const targetElement = await page.$('#siwp_captcha_image_0')
  await targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const captchaImage = await page.evaluate(() => {
    const captcha = document.querySelector("img#siwp_captcha_image_0")
    return captcha.src
  })

  const image = await fetch(captchaImage);
  const imageArrayBuffer = await image.arrayBuffer();
  const base64ImageData = Buffer.from(imageArrayBuffer).toString('base64');

  const prompt = "Here is a pic of a math problem solve it and don't say anything except the answer, hint: there will be no decimals or fractions in the question or the answer and it will always be an addition or subtraction between 2 numbers"

  const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{inlineData: {mimeType: "image/png", data: base64ImageData}},{text: prompt}],
  })

  return response.text

}

module.exports = SolveCaptcha