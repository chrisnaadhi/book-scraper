const puppeteer = require("puppeteer-extra")
const StealthPlugin = require("puppeteer-extra-plugin-stealth")

async function startBrowser() {
  let browser;
  try {
    puppeteer.use(StealthPlugin());
    console.log("Opening the Browser...");
    browser = await puppeteer.launch({
      headless: false,
      args: ["--disable-setuid-sandbox"],
      ignoreHTTPSErrors: true,
    });
  } catch (err) {
    console.log("Could not create a browser instance =>:", err);
  }
  return browser;
}

module.exports = {
  startBrowser,
};
