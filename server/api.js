const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const {
  connectDB,
  findBestDiscountDeals, 
  findMostCommentedDeals, 
  findBestTemperatureDeals,
  findDealsSortedByPriceAsc, 
  findDealsSortedByPriceDesc, 
  findDealsSortedByDateOld, 
  findDealsSortedByDateNew,
  findDealById,
  findDealsByFilters,
  findSalesByLegoSetId,
  calculateLifetimeValue,
  calculatePriceIndicators
} = require('./mongo');

const PORT = 8092;
const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());


/* ******************************************************** TEST ? ********************************************************* */


// Middleware pour activer CORS sur toutes les routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Autorise toutes les origines (tu peux aussi spécifier une origine spécifique)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Méthodes autorisées
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Headers autorisés
  if (req.method === 'OPTIONS') {
    res.status(204).end(); // Répondre directement au preflight avec un status 204
    return;
  }
  next();
});



/* ******************************************************** DEFAULT ********************************************************* */


/**
 * Default response
 */
app.get('/', (request, response) => {
  response.send({ 'ack': true });
});




/* ******************************************************** DEALS ********************************************************* */


/**
 * GET /deals/:id - Retrieve a deal by ID
 */
app.get('/deals/:id', async (req, res) => {
  try {
    const deal = await findDealById(req.params.id);

    if (!deal) return res.status(404).json({ error: "Deal not found" });
    
    res.json(deal);
  } catch (error) {
    console.error(`Error fetching deal with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * GET /deals/:legoSetId - Retrieve deals by Lego Set ID
 */
app.get('/deals/:legoSetId', async (req, res) => {
  try {
    const deal = await findDealById(req.params.id);

    if (!deal) return res.status(404).json({ error: "Deal not found" });
    
    res.json(deal);
  } catch (error) {
    console.error(`Error fetching deal with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


/**
 * Path to retrieve best discounts
 */
app.get('/deals/best-discount', async (req, res) => {
  try {
    const deals = await findBestDiscountDeals();
    res.json(deals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * Path to retrieve most commented
 */
app.get('/deals/most-commented', async (req, res) => {
  try {
    const deals = await findMostCommentedDeals();
    res.json(deals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * Path to retrieve deals sorted by price (ASC)
 */
app.get('/deals/sort/price-asc', async (req, res) => {
  try {
    const deals = await findDealsSortedByPriceAsc();
    res.json(deals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * Path to retrieve deals sorted by price (DESC)
 */
app.get('/deals/sort/price-desc', async (req, res) => {
  try {
    const deals = await findDealsSortedByPriceDesc();
    res.json(deals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * Path to retrieve deals sorted by date (OLD)
 */
app.get('/deals/sort/date-old', async (req, res) => {
  try {
    const deals = await findDealsSortedByDateOld();
    res.json(deals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


/**
 * Path to retrieve deals sorted by date (NEW)
 */
app.get('/deals/sort/date-new', async (req, res) => {
  try {
    const deals = await findDealsSortedByDateNew();
    res.json(deals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});




/* ***************************************************** DEALS COMBINE ****************************************************** */


app.get('/deals/search', async (req, res) => {
  try {
    const { filterBy } = req.query; // , limit = 12 

    // Si aucun filtre n'est spécifié, récupérer tous les deals par défaut
    if (!filterBy) {
      const defaultDeals = await findDealsByFilters([]); // , limit
      return res.json(defaultDeals);
    }

    // Découper les filtres s'il y en a plusieurs (ex: best-discount,most-commented)
    const filters = filterBy.split(',');

    // Vérifier si les filtres sont valides
    const validFilters = ['best-discount', 'most-commented', 'best-temperature', 'price-asc', 'price-desc', 'date-new', 'date-old'];
    const invalidFilters = filters.filter(f => !validFilters.includes(f));
    
    if (invalidFilters.length > 0) {
      return res.status(400).json({ error: `Filtres invalides : ${invalidFilters.join(', ')}` });
    }

    // Appeler la fonction MongoDB avec les filtres
    const deals = await findDealsByFilters(filters); // , limit
    res.json({ total: deals.length, results: deals }); // limit, 

  } catch (error) {
    console.error("❌ Erreur API /deals/search :", error);
    res.status(500).json({ error: "Internal server error" });
  }
});




/* ******************************************************** SALES ********************************************************* */


/**
 * Path to retrieve price indicators on sales
 */
app.get('/sales/:id/price-indicators', async (req, res) => {
  try {
      const { id } = req.params; // Récupérer l'ID du set LEGO depuis l'URL

      // Appeler la fonction pour calculer les indicateurs de prix
      const priceIndicators = await calculatePriceIndicators(id);

      res.json(priceIndicators);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});


/**
 * Path to retrieve sales lifetime
 */
app.get('/sales/:id/lifetime-value', async (req, res) => {
  try {
      const { id } = req.params; // Récupérer l'ID du set LEGO depuis l'URL

      // Appeler la fonction pour calculer la durée de vie des ventes
      const lifetimeValue = await calculateLifetimeValue(id);

      res.json({ lifetimeValue });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});


/* ***************************************************** SALES COMBINE ****************************************************** */


/*
 * GET /sales/search - Search for specific sales given a Lego Set ID
 */
app.get('/sales/search', async (req, res) => {
  try {
    // Debug
    console.log('--- Début de la requête /sales/search --- ');

    const { legoSetId } = req.query; // , limit = 12 

    // Vérifier que l'ID est fourni
    if (!legoSetId) {
      return res.status(400).json({ error: "legoSetId est requis" });
    }

    // Debug
    console.log(`Params reçus : legoSetId=${legoSetId}`);

    // Récupérer les ventes correspondant à cet ID
    const sales = await findSalesByLegoSetId(legoSetId); // , limit

    // Debug
    console.log(`Nombre de résultats trouvés : ${sales.length}`);
    if (sales.length === 0) {
      console.log('Aucun résultat trouvé');
      return res.status(404).json({ error: 'Aucune vente trouvée' });
    }

    res.json({ total: sales.length, results: sales }); // limit, 

  } catch (error) {
    console.error("❌ Erreur API /sales/search :", error);
    res.status(500).json({ error: "Internal server error" });
  }
});












// Lancer le serveur et connecter à MongoDB
async function startServer() {
  try {
    await connectDB(); // Connexion à MongoDB

    app.listen(PORT, () => {
      console.log(`📡 Running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1); // Quitter en cas d'erreur de connexion
  }
}

startServer(); // Lancer le serveur








/*

  ** DYNAMIC **
  PAST SALES = count for a legoId (on sales) => FRONT JS
  AVG, Q5, Q25, MEDIAN = calculatePriceIndicators (on sales) => BACK API
  AVG LIFETIME = calculateLifetimeValue (on sales) => BACK API

  ** FILTER **
  DISCOUNT = best-discount (on deals)                           ** /deals/search/discount
  POPULAR = most-commented + most-favorite (on deals)           ** /deals/search/popular
  HOT = best-temperature (on deals)                             ** /deals/search/hot
  ( FAVORITE by front ) 

*/