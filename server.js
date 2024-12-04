const express = require("express");
/* const puppeteer = require("puppeteer-core"); */
const puppeteer = require("puppeteer");

const app = express();
const port = process.env.PORT || 3000;

url = 'https://ultimasnoticias.com.ve/seccion/sucesos/'

puppeteer.launch().then(async function (browser) {
    const page = await browser.newPage();
    await page.goto('https://ultimasnoticias.com.ve/seccion/sucesos/');

    const ultimasNoticias = await page.$$eval('.td-module-container ', function(noticias) {
        // Mapping each noticias name to an array
            return noticias.map(function(noticia) {
          return noticia.innerText;
        });
    });
    console.log(ultimasNoticias)
    // Closing the Puppeteer controlled headless browser
    await browser.close();
});

app.get("/scrapeNews", async (req, res) => {

    /*     try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(url);
            console.log("Conectado a ultima noticias")
    
            await browser.close()
        } catch (error) {
            res.status(500).send({ error: 'Failed to scrape the website' });
        } */
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});