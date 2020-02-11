const mongoose = require('mongoose');
const { Schema } = mongoose;
const { getKSTDate } = require('../util');

const shortenUrl = new Schema({
  originalUrl: String,
  urlCode: String,
  shortUrl: String,
  count: { type: Number, default: 0 },
  qrCode: String,
  createdAt: { type: Date, default: getKSTDate() },
  updatedAt: { type: Date, default: getKSTDate() }
});

module.exports = mongoose.model('ShortenUrl', shortenUrl);
