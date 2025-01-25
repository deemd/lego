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
        <a href="${deal.link}">${deal.title}</a>
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
        <a href="${sale.link}">${sale.title}</a>
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
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbDeals.innerHTML = count;
  spanNbSales.innerHTML = currentSales.length; // display current sales count
};

const render = (deals, sales, pagination) => {
  renderDeals(deals);
  renderSales(sales);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals);
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
});

/**
 * Select the sales to display given the selected id set
 */
selectLegoSetIds.addEventListener("change", async (event) => {
  const sales = await fetchSales(parseInt(event.target.value));

  setCurrentSales(sales);
  render(currentDeals, currentSales, currentPagination);
});


/**
 * Select the page to display
 */
selectPage.addEventListener('change', async (event) => {
  const selectedPage = parseInt(event.target.value); // Get the selected page number
  const deals = await fetchDeals(selectedPage, currentPagination.pageSize); // Fetch deals for the selected page

  setCurrentDeals(deals); // Update global state
  render(currentDeals, currentSales, currentPagination); // Re-render the UI
});

/**
 * Select the best discount (>50%) to display
 */
spanBestDiscount.addEventListener('click', () => {
  const filteredDeals = currentDeals.filter(deal => deal.discount > 50);

  setCurrentDeals({result: filteredDeals, meta: currentPagination});
  render(filteredDeals, currentSales, currentPagination);
});

/**
 * Select the current deals with more than 15 comments
 */
spanMostCommented.addEventListener('click', () => {
  const filteredDeals = currentDeals.filter(deal => deal.comments > 15); // With 15 we don't get any deal, however with 3+ it works fine

  setCurrentDeals({result: filteredDeals, meta: currentPagination});
  render(filteredDeals, currentSales, currentPagination);
});

/**
 * Select the current deals with a temperature greater than 100
 */
spanHotDeals.addEventListener('click', () => {
  const filteredDeals = currentDeals.filter(deal => deal.temperature > 100);

  setCurrentDeals({result: filteredDeals, meta: currentPagination});
  render(filteredDeals, currentSales, currentPagination);
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
});
