const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = 'mongodb+srv://heloiserobin:kp8OJ7GkYKAMLfo1@cluster0.du33m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGODB_DB_NAME = 'lego';

let client;
let db;


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
 * Scrape data ?? => appeler la fonction sandbox qui scrape
 */




/**
 * Load and insert data into MongoDB database
 *//*
const loadAndInsertData = async () => {
    try {
        db = await connectDB();

        // Read & insert deals
        const dealsData = JSON.parse(fs.readFileSync(path.join("C:\\Users\\hrobi\\Documents\\GitHub\\lego\\server", 'dealabsData.json'), 'utf-8'));
        await insertDeals(dealsData);
        console.log('✅ Deals inserted successfully');

        // Read & insert sales
        const salesData = JSON.parse(fs.readFileSync(path.join("C:\\Users\\hrobi\\Documents\\GitHub\\lego\\server", 'vintedData.json'), 'utf-8'));
        await insertSales(salesData);
        console.log('✅ Sales inserted successfully');

    } catch (error) {
        console.error('❌ Error when inserting data :', error);
    } /*finally {
        client.close(); // Close database connection
    }
};
*/



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










const { scrapeDealabs, scrapeVinted } = require('./sandbox'); // Scraping


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


/**
 * Export scraping functions to use in mongo.js
 */
module.exports = {
    connectDB,
    closeDB
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