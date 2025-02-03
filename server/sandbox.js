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

const scrapers = {
  'avenuedelabrique': require('./websites/avenuedelabrique'),
  'dealabs': require('./websites/dealabs'),
  'vinted': require('./websites/vinted')
};

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

    const deals = await scrapers[siteName].scrape(website);

    console.log(deals);
    console.log('✅ Done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;

sandbox(eshop);
