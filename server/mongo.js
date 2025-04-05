const { scrapeDealabs, scrapeVinted } = require('./sandbox'); // Scraping
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = 'mongodb+srv://heloiserobin:kp8OJ7GkYKAMLfo1@cluster0.du33m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGODB_DB_NAME = 'lego';

let client;
let db;




/**
 * Open connection to MongoDB database
 * Establishes a connection to MongoDB using the provided URI and database name.
 * @returns {Object} - The database connection object.
 */
const connectDB = async () => {
    if (!client) {
        client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        db = client.db(MONGODB_DB_NAME);
        console.log('✅ Connected to MongoDB');
    }
    return db;
};

/**
 * Close connection to MongoDB database
 * Closes the MongoDB connection and clears the client and database references.
 */
const closeDB = async () => {
    if (client) {
        await client.close();
        console.log('✅ MongoDB connection closed');
        client = null;
        db = null;
    }
};

/**
 * Insert deals from DEALABS
 * Inserts a batch of scraped DEALABS deals into the 'deals' collection after filtering out invalid ones.
 * @param {String} deals - JSON array of scraped deals.
 */
const insertDeals = async (deals) => {
    const db = await connectDB();
    const collection = db.collection('deals');

    // Delete old deals and insert new
    await collection.deleteMany({});

    // Only insert valid deals
    const validDeals = deals.filter(deal => deal.id !== null && deal.id !== undefined);
    const result = await collection.insertMany(validDeals);

    // Debug
    console.log(result);
};

/**
 * Insert deals from VINTED
 * Inserts a batch of scraped VINTED sales data into the 'sales' collection.
 * @param {String} sales - JSON array of scraped sales.
 */
const insertSales = async (sales) => {
    const db = await connectDB();
    const collection = db.collection('sales');

    // Delete old sales and insert new
    // await collection.deleteMany({});
    const result = await collection.insertMany(sales);

    // Debug
    console.log(result);
};




/**
 * Find deals based on filters
 * Searches for deals with optional filters like price range, LEGO set ID, and sort criteria.
 * @param {Object} params - The query parameters for filtering and sorting.
 * @param {String} params.price - Price filter (e.g., '>', '<', or exact price).
 * @param {String} params.filterBy - Sorting filter (e.g., 'best-discount', 'price-asc').
 * @param {Number} params.limit - The number of results to return (default 35).
 * @param {String} params.legoSetId - LEGO set ID to filter deals by.
 * @returns {Array} - Array of deals matching the filters.
 */
const findDealsByFilters = async ({ price, filterBy, limit = 35, legoSetId }) => {
    const db = await connectDB();
    const collection = db.collection('deals');
  
    const query = {};
    const sort = {};
  
    // --- Filter by price
    if (price) {
      if (price.startsWith('>')) {
        query.price = { $gt: parseFloat(price.slice(1)) };
      } else if (price.startsWith('<')) {
        query.price = { $lt: parseFloat(price.slice(1)) };
      } else {
        query.price = parseFloat(price);
      }
    }
  
    // --- Filter by LEGO set ID
    if (legoSetId) {
      query.id = legoSetId;
    }
  
    // --- Sort by filterBy (multi-filters allowed, split by ',')
    if (filterBy) {
        const filters = filterBy.split(',');
    
        if (filters.includes('best-discount')) {
        sort.discount = -1;
        }
        if (filters.includes('most-commented')) {
        sort.comments = -1;
        }
        if (filters.includes('best-temperature')) {
        sort.temperature = -1;
        }
        if (filters.includes('price-asc')) {
        sort.price = 1;
        }
        if (filters.includes('price-desc')) {
        sort.price = -1;
        }
        if (filters.includes('date-new')) {
        sort.published = -1;
        }
        if (filters.includes('date-old')) {
        sort.published = 1;
        }
    }
  
    // Default sort
    if (Object.keys(sort).length === 0) {
        sort.published = -1;
    }
  
    // Debug (request params)
    console.log('Query:', JSON.stringify(query, null, 2));
    console.log('Sort:', JSON.stringify(sort, null, 2));
  
    // --- MongoDB request execution
    const results = await collection
      .find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .toArray();
  
    return results;
  };

/**
 * Find a deal by SPEC-ID
 * Retrieves a specific deal from the database using its unique SPEC-ID.
 * @param {String} id - The unique identifier of the deal (SPEC-ID).
 * @returns {Object|null} - The deal document if found, or null if no deal matches the provided SPEC-ID.
 */
const findDealBySpecId = async (id) => {
    const db = await connectDB();
    const deal = await db.collection('deals')
    .findOne({ _id: new ObjectId(id) });
    // console.log(deal);
    return deal;
};
  



/**
 * Calculate price indicators (average, p5, p25, p50)
 * Calculates various price statistics (average, p5, p25, p50) for sales of a given LEGO set.
 * @param {String} legoSetId - LEGO set ID to calculate price indicators for.
 * @returns {Object} - Price indicators (average, p5, p25, p50).
 */
const calculatePriceIndicators = async (legoSetId) => {
    const db = await connectDB();
    const salesCollection = db.collection('sales');

    const sales = await salesCollection.find({ id:legoSetId }).toArray();

    if (!sales.length) return { average: 0, p5: 0, p25: 0, p50: 0 };

    const prices = sales.map((sale) => parseFloat(sale.price));

    const sortedPrices = [...prices].sort((a, b) => a - b); // Sort price

    const average = (sortedPrices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2);
    const p5 = sortedPrices[Math.floor(0.05 * (prices.length - 1))].toFixed(2);
    const p25 = sortedPrices[Math.floor(0.25 * (prices.length - 1))].toFixed(2);
    const p50 = sortedPrices[Math.floor(0.5 * (prices.length - 1))].toFixed(2);

    return { average, p5, p25, p50 };
};

