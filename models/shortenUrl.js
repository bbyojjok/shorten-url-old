const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shortenUrl = new Schema({
	originalUrl: String,
	urlCode: String,
	shortUrl: String,
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ShortenUrl', shortenUrl);