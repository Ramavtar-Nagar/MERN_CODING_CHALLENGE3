const axios = require('axios');
const Transaction = require('../models/Transaction');

const DATA_URL = 'https://s3.amazonaws.com/roxiler.com/product_transaction.json';

exports.initializeDatabase = async (req, res) => {
  try {
    const response = await axios.get(DATA_URL);
    const transactions = response.data;
    await Transaction.insertMany(transactions);
    res.status(200).send('Database initialized with seed data');
  } catch (error) {
    res.status(500).send('Error initializing database');
  }
};

exports.listTransactions = async (req, res) => {
  const { month, search = '', page = 1, perPage = 10 } = req.query;
  const monthInt = new Date(`${month} 1, 2020`).getMonth() + 1;

  try {
    const query = {
      $expr: { $eq: [{ $month: '$dateOfSale' }, monthInt] },
      $or: [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { price: new RegExp(search, 'i') },
      ],
    };
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(perPage);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).send('Error fetching transactions');
  }
};

exports.getStatistics = async (req, res) => {
  const { month } = req.query;
  const monthInt = new Date(`${month} 1, 2020`).getMonth() + 1;

  try {
    const totalSaleAmount = await Transaction.aggregate([
      { $match: { $expr: { $eq: [{ $month: '$dateOfSale' }, monthInt] } } },
      { $group: { _id: null, total: { $sum: '$price' } } },
    ]);
    const totalSoldItems = await Transaction.countDocuments({
      $expr: { $eq: [{ $month: '$dateOfSale' }, monthInt] },
      sold: true,
    });
    const totalNotSoldItems = await Transaction.countDocuments({
      $expr: { $eq: [{ $month: '$dateOfSale' }, monthInt] },
      sold: false,
    });

    res.status(200).json({
      totalSaleAmount: totalSaleAmount[0]?.total || 0,
      totalSoldItems,
      totalNotSoldItems,
    });
  } catch (error) {
    res.status(500).send('Error fetching statistics');
  }
};

exports.getBarChart = async (req, res) => {
  const { month } = req.query;
  const monthInt = new Date(`${month} 1, 2020`).getMonth() + 1;

  try {
    const ranges = [
      { range: '0-100', min: 0, max: 100 },
      { range: '101-200', min: 101, max: 200 },
      { range: '201-300', min: 201, max: 300 },
      { range: '301-400', min: 301, max: 400 },
      { range: '401-500', min: 401, max: 500 },
      { range: '501-600', min: 501, max: 600 },
      { range: '601-700', min: 601, max: 700 },
      { range: '701-800', min: 701, max: 800 },
      { range: '801-900', min: 801, max: 900 },
      { range: '901-above', min: 901, max: Infinity },
    ];

    const result = await Promise.all(
      ranges.map(async (r) => {
        const count = await Transaction.countDocuments({
          $expr: { $eq: [{ $month: '$dateOfSale' }, monthInt] },
          price: { $gte: r.min, $lt: r.max },
        });
        return { range: r.range, count };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).send('Error fetching bar chart data');
  }
};

exports.getPieChart = async (req, res) => {
  const { month } = req.query;
  const monthInt = new Date(`${month} 1, 2020`).getMonth() + 1;

  try {
    const result = await Transaction.aggregate([
      { $match: { $expr: { $eq: [{ $month: '$dateOfSale' }, monthInt] } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).send('Error fetching pie chart data');
  }
};

exports.getAllData = async (req, res) => {
  const { month } = req.query;
  try {
    const statistics = await exports.getStatistics({ query: { month } }, res);
    const barChart = await exports.getBarChart({ query: { month } }, res);
    const pieChart = await exports.getPieChart({ query: { month } }, res);

    res.status(200).json({ statistics, barChart, pieChart });
  } catch (error) {
    res.status(500).send('Error fetching combined data');
  }
};
