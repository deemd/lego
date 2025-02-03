const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Object} deal
 */
const parse = data => {
  const $ = cheerio.load(data, {'xmlMode': true});

  return $('div.js-threadList article')
    .map((i, element) => {
      const price = parseFloat(
        $(element)
          .find('div.threadListCard-body span.thread-price')
          .text()
      );

      const discount = Math.abs(parseInt(
        $(element)
          .find('span.textBadge.bRad--a-m.flex--inline.text--b.boxAlign-ai--all-c.size--all-s.size--fromW3-m.space--h-1.space--ml-1.space--mr-0.textBadge--green')
          .text()
      ));

      const title = $(element)
      .find('div.threadListCard-body a')
      .attr('title');

      /* Feature: image link
      const IMAGE_PATH = $(element)
      .find('span.prodl-img img')
      .attr('data-src') || '';
      const image = 'https://www.avenuedelabrique.com/img/' + IMAGE_PATH;*/

      return {
        discount,
        price,
        title,
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
        },
      });
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
      const body = await response.text();
      return parse(body);
    } catch (error) {
      console.error(`Error scraping ${url}:, error.message`);
      return null;
    }
  };








/**
 * Scrape a given url page
 * @param {String} url - url to parse
 * @returns 
 */
/*
module.exports.scrape = async url => {
  const response = await fetch(url);

  if (response.ok) {
    const body = await response.text();

    return parse(body);
  }

  console.error(response);

  return null;
};
*/