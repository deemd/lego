const fs = require('fs');

const scrapers = {
  'avenuedelabrique': require('./websites/avenuedelabrique'),
  'dealabs': require('./websites/dealabs'),
  'vinted': require('./websites/vinted')
};

let vintedWeb;



/**
 * Extracts a lego set id from a given URL link
 * @param {string} url - The website URL
 */
function extractLegoSetId(url) {
  const regex = /\b\d{4,6}\b/; /*/lego-(\d{5})/i;*/
  const match = url.match(regex);
  return match ? match[0] : null; // match[1]
}



/**
 * Extracts the unique lego set ids from scrapped deals
 */
function getUniqueLegoSetIds(deals) {
  const legoIds = new Set(); // set = no duplicates

  deals.forEach(deal => {
      const legoId = extractLegoSetId(deal.link);
      if (legoId) {
          legoIds.add(legoId);
      }
  });

  return Array.from(legoIds);
}







/**
 * Extracts the site name from a given URL
 * @param {string} url - The website URL
 * @returns {string|null} - Extracted site name or null if not found
 */
const getSiteName = (url) => {
  if (url.includes('avenuedelabrique.com')) return 'avenuedelabrique';
  if (url.includes('dealabs.com')) return 'dealabs';
  if (url.includes('vinted.fr') || url.includes('vinted.com')) return 'vinted';
  return null;
};



/**
 * Scrape data and create json files for deals and sales
 *//*
async function sandbox (website = 'https://www.avenuedelabrique.com/nouveautes-lego') {
  try {
    console.log(`Browsing ${website} website`);

    const siteName = getSiteName(website);
    if (!siteName || !scrapers[siteName]) {
      throw new Error(`❌ No scraper found for ${website}`);
    }

    if (siteName === 'vinted') {
      for (const legoId of SCRAPPED_DEALS) {
        try {
          let sales = await scrapers[siteName].scrape(legoId); // pas bon ??
          console.log(sales);

          fs.writeFileSync(`vinted-${legoId}.json`, JSON.stringify(sales, null, 2));
          console.log(`Saved: vinted-${legoId}.json`);

        } catch (error) {

          console.error(`Error scraping deal ${legoId}:`, error);

        }
      }

      console.log('✅ Done');
      process.exit(0);
      return;
    }

    const deals = await scrapers[siteName].scrape(website);

    console.log(deals);
    console.log('✅ Done');
    process.exit(0);

  } catch (e) {

    console.error(e);
    process.exit(1);

  }
}*/


/*
const [,, eshop] = process.argv;

sandbox(eshop); */


/**
 * Scrape Dealabs deals
 */
async function scrapeDealabs() {
  try {
    const website = 'https://www.dealabs.com/groupe/lego';
    console.log(`Scraping deals from ${website}`);

    const deals = await scrapers['dealabs'].scrape(website);
    console.log('✅ Deals retrieved and saved into dealabsData.json');

    return deals;
  } catch (error) {
    console.error('❌ Error when scraping Dealabs :', error);
    return [];
  }
}


/**
 * Scrape Vinted sales for each unique ID Lego Set
 */
async function scrapeVinted() {
  try {
    console.log('Scraping Vinted sales...');
    let salesData = [];

    SCRAPPED_DEALS = getUniqueLegoSetIds(JSON.parse(fs.readFileSync('dealabsData.json')));

    console.log("SCRAPPED_DEALS : ");
    console.log(SCRAPPED_DEALS);


    for (const legoId of SCRAPPED_DEALS) {
      try {
        let sales = await scrapers['vinted'].scrape(legoId);
        fs.writeFileSync(`vinted-${legoId}.json`, JSON.stringify(sales, null, 2));
        console.log(`✅ Sales retrieved and saved for ID ${legoId}`);
        salesData.push(sales);
      } catch (error) {
        console.error(`❌ Error when scraping the ID ${legoId} on Vinted :`, error);
      }
    }

    return salesData;
  } catch (error) {
    console.error('❌ Global error when scraping Vinted :', error);
    return [];
  }
}


/**
 * Export scraping functions to use in mongo.js
 */
module.exports = {
  scrapeDealabs,
  scrapeVinted
};





/**
 * Set of unique lego ids (from scrapped deals)
 */
//const SCRAPPED_DEALS = getUniqueLegoSetIds(JSON.parse(fs.readFileSync('data/dealabsData.json')));



/* eslint-disable no-console, no-process-exit */
/*
const avenuedelabrique = require('./websites/avenuedelabrique');
const dealabs = require('./websites/dealabs');
const vinted = require('./websites/vinted');

async function sandbox (website = 'https://www.avenuedelabrique.com/nouveautes-lego') {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);

    const deals = await avenuedelabrique.scrape(website);

    console.log(deals);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

*/
