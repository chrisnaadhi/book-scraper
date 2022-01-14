const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const UserAgent = require("user-agents");
const userAgent = new UserAgent();

async function startBrowser() {
  let browser;
  try {
    console.log("Opening the Browser...");
    puppeteer.use(stealthPlugin());
    browser = await puppeteer.launch({
      headless: false,
      args: ["--user-agent=" + userAgent + "", "--enable-automation","--disable-setuid-sandbox", '--disable-web-security'],
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
