'use strict';




let currentDeals = [];
let currentSales = [];

// const selectShow = document.querySelector('#show-select');
// const selectPage = document.querySelector('#page-select');

const selectLegoSet = document.querySelector('#selector-lego-set');
const selectSortBy = document.querySelector('#selector-sort-by');

const priceSlider = document.querySelector('#max-price-value');

// overall-best
const filterBtns = {
  popular: document.getElementById("filter-btn-popular"),
  hot: document.getElementById("filter-btn-hot"),
  discount: document.getElementById("filter-btn-best-discount"),
  favorites: document.getElementById("filter-btn-favorites"),
  clear: document.getElementById("filter-btn-clear-all")
};

const pTotalDeals = document.querySelector('#total-deals');
const pActiveSales = document.querySelector('#active-sales');
const pP5Price = document.querySelector("#p5-percentile");
const pMedianPrice = document.querySelector("#median-price");
const pLifetime = document.querySelector("#avg-lifetime");

const divDeals= document.querySelector('#deals-container');
// const divSales= document.querySelector('#sales');




/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({result}) => {
  currentDeals = result;
};

/**
 * Set global value for sales
 * @param {Array} result - sales to display
 */
const setCurrentSales = ({result}) => {
  currentSales = result;
};




/**
 * Fetch deals from custom API with optional filters
 * @param {Object} filters - Optional filters to apply
 * @param {string} [filters.price] - Price filter (e.g., '>50', '<100', '89.99')
 * @param {string} [filters.filterBy] - Sorting/filter flags (e.g., 'best-discount,price-asc')
 * @param {number} [filters.limit] - Max number of results (default: 35)
 * @param {string} [filters.legoSetId] - LEGO set ID to filter by
 * @returns {Promise<Array>} - Array of deals from the API
 */
const fetchDeals = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    // Build the query string dynamically
    if (filters.price) params.append('price', filters.price);
    if (filters.filterBy) params.append('filterBy', filters.filterBy);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.legoSetId && filters.legoSetId !== 'all') {
      params.append('legoSetId', filters.legoSetId);
    }

    // Debug
    const url = `https://lego-deemd.vercel.app/deals/search?${params.toString()}`;
    console.log('Requesting URL:', url);
    
    const response = await fetch(url);

    // Debug
    if (!response.ok) {
      throw new Error(`API Error (fetching deals): ${response.statusText}`);
    }

    const data = await response.json();

    // Debug
    console.log('API Response:', data); 

    // Vérification de la structure de la réponse
    if (!data || !data.results || !Array.isArray(data.results)) {
      console.error('❌ La clé "results" n\'est pas présente ou n\'est pas un tableau.');
      return [];  // Retourne un tableau vide si la structure est incorrecte
    }

    console.log('Deals récupérés:', data.results.length); // Affiche le nombre de deals récupérés

    // Si aucun deal n'est trouvé, on retourne un tableau vide
    if (data.results.length === 0) {
      console.log("Aucune offre disponible.");
      return [];
    }

    // Debug
    console.log('data.results:', data.results); 

    return data.results;
  } catch (error) {
    console.error('❌ fetchDeals failed:', error);
    alert("Une erreur est survenue lors de la récupération des offres. Veuillez réessayer plus tard.");
    return [];
  }
};


/**
 * Fetch sales from API
 * @param  {Number}  [id=1] - current id to fetch
 * @return {Object} - sales data
 */
const fetchSales = async (id = 60337) => {
  try {
    const response = await fetch(`https://lego-deemd.vercel.app/sales/search?legoSetId=${id}`);
    const body = await response.json();

    if (!body || !body.results) {
      console.error(body);
      return { result: [] };
    }

    // Format dates
    const sales = body.results.map(sale => {
      let publishedDate = new Date(sale.published);
      if (isNaN(publishedDate)) {
        publishedDate = new Date(); // fallback
      }
      return {
        ...sale,
        published: publishedDate
      };
    });

    return { result: sales };
  } catch (error) {
    console.error(error);
    return { result: [] };
  }
};

/**
 * Fetch price indicators from custom API
 * @param {Number} id
 * @returns {Object} - { average, p5, p25, p50 }
 */
