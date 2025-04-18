const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');




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
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Object} deal
 */
const parse = data => {
  const $ = cheerio.load(data, {'xmlMode': true});

  return $('div.js-threadList article')
    .map((_, element) => {
      const link = $(element)
        .find('a[data-t=threadLink]')
        .attr('href');
      
      const data = JSON.parse($(element)
      .find('div.js-vue2')
      .attr('data-vue2'));

      // console.log(data);

      const thread = data.props.thread;
      const retail = thread.nextBestPrice;
      const price = thread.price;
      const discount = parseInt((retail-price)/retail*100);
      const temperature = +thread.temperature;
      const photo = `https://static-pepper.dealabs.com/threads/raw/${thread.mainImage.slotId}/${thread.mainImage.name}/re/300x300/qt/60/${thread.mainImage.name}.${thread.mainImage.ext}`;
      const comments = +thread.commentCount;
      const published = thread.publishedAt;
      const title = thread.title;
      const id = extractLegoSetId(link); // thread.threadId => pas le bon
      
      return {
        link,
        retail,
        price,
        discount,
        temperature,
        photo,
        comments,
        published,
        title,
        id
      };
    })
    .get();
};



/**
 * Scrape a given URL page
 * @param {String} url - URL to parse
 * @returns {Promise<Array|null>} Extracted deals
 */
module.exports.scrape = async url => {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.google.com/',
        }
      });
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
      const body = await response.text();
      const parsedData = parse(body);

      fs.writeFileSync('dealabsData.json', JSON.stringify(parsedData, null, 2));

      return parsedData;

    } catch (error) {

      console.error(`Error scraping ${url}:, ${error.message}`);
      return null;

    }
  };