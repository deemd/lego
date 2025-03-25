const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const {
  connectDB,
  closeDB, 
  findBestDiscountDeals, 
  findMostCommentedDeals, 
  findBestTemperatureDeals,
  findDealsSortedByPriceAsc, 
  findDealsSortedByPriceDesc, 
  findDealsSortedByDateOld, 
  findDealsSortedByDateNew,
  findDealById,
  findSalesByLegoSetId,
  findRecentSales
} = require('./mongo');

const PORT = 8092;
const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());


/**
 * Default response
 */
app.get('/', (request, response) => {
  response.send({ 'ack': true });
});


/**
 * Retrieve a deal by ID
 */
app.get('/deals/:id', async (req, res) => {
  try {
    const deal = await findDealById(req.params.id);
    if (!deal) return res.status(404).json({ error: "Deal not found" });
    res.json(deal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
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













/* ******************************************************** DYNAMIC ********************************************************* */


/**
 * Path to retrieve price indicators on sales
 */
app.get('/lego/:legoSetId/price-indicators', async (req, res) => {
  try {
      const { legoSetId } = req.params; // Récupérer l'ID du set LEGO depuis l'URL

      // Appeler la fonction pour calculer les indicateurs de prix
      const priceIndicators = await calculatePriceIndicators(legoSetId);

      res.json(priceIndicators);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});


/**
 * Path to retrieve sales lifetime
 */
app.get('/lego/:legoSetId/lifetime-value', async (req, res) => {
  try {
      const { legoSetId } = req.params; // Récupérer l'ID du set LEGO depuis l'URL

      // Appeler la fonction pour calculer la durée de vie des ventes
      const lifetimeValue = await calculateLifetimeValue(legoSetId);

      res.json({ lifetimeValue });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});










app.listen(PORT);
console.log(`📡 Running on port ${PORT}`);








// app.listen(PORT, async () => {
//   await connectDB(); // On s'assure que MongoDB est connecté au lancement du serveur
//   console.log(`📡 Running on port ${PORT}`);
// });








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