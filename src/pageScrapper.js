// Parameter
const eproc = "appliedscience";
const yearPub = "2020";

const scraperObject = {
  url: `https://scholar.google.com/scholar?q=site:openlibrarypublications.telkomuniversity.ac.id/index.php/${eproc}&hl=en&as_sdt=0,5&as_ylo=${yearPub}&as_yhi=${yearPub}`,
  async scraper(browser) {
    let page = await browser.newPage();
    // await page.setRequestInterception(true);
    console.log(`Navigating to ${this.url}...`);
    // Navigate to the selected page
    await page.goto(this.url);
    await page.waitForTimeout(25000);
    let scrapedData = [];
    async function scrapeCurrentPage() {
      // Wait for the required DOM to be rendered
      try {
        await page.waitForSelector("#gs_bdy");
      } catch(err) {
        console.log('seems like got captcha to be solved');
        await page.waitForTimeout(25000);
        await page.waitForSelector("#gs_bdy");
      }
      // Get the link to all the required journal
      let citation = await page.$$eval(
        "#gs_res_ccl_mid > .gs_r > .gs_ri",
        (cited) => {
          cited = cited.map(
            (el) => el.querySelector(".gs_fl > a:nth-child(3)").textContent
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
        new Promise(async (resolve) => {
          let dataObj = {};
          let newPage = await browser.newPage();

          try {
            if (link.includes("download")) {
              let splitted = link.split("/");
              splitted.pop();
              let joined = splitted.join("/").replace("download", "view");
              link = joined;
            } else if (link.includes("viewFile")) {
              let splitted = link.split("/");
              splitted.pop();
              let joined = splitted.join("/").replace("viewFile", "view");
              link = joined;
            } else if (link.split("/").length > 8) {
              let splitted = link.split("/");
              splitted.pop();
              let joined = splitted.join("/");
              link = joined;
            } else {
              console.log(`${link}, jurnal ini aman tidak ada kendala dalam URL`);
            }
            await newPage.goto(link)
            try {dataObj["eProceedings"] = await newPage.$eval(
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
            } catch(err) {
              console.log("Error! Silahkan cek link jurnalnya")
              dataObj["eProceedings"] = "Journal Error"
              dataObj["journalTitle"] = "Jurnal tidak dapat dibuka / diakses"
              dataObj["journalAuthor"] = "ERROR"
              dataObj["journalPubVolume"] = link
            }

            await newPage.waitForTimeout(2000);
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
      }

      let nextButtonExist = false;
      // let nextDomMobile = "#gs_nm:nth-child(3) > button.gs_btnPR.gs_in_ib.gs_btn_lrge.gs_btn_half.gs_btn_lsu:nth-child(2)";
      let nextDomWeb = "#gs_n > center > table > tbody > tr > td:nth-child(12) > a"
      try {
        // const nextButton = await page.$eval(nextDomMobile, (a) => a.textContent);
        const nextBtn = await page.$eval(nextDomWeb, (a) => a.textContent); 
        nextButtonExist = true;
      } catch (err) {
        nextButtonExist = false;
        console.log("Tidak ada halaman selanjutnya... Sedang mencoba mengumpulkan data di halaman terakhir...");
      }

      if (nextButtonExist) {
        // await page.click(nextDomMobile);
        await page.waitForTimeout(2000);
        await page.click(nextDomWeb);
        return scrapeCurrentPage();
      } else {
        console.log(`Tidak ada lagi data yang bisa diambil karena ini halaman terakhir`)
      }
      await page.close();
      return scrapedData;
    }
    let data = await scrapeCurrentPage();
    console.log('Seluruh data berhasil diambil, sedang memproses untuk menyimpan data...')
    return data;
  },
};

module.exports = scraperObject;
