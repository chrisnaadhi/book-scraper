const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");

async function startBrowser() {
  let browser;
  try {
    console.log("Opening the Browser...");
    puppeteer.use(stealthPlugin());
    browser = await puppeteer.launch({
      headless: false,
      args: ["--enable-automation", "--disable-setuid-sandbox", '--disable-web-security'],
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
