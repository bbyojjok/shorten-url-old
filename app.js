const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const route = require('./routes');
const mongoose = require('mongoose');
const app = express();
const port = 888;

const connection = mongoose.connection;
connection.on('error', console.error);
connection.once('open', () => { console.log('Connected to mongodb server'); });
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/shorten-url', { useNewUrlParser: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/', route);

app.listen(port, () => {
	console.log('Express is listening on port', port);
});