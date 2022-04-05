const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");

async function startBrowser() {
  let browser;
  try {
    console.log("Opening the Browser...");
    puppeteer.use(stealthPlugin());
    browser = await puppeteer.launch({
      headless: false,
      args: [
        "--enable-automation",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "window-size=1600,900",
      ],
      ignoreHTTPSErrors: true,
      defaultViewPort: {
        width: 1600,
        height: 900,
      },
    });
  } catch (err) {
    console.log("Could not create a browser instance =>:", err);
  }
  return browser;
}

module.exports = {
  startBrowser,
};
