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

const fs = require('fs');

const scrapers = {
  'avenuedelabrique': require('./websites/avenuedelabrique'),
  'dealabs': require('./websites/dealabs'),
  'vinted': require('./websites/vinted')
};

let vintedWeb;

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

async function sandbox (website = 'https://www.avenuedelabrique.com/nouveautes-lego') {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);

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
      console.log(deals);
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
}


// ---------------------------------------------------------------------------------------------------

function extractLegoSetId(link) {
  const regex = /lego-(\d{5})/i;
  const match = link.match(regex);
  return match ? match[1] : null;
}

function getUniqueLegoSetIds(deals) {
  const legoIds = new Set(); // no duplicates

  deals.forEach(deal => {
      const legoId = extractLegoSetId(deal.link);
      if (legoId) {
          legoIds.add(legoId);
      }
  });

  return Array.from(legoIds);
}

const SCRAPPED_DEALS = getUniqueLegoSetIds(JSON.parse(fs.readFileSync('dealabsData.json')));
// console.log(uniqueLegoIds);

/*(async () => {
  for (const legoId of SCRAPPED_DEALS) {
    try {
      let sales = await scrapers['vinted'].scrape(legoId);
      console.log(sales);

      fs.writeFileSync(`vinted-${legoId}.json`, JSON.stringify(sales, null, 2));
      console.log(`Saved: vinted-${legoId}.json`);
    } catch (error) {
      console.error(`Error scraping deal ${legoId}:`, error);
    }
  }
})();*/

/*
const vinted = require('./vinted');
const SCRAPPED_DEALS = JSON.parse(fs.readFileSync('dealabsData.json'));

for (const deal of SCRAPPED_DEALS){
  let results = await vinted.scrape(deal.id);
  console.log(results);
  fs.writeFileSync(results, `vinted-${deal.id}.json`);
  db.update('sales', results);
}
*/

// ---------------------------------------------------------------------------------------------------


const [,, eshop] = process.argv;

sandbox(eshop);

