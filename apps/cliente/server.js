const express = require("express");
/* const puppeteer = require("puppeteer-core"); */
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const ultimaNoticiasUrl = 'https://ultimasnoticias.com.ve/seccion/sucesos/'

/* 
// Funciona
puppeteer.launch().then(async function (browser) {
    const page = await browser.newPage();
    await page.goto('http://digidb.io/digimon-list/');

    // Targeting the DOM Nodes that contain the Digimon names
    const digimonNames = await page.$$eval('#digiList tbody tr td:nth-child(2) a', function (digimons) {
        // Mapping each Digimon name to an array
        return digimons.map(function (digimon) {
            return digimon.innerText;
        });
    });

    await browser.close();

    // Sending the Digimon names to Postman
    res.send(digimonNames);
}); */

// Funciona 2

/* puppeteer.launch().then(async function (browser) {
    const page = await browser.newPage();
    await page.goto('https://ultimasnoticias.com.ve/seccion/sucesos/', {timeout: 0});

    // Targeting the DOM Nodes that contain the Digimon names
    const ultimasNoticias = await page.$$eval('.td-module-container', function (noticias) {
        // Mapping each Digimon name to an array
        return noticias.map(function (noticia) {
            return noticia.innerText;
        });
    });

    await browser.close();

    // Sending the Digimon names to Postman
    res.send(ultimasNoticias);
}); */

/* puppeteer.launch().then(async function (browser) {
    const page = await browser.newPage();
    await page.goto('https://ultimasnoticias.com.ve/seccion/sucesos/');

    const ultimasNoticias = await page.$$eval('.td-module-container ', function (noticias) {
        // Mapping each noticias name to an array
        return noticias.map(function (noticia) {
            return noticia.innerText;
        });
    });
    console.log(ultimasNoticias)
    // Closing the Puppeteer controlled headless browser
    await browser.close();
}); */

app.get("/scrapeNews", async (req, res) => {

     console.log("probando")
    puppeteer.launch({ headless: true,}).then(async function (browser) {
        const page = await browser.newPage();
        // Interceptar mensajes de consola dentro del navegador
        page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

        await page.goto(ultimaNoticiasUrl, { timeout: 0 });
        console.log("Conectado a ultima noticias");

        // Targeting the DOM Nodes that contain the Digimon names
        const newsData = await page.evaluate(() => {


            const articleElements = document.querySelectorAll('.td-module-container');
            if (!articleElements) return [];
            console.log(articleElements)
            const data = [...articleElements].map(article => {
                const title = article.querySelector("h3.entry-title")?.textContent.trim();;
                const description = article.querySelector(".td-excerpt")?.textContent.trim();;
                const link = article.querySelector(".entry-title a")?.href;

                /* articles.push({ title, description, link }); */
                return {
                    title,
                    description,
                    link
                }
            })
            return data;
        })
        console.log(newsData)

        await browser.close();

        // Sending the Digimon names to Postman
        res.json(newsData);
    });
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});