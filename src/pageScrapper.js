// Parameter
const eproc = "engineering";
const yearPub = "2022";

const scraperObject = {
  url: `https://scholar.google.com/scholar?q=site:openlibrarypublications.telkomuniversity.ac.id/index.php/${eproc}&hl=en&as_sdt=0,5&as_ylo=${yearPub}&as_yhi=${yearPub}`,
  async scraper(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    // Navigasi ke url
    await page.goto(this.url);
    await page.waitForTimeout(25000);
    let scrapedData = [];
    async function scrapeCurrentPage() {
      // Menunggu DOM berhasil dimuat
      try {
        await page.waitForSelector("#gs_bdy");
      } catch (err) {
        console.log("seems like got captcha to be solved");
        await page.waitForTimeout(25000);
        await page.waitForSelector("#gs_bdy");
      }
      // Variabel untuk mendapatkan seluruh value (sesuai nama variabel) dari halaman yang sedang dibuka
      let citation = await page.$$eval(
        "#gs_res_ccl_mid > .gs_r > .gs_ri",
        (cited) => {
          cited = cited.map(
            (el) => el.querySelector(".gs_fl > a:nth-child(3)").textContent
          );
          return cited;
        }
      );

      let citedLink = await page.$$eval(
        "#gs_res_ccl_mid > .gs_r > .gs_ri",
        (cited) => {
          cited = cited.map(
            (el) => el.querySelector(".gs_fl > a:nth-child(3)").href
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
              console.log(
                `${link}, jurnal ini aman tidak ada kendala dalam URL`
              );
            }
            await newPage.goto(link);
            try {
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
            } catch (err) {
              console.log("Error! Silahkan cek link jurnalnya");
              dataObj["eProceedings"] = "Journal Error";
              dataObj["journalTitle"] = "Jurnal tidak dapat dibuka / diakses";
              dataObj["journalAuthor"] = "ERROR";
              dataObj["journalPubVolume"] = link;
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
        currentPageData["totalCitation"] = citation[link];
        if (citation.includes("Cited")) {
          currentPageData["totalCitation"] = citation[link];
          currentPageData["citedLink"] = citedLink[link];
        } else {
          currentPageData["totalCitation"] = "Belum disitasi";
          currentPageData["citedLink"] = "Belum disitasi";
        }
        scrapedData.push(currentPageData);
      }

      let nextButtonExist = false;
      /* Pilih variabel DOM Element berdasarkan ukuran browser, uncomment sesuai variabel */

      // Web Fullsize (Width > 900px)
      let nextDomMobile =
        "#gs_nm > button.gs_btnPR.gs_in_ib.gs_btn_lrge.gs_btn_half.gs_btn_lsu";

      // Mobile (Width < 900px)
      let nextDomWeb =
        "#gs_n > center > table > tbody > tr > td:nth-child(12) > a";

      // const nextBtn = await page.$eval(nextDomWeb, (a) => a.textContent);
      const nextBtn = await page.$eval(nextDomMobile, (a) => a.disabled);
      try {
        if (!nextBtn) {
          nextButtonExist = true;
        } else {
          nextButtonExist = false;
        }
      } catch (err) {
        nextButtonExist = false;
        console.log(
          "Tidak ada halaman selanjutnya... Sedang mencoba mengumpulkan data di halaman terakhir..."
        );
      }

      /* Uncomment sesuai DOM Element */
      if (nextButtonExist) {
        await page.waitForTimeout(2000);
        await page.click(nextDomMobile);
        // await page.click(nextDomWeb);
        return scrapeCurrentPage();
      } else {
        console.log(
          `Tidak ada lagi data yang bisa diambil karena ini halaman terakhir`
        );
      }
      await page.close();
      return scrapedData;
    }
    let data = await scrapeCurrentPage();
    console.log(
      "Seluruh data berhasil diambil, sedang memproses untuk menyimpan data..."
    );
    return data;
  },
};

module.exports = scraperObject;
