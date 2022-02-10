const pageScraper = require('./pageScrapper');
const fs = require('fs');
// Ganti dengan nama file sesuai jurnalnya :
const fileName = "journal-appliedscience-2020.json";

async function scrapeAll(browserInstance){
    let browser;
    try{
        browser = await browserInstance;
        let scrapedData = {};
        scrapedData = await pageScraper.scraper(browser);
        
        fs.writeFile(`./journal/${fileName}`, JSON.stringify(scrapedData), 'utf8', function(err) {
            if(err) {
                return console.log(err);
            }
            console.log('Data has been Saved, check out the file => ', fileName)
        })
        await browser.close();
    }
    catch(err){
        console.log("Could not resolve the browser instance => ", err);
    }
}

module.exports = (browserInstance) => scrapeAll(browserInstance)