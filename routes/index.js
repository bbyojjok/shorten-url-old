const path = require('path');
const shortid = require('shortid');
const validUrl = require('valid-url');
const { getKSTDate } = require('../util');
const ShortenUrl = require('../models/shortenUrl');
const route = require('express').Router();

async function createShortenUrl(req, res, originalUrl) {
	const shortBaseUrl = `${req.protocol}://${req.headers.host}/`;
	const urlCode = shortid.generate();
	const updatedAt = getKSTDate();
	if (validUrl.isUri(originalUrl)) {
		const queryResult = await ShortenUrl.findOne({ originalUrl: originalUrl }, err => {
			if (err) return res.status(401).send(`DB Error: ${err}`);
		});
		if (queryResult) {
			const shortUrl = shortBaseUrl + queryResult.urlCode;
			const updateResult = await ShortenUrl.findOneAndUpdate({ originalUrl: originalUrl }, {$set: { shortUrl: shortUrl, updatedAt: updatedAt }}, { new: true }, err => {
				if (err) return res.status(401).send(`DB Error: ${err}`);
			});
			return updateResult;
		} else {
			const shortUrl = shortBaseUrl + urlCode;
			const queryResult = new ShortenUrl({
				originalUrl,
				shortUrl,
				urlCode
			});
			await queryResult.save((err) => {
				if (err) return res.status(401).send(`DB Error: ${err}`);
			});
			return queryResult;
		}
	} else {
		return res.status(401).send('Error: Invaild url');
	}
}

route.get('/:urlCode?', async (req, res) => {
	const urlCode = req.params.urlCode;
	switch (urlCode) {
		case undefined:
			return res.sendFile(path.join(__dirname, '../', 'views/create.html'));
		case 'error':
			return res.sendFile(path.join(__dirname, '../', 'views/error.html'));
		default:
			const queryResult = await ShortenUrl.findOne({ urlCode: urlCode }, err => {
				if (err) return res.status(401).send(`DB Error: ${err}`);
			});
			if (queryResult) {
				const count = queryResult.count + 1;
				const updateResult = await ShortenUrl.findOneAndUpdate({ urlCode: urlCode }, {$set: { count: count }}, { new: true }, err => {
					if (err) return res.status(401).send(`DB Error: ${err}`);
				});
				return res.redirect(updateResult.originalUrl);
			} else {
				return res.redirect('/error');
			}
	}
});

route.get('/api/find/:urlCode?', async (req, res) => {
	const urlCode = req.params.urlCode;
	switch (urlCode) {
		case undefined:
			ShortenUrl.find({}, (err, docs) => {
				if (err) return res.status(401).send(`DB Error: ${err}`);
				return res.status(200).json(docs);
			});
			break;
		case 'count':
			ShortenUrl.find({}, null, {sort: {count: -1}}, (err, docs) => {
				if (err) return res.status(401).send(`DB Error: ${err}`);
				return res.status(200).json(docs);
			});
			break;
		default:
			ShortenUrl.findOne({ urlCode: urlCode }, (err, docs) => {
				if (err) return res.status(401).send(`DB Error: ${err}`);
				return res.status(200).json(docs);
			});
			break;
	}
});

/**
 * @param { string or object }
 * { "originalUrl": "http://www.google.com" } // string
 * { "originalUrl": ["http://naver.com", "http://daum.net", "http://www.google.com"] } // array
 * @return { object }
 */
route.post('/api/create', async (req, res) => {
	const originalUrl = req.body.originalUrl;
	let result = [];
	switch (typeof originalUrl) {
		case 'string':
			await result.push(await createShortenUrl(req, res, originalUrl));
			break;
		case 'object':
			for (var i=0; i < originalUrl.length; i++) {
				await result.push(await createShortenUrl(req, res, originalUrl[i]));
			}
			break;
		default:
			return res.status(401).send('Error: Worng param');
	}
	return res.status(200).json(result);
});

route.post('/api/remove', async (req, res) => {
	ShortenUrl.remove({}, err => {
		if (err) return res.status(401).send(`DB Error: ${err}`);
		return res.status(200).send('collection removed');
	});
});

module.exports = route;