/**
 * Calculate sales lifetime
 * Calculates the duration between the earliest and latest sale for a given LEGO set.
 * @param {String} legoSetId - LEGO set ID to calculate the sales lifetime for.
 * @returns {String} - The lifetime in days or an error message if no sales found.
 */
const calculateLifetimeValue = async (legoSetId) => {
    const db = await connectDB();
    const sales = await db.collection('sales').find({ id: legoSetId }).toArray();
  
    if (sales.length === 0) {
      return "No sales";
    }
  
    const dates = sales
      .map((sale) => new Date(sale.published))
      .filter((d) => d !== null);
  
    if (dates.length === 0) {
      return "Invalid date format in sales data";
    }
  
    const earliestDate = new Date(Math.min(...dates));
    const latestDate = new Date(Math.max(...dates));
  
    const lifetimeInMs = latestDate - earliestDate;
    const lifetimeInDays = Math.ceil(lifetimeInMs / (1000 * 60 * 60 * 24));
  
    return `${lifetimeInDays} days`;
};

/**
 * Find sales by LEGO set ID
 * Retrieves sales for a given LEGO set ID, sorted by the most recent sale.
 * @param {String} legoSetId - The LEGO set ID to search sales for.
 * @returns {Array} - Array of sales matching the LEGO set ID.
 */
const findSalesByLegoSetId = async (legoSetId) => { // , limit = 12
    const db = await connectDB();

    const results = await db.collection('sales')
        .find({ id: legoSetId })
        .sort({ published: -1 })
        //.limit(parseInt(limit))
        .toArray();

    return results;
};




/**
 * Scraping + MongoDB Pipeline
 * Executes a full scraping pipeline: scraping DEALABS deals, inserting them into MongoDB, scraping VINTED sales, and inserting them.
 * @returns {void}
 */
const runPipeline = async () => {
    try {
        console.log("Launching pipeline...");

        // 1) Connection to MongoDB
        db = await connectDB();

        // 2) Scraping Dealabs (deals + JSON)
        console.log("Scraping Dealabs deals...");
        const deals = await scrapeDealabs();
        console.log("✅ Deals scraping");

        // 3) Deals insertion into MongoDB
        console.log("Insertion of deals into MongoDB...");
        await insertDeals(deals);
        console.log("✅ Deals deals inserted successfully");

        // 4) Extraction unique deals IDs
        // done in sandbox.js

        // 5) Scraping Vinted for each ID
        console.log("Scraping Vinted sales...");
        const sales = await scrapeVinted();
        console.log("✅ Sales scraping");

        // 6) Sales insertion into MongoDB
        console.log("Insertion of sales into MongoDB...");
        for (const sale of sales) {
            if (!sale || Object.keys(sale).length === 0) {
                console.log("⚠️ Vente vide détectée, saut de l'insertion.");
                continue; // Passe à l'itération suivante
            }
            await insertSales(sale);
        }
        console.log("✅ Vinted sales inserted successfully");

        // 7) Close connection to MongoDB
        await closeDB();
        console.log("Pipeline finished successfully !");

    } catch (error) {

        console.error("❌ Pipeline error :", error);
        await closeDB();
        process.exit(1);

    }
};

// runPipeline(); // Lauch pipeline (auto)




/**
 * Best discount
 */
/*const findBestDiscountDeals = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ discount: -1 }).limit(10).toArray();
    console.log(deals);
    return deals;
};*/

/**
 * Most commented
 */
/*const findMostCommentedDeals = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ comments: -1 }).limit(10).toArray();
    console.log(deals);
    return deals;
};*/

/**
 * Sorted price (Asc/Desc)
 */
/*const findDealsSortedByPriceAsc = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ price: 1 }).toArray();
    console.log(deals);
    return deals;
};*/
/*const findDealsSortedByPriceDesc = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ price: -1 }).toArray();
    console.log(deals);
    return deals;
};*/

/**
 * Sorted date (Old/New)
 */
/*const findDealsSortedByDateOld = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ published: 1 }).toArray();
    console.log(deals);
    return deals;
};*/
/*const findDealsSortedByDateNew = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ published: -1 }).toArray();
    console.log(deals);
    return deals;
};*/

/**
 * Find a deal by Lego Set ID
 */
/*const findDealsById = async (id) => {
    const db = await connectDB();
    const deals = await db.collection('deals')
      .find({ id: id })
      .toArray();
    // console.log(deal);
    return deals;
};*/

/**
 * Best temperature (nouveau filtre)
 */
/*const findBestTemperatureDeals = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ temperature: -1 }).limit(10).toArray();
    console.log(deals);
    return deals;
};*/




/**
 * Export scraping functions to use in mongo.js
 */
module.exports = {
    connectDB,
    closeDB, 
    // findBestDiscountDeals, 
    // findMostCommentedDeals, 
    // findBestTemperatureDeals,
    // findDealsSortedByPriceAsc, 
    // findDealsSortedByPriceDesc, 
    // findDealsSortedByDateOld, 
    // findDealsSortedByDateNew,
    // findDealsById,
    findDealBySpecId,
    calculatePriceIndicators,
    calculateLifetimeValue, 
    findDealsByFilters,
    findSalesByLegoSetId
};