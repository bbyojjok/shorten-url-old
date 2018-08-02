const path = require('path');
const shortid = require('shortid');
const validUrl = require('valid-url');
const ShortenUrl = require('../models/shortenUrl');
const route = require('express').Router();

route.get('/:urlCode?', async (req, res) => {
	const urlCode = req.params.urlCode;
	switch (urlCode) {
		case undefined:
			return res.sendFile(path.join(__dirname, '../', 'views/create.html'));
			break;
		case 'error':
			return res.sendFile(path.join(__dirname, '../', 'views/error.html'));
			break;
		default:
			const queryResult = await ShortenUrl.findOne({ urlCode: urlCode }, error => {
				if (error) throw error;
			});
			if (queryResult) return res.redirect(301, queryResult.originalUrl);
			else return res.redirect('/error');
			break;
	}
});

route.post('/api/create', async (req, res) => {
	const originalUrl = req.body.originalUrl;
	const shortBaseUrl = `${req.protocol}://${req.headers.host}/`;
	const urlCode = shortid.generate();
	const updatedAt = new Date();
	if (validUrl.isUri(originalUrl)) {
		const queryResult = await ShortenUrl.findOne({ originalUrl: originalUrl }, error => {
			if (error) return res.status(401).send(`DB Error: ${error}`);
		});
		if (queryResult) {
			const shortUrl = shortBaseUrl + queryResult.urlCode;
			const updateResult = await ShortenUrl.findOneAndUpdate({ originalUrl: originalUrl }, { $set: { shortUrl: shortUrl } }, { new: true }, error => {
				if (error) return res.status(401).send(`DB Error: ${error}`);
			});
			return res.status(200).json(updateResult);
		} else {
			const shortUrl = shortBaseUrl + urlCode;
			const queryResult = new ShortenUrl({
				originalUrl,
				shortUrl,
				urlCode,
				updatedAt
			});
			await queryResult.save((error) => {
				if (error) return res.status(401).send(`DB Error: ${error}`);
			});
			return res.status(200).json(queryResult);
		}
	} else {
		return res.status(401).send('Error: 유효하지 않은 url');
	}
});

module.exports = route;
