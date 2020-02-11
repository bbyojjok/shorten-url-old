const route = require('express').Router();
const path = require('path');
const shortid = require('shortid');
const validUrl = require('valid-url');
const qrImage = require('qr-image');
const { getKSTDate } = require('../util');
const ShortenUrl = require('../models/shortenUrl');

const createShortenUrl = async (req, res, originalUrl) => {
  const reqHeadersOrigin = req.headers.origin || 'http://url.hdmall.com';
  const shortBaseUrl = `${reqHeadersOrigin}/`;
  const urlCode = shortid.generate();
  const updatedAt = getKSTDate();

  if (validUrl.isUri(originalUrl)) {
    const queryResult = await ShortenUrl.findOne({ originalUrl }, err => {
      if (err) {
        return res.status(401).send(`DB Error: ${err}`);
      }
    });
    const shortUrl = queryResult ? shortBaseUrl + queryResult.urlCode : shortBaseUrl + urlCode;
    const qrCode = qrImage.imageSync(shortUrl, { type: 'svg' });
    if (queryResult) {
      const updateResult = await ShortenUrl.findOneAndUpdate(
        { originalUrl },
        { $set: { shortUrl, qrCode, updatedAt } },
        { new: true },
        err => {
          if (err) {
            return res.status(401).send(`DB Error: ${err}`);
          }
        }
      );
      return updateResult;
    } else {
      const createResult = new ShortenUrl({ originalUrl, shortUrl, urlCode, qrCode });
      await createResult.save(err => {
        if (err) {
          return res.status(401).send(`DB Error: ${err}`);
        }
      });
      return createResult;
    }
  }
  return res.status(401).send('Error: Invaild url');
};

route.get('/:urlCode?', async (req, res) => {
  const { urlCode } = req.params;
  switch (urlCode) {
    case undefined:
      return res.sendFile(path.join(__dirname, '../', 'views/create.html'));
    case 'error':
      return res.sendFile(path.join(__dirname, '../', 'views/error.html'));
    default:
      const queryResult = await ShortenUrl.findOne({ urlCode }, err => {
        if (err) return res.status(401).send(`DB Error: ${err}`);
      });
      if (queryResult) {
        const count = queryResult.count + 1;
        const updateResult = await ShortenUrl.findOneAndUpdate({ urlCode }, { $set: { count } }, { new: true }, err => {
          if (err) {
            return res.status(401).send(`DB Error: ${err}`);
          }
        });
        return res.redirect(301, updateResult.originalUrl);
      }
      return res.redirect('/error');
  }
});

route.get('/api/find/:urlCode?', async (req, res) => {
  const { urlCode } = req.params;
  const { limit, sort_by } = req.query;
  const options = {
    limit: parseInt(limit, 10) || 40,
    sort: {
      count: sort_by === 'count' ? -1 : 1
    }
  };
  switch (urlCode) {
    case undefined:
      const allResult = await ShortenUrl.find({}, null, options, err => {
        if (err) {
          return res.status(401).send(`DB Error: ${err}`);
        }
      });
      return res.status(200).json(allResult);
    default:
      const oneResult = await ShortenUrl.findOne({ urlCode }, err => {
        if (err) {
          return res.status(401).send(`DB Error: ${err}`);
        }
      });
      return res.status(200).json(oneResult);
  }
});

/**
 * @param { string or object }
 * { "originalUrl": "http://www.google.com" } // string
 * { "originalUrl": ["http://naver.com", "http://daum.net", "http://www.google.com"] } // array
 * @return { object }
 */
route.post('/api/create', async (req, res) => {
  const { originalUrl } = req.body;
  const result = [];
  switch (typeof originalUrl) {
    case 'string':
      await result.push(await createShortenUrl(req, res, originalUrl));
      break;
    case 'object':
      for (var i = 0; i < originalUrl.length; i++) {
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
    if (err) {
      return res.status(401).send(`DB Error: ${err}`);
    }
    return res.status(200).send('collection removed');
  });
});

route.get('/api/docs', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views/docs.html'));
});

module.exports = route;
