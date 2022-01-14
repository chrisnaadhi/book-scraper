const scraperObject = {
  url: "https://scholar.google.com/scholar?hl=en&start=0&q=site:openlibrarypublications.telkomuniversity.ac.id/index.php/management",
  async scraper(browser) {
    let page = await browser.newPage();
    // await page.setRequestInterception(true);
    console.log(`Navigating to ${this.url}...`);
    // Navigate to the selected page
    await page.goto(this.url);
    // await page.waitForNavigation();
    let scrapedData = [];
    async function scrapeCurrentPage() {
      // Wait for the required DOM to be rendered
      await page.waitForSelector("#gs_bdy");
      // Get the link to all the required journal
      let citation = await page.$$eval(
        "#gs_res_ccl_mid > .gs_r > .gs_ri",
        (cited) => {
          cited = cited.map(
            (el) => el.querySelectorAll(".gs_fl > a")[2].textContent
          );
          return cited;
        }
      );

      let urls = await page.$$eval(
        "#gs_res_ccl_mid > .gs_r > .gs_ri",
        (link) => {
          link = link.map((el) => el.querySelector("h3 > a").href);
          return link;
        }
      );
      let pagePromise = (link) =>
        new Promise(async (resolve, reject) => {
          let dataObj = {};
          let newPage = await browser.newPage();

          try {
            if (link.includes("download")) {
              let splitted = link.split("/");
              splitted.pop();
              let joined = splitted.join("/").replace("download", "view");
              link = joined;
            }
            await newPage.goto(link);
            dataObj["eProceedings"] = await newPage.$eval(
              "#headerTitle > figure > h1",
              (text) =>
                (text = text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, ""))
            );
            dataObj["journalTitle"] = await newPage.$eval(
              "#articleTitle > h3",
              (text) => text.textContent
            );
            dataObj["journalAuthor"] = await newPage.$eval(
              "#authorString",
              (text) => text.textContent
            );
            dataObj["journalPubVolume"] = await newPage.$eval(
              "#breadcrumb > a:nth-child(2)",
              (text) => text.textContent
            );

            resolve(dataObj);
            await newPage.close();
          } catch (err) {
            console.log(err);
          }
        });

      for (link in urls) {
        let currentPageData = await pagePromise(urls[link]);
        currentPageData["journalCitation"] = citation[link];
        scrapedData.push(currentPageData);
        console.log("Scraped 10 Data from this page")
      }

      let nextButtonExist = false;
      let nextDom =
        "#gs_nm:nth-child(3) > button.gs_btnPR.gs_in_ib.gs_btn_lrge.gs_btn_half.gs_btn_lsu:nth-child(2)";
      try {
        const nextButton = await page.$eval(nextDom, (a) => a.textContent);
        nextButtonExist = true;
      } catch (err) {
        nextButtonExist = false;
        console.log(err);
      }

      if (nextButtonExist) {
        await page.click(nextDom);
        return scrapeCurrentPage();
      }
      await page.close();
      return scrapedData;
    }
    let data = await scrapeCurrentPage();
    console.log(data);
    return data;
  },
};

module.exports = scraperObject;
