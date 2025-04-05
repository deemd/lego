const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const {
  connectDB,
  findDealBySpecId,
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




/**
 * Middleware to activate CORS for every paths
 * Enables CORS for all routes, allowing any origin to access the API with specific methods and headers.
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allowed methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allowed headers
  if (req.method === 'OPTIONS') {
    res.status(204).end(); // Answer directly to preflight with 204 status
    return;
  }
  next();
});




/**
 * GET / - Default response
 * Simple endpoint that returns an acknowledgment response to check if the server is running.
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
app.get('/', (req, res) => {
  res.send({ 'ack': true });
});




/**
 * GET /deals/search - Search for specific deals or return all
 * Searches deals based on provided filters like price, filter criteria, and LEGO set ID.
 * @param {Object} req - Request object with query parameters
 * @param {Object} res - Response object with search results
 */
app.get('/deals/search', async (req, res) => {
  try {
    // Debug
    console.log('--- Begin /deals/search request ---');

    const { price, filterBy, limit, legoSetId } = req.query;

    // Debug
    console.log(`Params received: price=${price}, filterBy=${filterBy}, limit=${limit}, legoSetId=${legoSetId}`);

    const deals = await findDealsByFilters({ price, filterBy, limit, legoSetId });

    // Debug
    console.log(`Number of deals found: ${deals.length}`);
    // console.log(deals);

    if (!deals || deals.length === 0) {
      return res.status(404).json({ error: 'No deal found' });
    }

    res.json({
      limit: parseInt(limit) || 35,
      total: deals.length,
      results: deals
    });
  } catch (error) {
    console.error("❌ Error API /deals/search :", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /deals/:id - Retrieve a deal by ID
 * Fetches a specific deal using its unique MongoDB ID.
 * @param {Object} req - Request object with deal ID
 * @param {Object} res - Response object with the deal details
 */
app.get('/deals/:id', async (req, res) => {
  try {
    const deal = await findDealBySpecId(req.params.id);

    if (!deal) return res.status(404).json({ error: "Deal not found" });
    
    res.json(deal);
  } catch (error) {
    console.error(`Error fetching deal with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




/**
 * GET /sales/:id/price-indicators - Retrieve price indicators on sales
 * Returns price indicators for a specific LEGO set sale.
 * @param {Object} req - Request object with LEGO set ID
 * @param {Object} res - Response object with price indicators
 */
app.get('/sales/:id/price-indicators', async (req, res) => {
  try {
      const { id } = req.params; // Retrieve LEGO SET ID from URL

      const priceIndicators = await calculatePriceIndicators(id);

      res.json(priceIndicators);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

/**
 * GET /sales/:id/lifetime-value - Retrieve sales lifetime
 * Returns the lifetime value (history) of a specific LEGO set sale.
 * @param {Object} req - Request object with LEGO set ID
 * @param {Object} res - Response object with lifetime value
 */
app.get('/sales/:id/lifetime-value', async (req, res) => {
  try {
      const { id } = req.params; // Retrieve LEGO SET ID from URL

      const lifetimeValue = await calculateLifetimeValue(id);

      res.json({ lifetimeValue });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

/**
 * GET /sales/search - Search for specific sales given a Lego Set ID
 * Searches sales for a specific LEGO set based on its ID.
 * @param {Object} req - Request object with LEGO set ID
 * @param {Object} res - Response object with sales data
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




/**
 * Launch server and connect to MongoDB
 */
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

startServer(); // Launch server