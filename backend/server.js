const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const transactionRoutes = require('./routes/transactionRoutes');
// const cors = require('cors');

const app = express();
const PORT = 5000;
const DB_URL = 'mongodb://localhost:27017/mern-coding-challenge';

app.use(bodyParser.json());
// app.use(cors());

mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.log('MongoDB connection error:', error));

app.use('/api', transactionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