const fetchPriceIndicators = async (id) => {
  try {
    const res = await fetch(`https://lego-deemd.vercel.app/sales/${id}/price-indicators`);
    const data = await res.json();
    return data; // { average: "100.94", p5: "7.53", p25: "26.95", p50: "126.70" }
  } catch (error) {
    console.error(`Erreur fetch price indicators pour ID ${id}`, error);
    return { average: 0, p5: 0, p25: 0, p50: 0 };
  }
};

/**
 * Fetch lifetime value from custom API
 * @param {Number} id
 * @returns {String}
 */
const fetchLifetimeValue = async (id) => {
  try {
    const res = await fetch(`https://lego-deemd.vercel.app/sales/${id}/lifetime-value`);
    const data = await res.json();
    return data?.lifetimeValue || 'N/A'; // ex: "1 days"
  } catch (error) {
    console.error(`Erreur fetch lifetime value pour ID ${id}`, error);
    return 'N/A';
  }
};




// renderPagination : for now no pagination => not using api, but manually yes

/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = (deals) => {
  if (!Array.isArray(deals)) {
    console.log("Aucun tableau retourné par fetchDeals. Valeur:", deals);
    return; // Si ce n'est pas un tableau, on arrête l'exécution.
  }

  if (deals.length === 0) {
    console.log("Aucune offre à afficher.");
    return; // Si il n'y a aucune offre, on arrête.
  }

  const container = document.getElementById('deals-container');
  container.innerHTML = ''; // Reset au cas où

  deals.forEach(deal => {
    const {
      id,
      title,
      price,
      discount,
      comments,
      temperature,
      photo,
    } = deal;

    const dealCard = document.createElement('div');
    dealCard.className = 'deal-card';

    dealCard.innerHTML = `
      <div class="deal-header">
        <h3 class="deal-title">${title}</h3>
        <button class="heart-btn"><i class="far fa-heart"></i></button>
      </div>

      <img src="${photo}" alt="LEGO Set" class="deal-image">
      
      <div class="info-grid">
        <div class="info-box">
          <div class="info-label">SET ID</div>
          <div class="info-value">${id}</div>
        </div>
        <div class="info-box">
          <div class="info-label">PRICE</div>
          <div class="info-value">€${price}</div>
        </div>
        <div class="info-box">
          <div class="info-label">DISCOUNT</div>
          <div class="info-value">${discount}%</div>
        </div>
        <div class="info-box">
          <div class="info-label">COMMENTS</div>
          <div class="info-value">${comments}</div>
        </div>
        <div class="info-box full-width">
          <div class="info-label">TEMPERATURE</div>
          <div class="info-value">${temperature.toFixed(2)}°C</div>
        </div>
      </div>

      <a href="${deal.link}" target="_blank" class="see-deal-btn">See Deal</a>
    `;

    container.appendChild(dealCard);
  });
};

/**
 * Render LEGO set ID selector (from deals)
 * @param  {Array} deals - Array of deal objects
 */
const renderSelectorLegoSet = (deals) => {
  const ids = [...new Set(deals.map(deal => deal.id))]; // Only uniques
  const options = [
    `<option value="all">All sets</option>`, // Default option
    ...ids.map(id => `<option value="${id}">${id}</option>`) // Other options
  ].join('');

  selectLegoSet.innerHTML = options;
};

/**
 * Render price indicators and sales lifetime info
 * @param  {Object} indicators - { average, p5, p25, p50 }
 * @param  {String} lifetime - string like "1 days"
 */
const renderIndicators = (indicators, lifetime) => {
  const { average, p5, p25, p50 } = indicators;
  pP5Price.innerHTML = `$${p5}`;
  pMedianPrice.innerHTML = `$${p50}`;
  pLifetime.innerHTML = lifetime;
  pTotalDeals.innerHTML = currentDeals.length || 0;
  pActiveSales.innerHTML = currentSales.length;  
};

/**
 * Global rendering
 */
const render = (deals, indicators, lifetime) => {
  console.log('Paramètres de render:', { deals, indicators, lifetime });

  if (!deals || deals.length === 0) {
    console.log('render: Aucune offre disponible à afficher.');
    return;
  }
  renderDeals(deals);
  // renderSales(sales);
  renderSelectorLegoSet(deals);
  renderIndicators(indicators, lifetime);
};




