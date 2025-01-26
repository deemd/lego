// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentPagination = {};
let currentSales = [];

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals= document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');
const spanNbSales = document.querySelector('#nbSales');
const spanAvgPrice = document.querySelector("#average-price");
const spanP5Price = document.querySelector("#p5-price");
const spanP25Price = document.querySelector("#p25-price");
const spanP50Price = document.querySelector("#p50-price");
const spanLifetime = document.querySelector("#lifetime-value");
const spanBestDiscount = document.querySelector('#best-discount-filter'); // target the "By best discount" span by ID
const spanMostCommented = document.querySelector('#most-commented-filter');
const spanHotDeals = document.querySelector('#hot-deals-filter');
const selectSort = document.querySelector('#sort-select');
const sectionSales= document.querySelector('#sales');

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({result, meta}) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Set global value for sales
 * @param {Array} result - sales to display
 */
const setCurrentSales = ({result}) => {
  currentSales = result;
};

/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentDeals, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
};

/**
 * Fetch sales from API
 * @param  {Number}  [id=1] - current id to fetch
 * @return {Object} - sales data
 */
const fetchSales = async (id = 42182) => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/sales?id=${id}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentSales};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentSales};
  }
};

/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals
    .map(deal => {
      return `
      <div class="deal" id=${deal.uuid}>
        <span>${deal.id}</span>
        <a href="${deal.link}" target="_blank">${deal.title}</a> <!-- Open in new tab -->
        <span>${deal.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);
};
// <a href="${deal.link}">${deal.title}</a>

/**
 * Render list of sales
 * @param  {Array} sales
 */
const renderSales = sales => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = sales
    .map(sale => {
      return `
      <div class="sale" id=${sale.uuid}>
        <a href="${sale.link}" target="_blank">${sale.title}</a> <!-- Open in new tab -->
        <span>${sale.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionSales.innerHTML = '<h2>Vinted Sales</h2>';
  sectionSales.appendChild(fragment);
};
// <a href="${sale.link}">${sale.title}</a>

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;
};

/**
 * Render page selector + price indicators
 * @param  {Object} pagination
 * @param  {Object} indicators - { average, p5, p25, p50 }
 */
const renderIndicators = (pagination, { average, p5, p25, p50 }, lifetime) => {
  const {count} = pagination;

  spanNbDeals.innerHTML = count;
  spanNbSales.innerHTML = currentSales.length; // display current sales count

  // price indicators
  spanAvgPrice.innerHTML = average;
  spanP5Price.innerHTML = p5;
  spanP25Price.innerHTML = p25;
  spanP50Price.innerHTML = p50;

  // lifetime indicator
  spanLifetime.innerHTML = lifetime;
};

/**
 * Render price indicators
 * @param {Object} indicators - { average, p5, p25, p50 }
 
const renderPriceIndicators = ({ average, p5, p25, p50 }) => {
  spanAvgPrice.innerHTML = average;
  spanP5Price.innerHTML = p5;
  spanP25Price.innerHTML = p25;
  spanP50Price.innerHTML = p50;
};*/

const render = (deals, sales, pagination) => {
  renderDeals(deals);
  renderSales(sales);
  renderPagination(pagination);
  renderIndicators(pagination, calculatePriceIndicators(deals, sales), calculateLifetimeValue(sales));
  renderLegoSetIds(deals);
};

/**
 * Calculate average, p5, p25, and p50 values
 * @returns  {Object} - Calculated statistics
 */
const calculatePriceIndicators = (deals, sales) => {
  // add fetch prices
  // Combine prices from both deals and sales
  const dealPrices = deals.map((deal) => parseFloat(deal.price));
  const salePrices = sales.map((sale) => parseFloat(sale.price));
  const prices = [...dealPrices, ...salePrices];

  if (!prices.length) return { average: 0, p5: 0, p25: 0, p50: 0 };

  const sortedPrices = [...prices].sort((a, b) => a - b); // Sort prices ascending
  const average = (sortedPrices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2);

  const p5 = sortedPrices[Math.floor(0.05 * (prices.length - 1))].toFixed(2);
  const p25 = sortedPrices[Math.floor(0.25 * (prices.length - 1))].toFixed(2);
  const p50 = sortedPrices[Math.floor(0.5 * (prices.length - 1))].toFixed(2);

  return { average, p5, p25, p50 };
};

/**
 * Calculate the lifetime value for a set
 * @param {Array} sales - List of sales data
 * @returns {String} Lifetime value in days or "No sales" if no data
 */
const calculateLifetimeValue = (sales) => {
  if (sales.length === 0) {
    return "No sales"; // No sales data available
  }

  const dates = sales.map((sale) => new Date(sale.published));
  const earliestDate = new Date(Math.min(...dates));
  const latestDate = new Date(Math.max(...dates));

  const lifetimeInMs = latestDate - earliestDate; // Difference in milliseconds
  const lifetimeInDays = Math.ceil(lifetimeInMs / (1000 * 60 * 60 * 24)); // Convert to days

  return `${lifetimeInDays} days`;
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of deals to display
 */
selectShow.addEventListener('change', async (event) => {
  const deals = await fetchDeals(currentPagination.currentPage, parseInt(event.target.value));

  setCurrentDeals(deals);
  render(currentDeals, currentSales, currentPagination);

  const savedSetId = localStorage.getItem("selectedSetId");
  if (savedSetId) {
    // Set the select element to the saved value
    selectLegoSetIds.value = savedSetId;
  }
});

/**
 * Select the sales to display given the selected id set
 */
selectLegoSetIds.addEventListener("change", async (event) => {
  const selectedSetId = parseInt(event.target.value);
  const sales = await fetchSales(selectedSetId);

  // Store the selected value in localStorage
  localStorage.setItem("selectedSetId", selectedSetId);

  setCurrentSales(sales);
  render(currentDeals, currentSales, currentPagination);

  const savedSetId = localStorage.getItem("selectedSetId");
  if (savedSetId) {
    // Set the select element to the saved value
    selectLegoSetIds.value = savedSetId;
  }
});


/**
 * Select the page to display
 */
selectPage.addEventListener('change', async (event) => {
  const selectedPage = parseInt(event.target.value); // Get the selected page number
  const deals = await fetchDeals(selectedPage, currentPagination.pageSize); // Fetch deals for the selected page

  setCurrentDeals(deals); // Update global state
  render(currentDeals, currentSales, currentPagination); // Re-render the UI

  const savedSetId = localStorage.getItem("selectedSetId");
  if (savedSetId) {
    // Set the select element to the saved value
    selectLegoSetIds.value = savedSetId;
  }
});

/**
 * Select the best discount (>50%) to display
 */
spanBestDiscount.addEventListener('click', () => {
  const filteredDeals = currentDeals.filter(deal => deal.discount > 50);

  setCurrentDeals({result: filteredDeals, meta: currentPagination});
  render(filteredDeals, currentSales, currentPagination);

  const savedSetId = localStorage.getItem("selectedSetId");
  if (savedSetId) {
    // Set the select element to the saved value
    selectLegoSetIds.value = savedSetId;
  }
});

/**
 * Select the current deals with more than 15 comments
 */
spanMostCommented.addEventListener('click', () => {
  const filteredDeals = currentDeals.filter(deal => deal.comments > 15); // With 15 we don't get any deal, however with 3+ it works fine

  setCurrentDeals({result: filteredDeals, meta: currentPagination});
  render(filteredDeals, currentSales, currentPagination);

  const savedSetId = localStorage.getItem("selectedSetId");
  if (savedSetId) {
    // Set the select element to the saved value
    selectLegoSetIds.value = savedSetId;
  }
});

/**
 * Select the current deals with a temperature greater than 100
 */
spanHotDeals.addEventListener('click', () => {
  const filteredDeals = currentDeals.filter(deal => deal.temperature > 100);

  setCurrentDeals({result: filteredDeals, meta: currentPagination});
  render(filteredDeals, currentSales, currentPagination);

  const savedSetId = localStorage.getItem("selectedSetId");
  if (savedSetId) {
    // Set the select element to the saved value
    selectLegoSetIds.value = savedSetId;
  }
});

/**
 * Sort for cheap and expensive
 */
selectSort.addEventListener('change', () => {
  const sortValue = selectSort.value;
  const sortedDeals = [...currentDeals].sort((a, b) => {
    if (sortValue === 'price-asc') {
      return a.price - b.price; // ascending price
    } else if (sortValue === 'price-desc') {
      return b.price - a.price; // descending price
    }
    return 0; // Default case (no sorting)
  });

  setCurrentDeals({result: sortedDeals, meta: currentPagination});
  render(sortedDeals, currentSales, currentPagination);

  const savedSetId = localStorage.getItem("selectedSetId");
  if (savedSetId) {
    // Set the select element to the saved value
    selectLegoSetIds.value = savedSetId;
  }
});

/**
 * Sort for cheap and expensive
 */
selectSort.addEventListener('change', () => {
  const sortValue = selectSort.value;
  const sortedDeals = [...currentDeals].sort((a, b) => {
    if (sortValue === 'date-asc') {
      return a.published - b.published; // ascending date
    } else if (sortValue === 'date-desc') {
      return b.published - a.published; // descending date
    }
    return 0; // Default case (no sorting)
  });

  setCurrentDeals({result: sortedDeals, meta: currentPagination});
  render(sortedDeals, currentSales, currentPagination);

  const savedSetId = localStorage.getItem("selectedSetId");
  if (savedSetId) {
    // Set the select element to the saved value
    selectLegoSetIds.value = savedSetId;
  }
});

/**
 * Combine all sort selects
 */
/*
selectSort.addEventListener('change', () => {
  const sortValue = selectSort.value;
  const sortedDeals = [...currentDeals].sort((a, b) => {
    if (sortValue === 'price-asc') {
      return a.price - b.price; // ascending price
    } else if (sortValue === 'price-desc') {
      return b.price - a.price; // descending price
    } else if (sortValue === 'date-asc') {
      return new Date(a.date) - new Date(b.date); // ascending date
    } else if (sortValue === 'date-desc') {
      return new Date(b.date) - new Date(a.date); // descending date
    }
    return 0; // Default case (no sorting)
  });

  setCurrentDeals({result: sortedDeals, meta: currentPagination});
  render(sortedDeals, currentPagination);
});
*/

document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();
  const sales = await fetchSales();

  setCurrentDeals(deals);
  setCurrentSales(sales);
  render(currentDeals, currentSales, currentPagination);
  const savedSetId = localStorage.getItem("selectedSetId");
  if (savedSetId) {
    // Set the select element to the saved value
    selectLegoSetIds.value = savedSetId;
  }
});
