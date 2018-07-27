const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const route = require('./routes/shortenUrl');

const app = express();
const port = 888;

const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => { console.log('Connected to mongodb server'); });
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1/shorten-url');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', route);
app.use('/public', express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
	console.log('Express is listening on port', port);
});