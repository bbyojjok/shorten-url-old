const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const route = require('./routes');
const port = 888;

const { connection } = mongoose;
connection.on('error', console.error);
connection.once('open', () => {
  console.log('Connected to mongodb server');
});
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1:27017/shorten-url', { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true });

require('./security')(app);
// const whitelist = ['http://example1.com', 'http://example2.com'];
// app.use(
//   cors({
//     origin: 'https://www.thehyundai.com',
//     credentials: true
//   })
// );
// app.use(morgan('dev'));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, '/public')));
app.use('/', route);

app.listen(port, () => {
  console.log(`Express is listening on port ${port}`);
});
