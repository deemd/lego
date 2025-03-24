const { connectDB, closeDB } = require('./mongo');

const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.get('/deals/:id', async (req, res) => {
  try {
      const deal = await db.collection("deals").findAll({ _id: req.params.id });
      if (!deal) {
          return res.status(404).json({ error: "Deal not found" });
      }
      res.json(deal);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
  }
});


app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);
