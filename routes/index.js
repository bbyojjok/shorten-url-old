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
		const queryResult = await ShortenUrl.findOne({ originalUrl: originalUrl }, error => {
			if (error) return res.status(401).send(`DB Error: ${error}`);
		});
		if (queryResult) {
			const shortUrl = shortBaseUrl + queryResult.urlCode;
			const updateResult = await ShortenUrl.findOneAndUpdate(
				{ originalUrl: originalUrl },
				{ $set: {
						shortUrl: shortUrl,
						updatedAt: updatedAt
					}
				},
				{ new: true },
				error => {
				if (error) return res.status(401).send(`DB Error: ${error}`);
			});
			return updateResult;
		} else {
			const shortUrl = shortBaseUrl + urlCode;
			const queryResult = new ShortenUrl({
				originalUrl,
				shortUrl,
				urlCode
			});
			await queryResult.save((error) => {
				if (error) return res.status(401).send(`DB Error: ${error}`);
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
			const queryResult = await ShortenUrl.findOne({ urlCode: urlCode }, error => {
				if (error) throw error;
			});
			if (queryResult) return res.redirect(301, queryResult.originalUrl);
			else return res.redirect('/error');
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
			await result.push(createShortenUrl(req, res, originalUrl));
			break;
		case 'object':
			for (var i=0; i < originalUrl.length; i++) {
				await result.push(await createShortenUrl(req, res, originalUrl[i]));
			}
			break;
		default:
			return res.status(401).send('Error: Worng param');
	}
	console.log('# create');
	return res.status(200).json(result);
});

route.post('/api/remove', async (req, res) => {
	ShortenUrl.remove({}, error => {
		if (error) return res.status(401).send(`DB Error: ${error}`);
		console.log('# remove coll');
		return res.status(200).send('collection removed');
	});
});

route.get('/api/find/:urlCode?', async (req, res) => {
	const urlCode = req.params.urlCode;
	switch (urlCode) {
		case undefined:
			const findResult = await ShortenUrl.find({}, error => {
				if (error) return res.status(401).send(`DB Error: ${error}`);
			});
			console.log('# find');
			return res.status(200).json(findResult);
		default:
			const findOneResult = await ShortenUrl.findOne({ urlCode: urlCode }, error => {
				if (error) return res.status(401).send(`DB Error: ${error}`);
			});
			console.log('# find');
			return res.status(200).json(findOneResult);
	}
});

module.exports = route;
