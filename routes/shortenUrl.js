const route = require('express').Router();
const path = require('path');
const shortid = require('shortid');
const validUrl = require('valid-url');
const ShortenUrl = require('../models/shortenUrl');

route.get('/:code?', async (req, res) => {
	const urlCode = req.params.code;
	switch (urlCode) {
		case undefined:
			return res.sendFile(path.join(__dirname, '../', 'views/create.html'));
			break;
		case 'error':
			return res.sendFile(path.join(__dirname, '../', 'views/error.html'));
			break;
		default:
			const queryResult = await ShortenUrl.findOne({ urlCode: urlCode }, err => {
				if (err) throw err;
			});
			if (queryResult) return res.redirect(queryResult.originalUrl);
			else return res.redirect('/error');
			break;
	}
});

route.post('/api/create', async (req, res) => {
	const originalUrl = req.body.originalUrl;
	const shortBaseUrl = req.protocol + '://' + req.headers.host + '/';
	const urlCode = shortid.generate();
	const updatedAt = new Date();
	if (validUrl.isUri(originalUrl)) {
		const queryResult = await ShortenUrl.findOne({ originalUrl: originalUrl }, err => {
			if (err) return res.status(401).send('Error: ' + err);
		});
		if (queryResult) {
			return res.status(200).json(queryResult);
		} else {
			const shortUrl = shortBaseUrl + urlCode;
			const queryResult = new ShortenUrl({
				originalUrl,
				shortUrl,
				urlCode,
				updatedAt
			});
			await queryResult.save((err) => {
				if (err) return res.status(401).send('Error: ' + err);
			});
			return res.status(200).json(queryResult);
		}
	} else {
		return res.status(401).send('Error: 유효하지 않은 url');
	}
});

module.exports = route;