const toggleFilter = (filterName) => {
  const activeFilters = JSON.parse(localStorage.getItem("activeFilters")) || [];
  if (activeFilters.includes(filterName)) {
    activeFilters.splice(activeFilters.indexOf(filterName), 1);
  } else {
    activeFilters.push(filterName);
  }
  localStorage.setItem("activeFilters", JSON.stringify(activeFilters));
  fetchAndDisplayDeals();
};

const clearAllFilters = () => {
  localStorage.setItem("activeFilters", JSON.stringify([]));
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  fetchAndDisplayDeals();
};

const fetchAndDisplayDeals = async () => {
  const activeFilters = JSON.parse(localStorage.getItem("activeFilters")) || [];
  const maxPrice = localStorage.getItem("maxPrice") || 200;
  const selectedSetId = localStorage.getItem("selectedSetId") || "all";
  const sortBy = localStorage.getItem("sortBy") || "Newest First";

  const filterByMap = {
    "Newest First": "date-new",
    "Oldest First": "date-old",
    "Cheaper First": "price-asc",
    "Expensive First": "price-desc"
  };

  const filterByList = [filterByMap[sortBy]];
  if (activeFilters.includes("popular")) filterByList.push("most-commented");
  if (activeFilters.includes("hot")) filterByList.push("best-temperature");
  if (activeFilters.includes("discount")) filterByList.push("best-discount");

  const filters = {
    filterBy: filterByList.join(","),
    price: `<${maxPrice}`
  };

  if (selectedSetId !== "all") {
    filters.legoSetId = selectedSetId;
  }

  // Log avant de récupérer les données
  console.log('Fetching deals avec les filtres:', filters);

  const deals = await fetchDeals(filters);

  // Vérification des données
  console.log('Deals récupérés:', deals); // Log détaillé pour afficher la valeur exacte de 'deals'

  // Vérifier que des offres ont été récupérées
  if (deals.length === 0) {
    console.log("Aucune offre trouvée.");
    // Afficher un message d'alerte ou un message vide dans l'UI si besoin
    return;
  }

  console.log("Offres récupérées:", deals.length); // Log du nombre de deals récupérés

  const [indicators, lifetime] = await Promise.all([
    fetchPriceIndicators(selectedSetId),
    fetchLifetimeValue(selectedSetId)
  ]);

  setCurrentDeals(deals);
  render(deals, indicators, lifetime);
  updateFilterUI();
};

const updateFilterUI = () => {
  const activeFilters = JSON.parse(localStorage.getItem("activeFilters")) || [];
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (activeFilters.includes(btn.id.split('-')[2])) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
};

selectLegoSet.addEventListener("change", fetchAndDisplayDeals);
selectSortBy.addEventListener("change", fetchAndDisplayDeals);

filterBtns.popular.addEventListener('click', () => toggleFilter("popular"));
filterBtns.hot.addEventListener('click', () => toggleFilter("hot"));
filterBtns.discount.addEventListener('click', () => toggleFilter("discount"));
filterBtns.favorites.addEventListener('click', () => toggleFilter("favorites"));
filterBtns.clear.addEventListener('click', clearAllFilters);

//document.addEventListener("DOMContentLoaded", () => {
window.onload = () => {
  console.log("Page complètement chargée");
  // Afficher ce qui est stocké dans le localStorage
  console.log("selectedSetId dans localStorage:", localStorage.getItem("selectedSetId"));
  console.log("Sort By dans localStorage:", localStorage.getItem("sortBy"));  // Ajouter un log pour inspecter la valeur dans le localStorage
  

  const savedSetId = localStorage.getItem("selectedSetId") || "all";
  if (savedSetId) selectLegoSet.value = savedSetId;

  selectSortBy.value = localStorage.getItem("sortBy") || "Newest First";
  console.log("Sort By sélectionné:", selectSortBy.value); // Log pour vérifier la valeur sélectionnée

  priceSlider.value = localStorage.getItem("maxPrice") || 200;
  document.getElementById("max-price-value").innerText = `€${priceSlider.value}`;

  updateFilterUI();
  fetchAndDisplayDeals();
};
//});







