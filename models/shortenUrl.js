const { getKSTDate } = require('../util');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortenUrl = new Schema({
	originalUrl: String,
	urlCode: String,
	shortUrl: String,
	createdAt: { type: Date, default: getKSTDate() },
	updatedAt: { type: Date, default: getKSTDate() }
});

module.exports = mongoose.model('ShortenUrl', shortenUrl);
