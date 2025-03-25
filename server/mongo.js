const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = 'mongodb+srv://heloiserobin:kp8OJ7GkYKAMLfo1@cluster0.du33m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGODB_DB_NAME = 'lego';

let client;
let db;




/* ********************************************************* MONGODB ********************************************************** */


/**
 * Open connection to MongoDB database
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
 * @param {String} deals - json scraped deals
 */
/*const insertDeals = async (deals) => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const result = await collection.insertMany(deals);
    console.log(result);
};*/
const insertDeals = async (deals) => {
    const db = await connectDB();
    const collection = db.collection('deals');

    // Delete old deals and insert new
    await collection.deleteMany({});
    const result = await collection.insertMany(deals);
    console.log(result);
};


/**
 * Insert deals from VINTED
 * @param {String} deals - json scraped deals
 */
/*const insertSales = async (sales) => {
    const db = await connectDB();
    const collection = db.collection('sales');
    const result = await collection.insertMany(sales);
    console.log(result);
};*/
const insertSales = async (sales) => {
    const db = await connectDB();
    const collection = db.collection('sales');

    // Delete old sales and insert new
    await collection.deleteMany({});
    const result = await collection.insertMany(sales);
    console.log(result);
};




/* ********************************************************* FILTER ********************************************************** */


/**
 * Best discount
 */
const findBestDiscountDeals = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ discount: -1 }).limit(10).toArray();
    console.log(deals);
    return deals;
};


/**
 * Most commented
 */
const findMostCommentedDeals = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ comments: -1 }).limit(10).toArray();
    console.log(deals);
    return deals;
};


/**
 * Sorted price (Asc/Desc)
 */
const findDealsSortedByPriceAsc = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ price: 1 }).toArray();
    console.log(deals);
    return deals;
};
const findDealsSortedByPriceDesc = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ price: -1 }).toArray();
    console.log(deals);
    return deals;
};


/**
 * Sorted date (Old/New)
 */
const findDealsSortedByDateOld = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ published: 1 }).toArray();
    console.log(deals);
    return deals;
};
const findDealsSortedByDateNew = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ published: -1 }).toArray();
    console.log(deals);
    return deals;
};


/**
 * Find a deal by ID
 */
const findDealById = async (id) => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deal = await collection.findOne({ _id: id });
    console.log(deal);
    return deal;
};


/**
 * Best temperature (nouveau filtre)
 */
const findBestTemperatureDeals = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ temperature: -1 }).limit(10).toArray();
    console.log(deals);
    return deals;
};




/* ******************************************************** DYNAMIC ********************************************************* */


/**
 * Calculate price indicators (average, p5, p25, p50)
 */
const calculatePriceIndicators = async (legoSetId) => {
    const db = await connectDB();
    const salesCollection = db.collection('sales');

    const sales = await salesCollection.find({ legoSetId }).toArray();

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
 */
const calculateLifetimeValue = async (legoSetId) => {
    const db = await connectDB();
    const salesCollection = db.collection('sales');

    const sales = await salesCollection.find({ legoSetId }).toArray();

    if (sales.length === 0) {
        return "No sales"; // No sales data
    }

    const dates = sales.map((sale) => new Date(sale.published));
    const earliestDate = new Date(Math.min(...dates));
    const latestDate = new Date(Math.max(...dates));

    const lifetimeInMs = latestDate - earliestDate; // Différence en millisecondes
    const lifetimeInDays = Math.ceil(lifetimeInMs / (1000 * 60 * 60 * 24)); // Conversion en jours

    return `${lifetimeInDays} days`;
};




/* ******************************************************** PIPELINE ********************************************************* */


const { scrapeDealabs, scrapeVinted } = require('./sandbox'); // Scraping


/**
 * Scraping + MongoDB Pipeline
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

// Lancer le pipeline automatiquement
runPipeline();





/* ********************************************************** EXPORT ********************************************************* */

/**
 * Export scraping functions to use in mongo.js
 */
module.exports = {
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
    calculatePriceIndicators,
    calculateLifetimeValue
};


























/*

// Sales Lego Set Id
const findSalesByLegoSetId = async (legoSetId) => {
    const db = await connectDB();
    const collection = db.collection('sales');
    const sales = await collection.find({ legoSetId }).toArray();
    console.log(sales);
    return sales;
};

// Sales -3 weeks
const findRecentSales = async () => {
    const db = await connectDB();
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

    const collection = db.collection('sales');
    const sales = await collection.find({ date: { $gte: threeWeeksAgo } }).toArray();
    console.log(sales);
    return sales;
};

// Export
module.exports = {
    insertDeals,
    insertSales,
    findBestDiscountDeals,
    findMostCommentedDeals,
    findDealsSortedByPrice,
    findDealsSortedByDate,
    findSalesByLegoSetId,
    findRecentSales
};


*/