const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://heloiserobin:kp8OJ7GkYKAMLfo1@<hostname>/?ssl=true&replicaSet=atlas-uz8mlg-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';
const MONGODB_DB_NAME = 'lego';

const client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true });
const db = client.db(MONGODB_DB_NAME);

const deals = [];

const collection = db.collection('deals');
const result = await collection.insertMany(deals);

console.log(result);

const legoSetId = '42156';
const salesCollection = db.collection('sales');
const sales = await salesCollection.find({ legoSetId }).toArray();

console.log(sales);



// Connexion à la base MongoDB
const connectDB = async () => {
    if (!client) {
        client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        db = client.db(MONGODB_DB_NAME);
        console.log('✅ Connected to MongoDB');
    }
    return db;
};

// 🔹 Insérer les deals
const insertDeals = async (deals) => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const result = await collection.insertMany(deals);
    console.log(result);
};

// 🔹 Insérer les ventes
const insertSales = async (sales) => {
    const db = await connectDB();
    const collection = db.collection('sales');
    const result = await collection.insertMany(sales);
    console.log(result);
};

// 🔎 1. Trouver les meilleurs rabais
const findBestDiscountDeals = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ discount: -1 }).limit(10).toArray();
    console.log(deals);
    return deals;
};

// 🔎 2. Trouver les deals les plus commentés
const findMostCommentedDeals = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ comments: -1 }).limit(10).toArray();
    console.log(deals);
    return deals;
};

// 🔎 3. Trouver les deals triés par prix
const findDealsSortedByPrice = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ price: 1 }).toArray();
    console.log(deals);
    return deals;
};

// 🔎 4. Trouver les deals triés par date
const findDealsSortedByDate = async () => {
    const db = await connectDB();
    const collection = db.collection('deals');
    const deals = await collection.find().sort({ date: -1 }).toArray();
    console.log(deals);
    return deals;
};

// 🔎 5. Trouver toutes les ventes pour un set LEGO donné
const findSalesByLegoSetId = async (legoSetId) => {
    const db = await connectDB();
    const collection = db.collection('sales');
    const sales = await collection.find({ legoSetId }).toArray();
    console.log(sales);
    return sales;
};

// 🔎 6. Trouver toutes les ventes de moins de 3 semaines
const findRecentSales = async () => {
    const db = await connectDB();
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

    const collection = db.collection('sales');
    const sales = await collection.find({ date: { $gte: threeWeeksAgo } }).toArray();
    console.log(sales);
    return sales;
};

// Export des fonctions
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

