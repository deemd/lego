const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = 'mongodb+srv://heloiserobin:kp8OJ7GkYKAMLfo1@cluster0.du33m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGODB_DB_NAME = 'lego';

let client;
let db;

// Connexion à la base MongoDB
const connectDB = async () => {
    if (!client) {
        client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        db = client.db(MONGODB_DB_NAME);
        console.log('✅ Connected to MongoDB');
    }
    return db;
};

const loadAndInsertData = async () => {
    try {
        const db = await connectDB();

        // Read & insert deals
        const dealsData = JSON.parse(fs.readFileSync(path.join("C:\\Users\\hrobi\\Documents\\GitHub\\lego\\server", 'dealabsData.json'), 'utf-8'));
        await insertDeals(dealsData);
        console.log('✅ Deals insérés avec succès');

        // Read & insert sales
        const salesData = JSON.parse(fs.readFileSync(path.join("C:\\Users\\hrobi\\Documents\\GitHub\\lego\\server", 'vintedData.json'), 'utf-8'));
        await insertSales(salesData);
        console.log('✅ Sales insérés avec succès');

    } catch (error) {
        console.error('❌ Erreur lors de l’insertion des données :', error);
    } finally {
        client.close(); // Close database connection
    }
};

// Insert deals from DEALABS
const insertDeals = async (deals) => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const result = await collection.insertMany(deals);
    console.log(result);
};

// Insert sales from VINTED
const insertSales = async (sales) => {
    const db = await connectDB();
    const collection = db.collection('sales');
    const result = await collection.insertMany(sales);
    console.log(result);
};

// loadAndInsertData();



// -------------------------------------------------------------------------------------------------------

// Best Discount
const findBestDiscountDeals = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ discount: -1 }).limit(10).toArray();
    console.log(deals);
    return deals;
};

// Most Commented
const findMostCommentedDeals = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ comments: -1 }).limit(10).toArray();
    console.log(deals);
    return deals;
};

// Sorted Price (Asc/Desc)
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

// Sorted Date (Old/New)
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




/*
const deals = [];

const dealsCollection = db.collection('deals');
const dealsResult = await collection.insertMany(deals);

console.log(result);

const sales = [];

const legoSetId = '42156';
const salesCollection = db.collection('sales');
const salesResult = await salesCollection.find({ legoSetId }).toArray();

console.log(sales);*/