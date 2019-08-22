'use strict';

const mongoose = require('mongoose');

exports.connect = () => {
  console.log('MongoDB connection with retry');
  mongoose
    .connect('mongodb://mongo:27017/urlshortenerdb', {
      useNewUrlParser: true,
      autoIndex: false,
      reconnectTries: 30,
      reconnectInterval: 500,
      poolSize: 10,
      bufferMaxEntries: 0,
    })
    .then(() => {
      console.log('MongoDB is connected');
    })
    .catch(err => {
      console.log('MongoDB connection unsuccessful, retry after 5 seconds.');
      setTimeout(connectWithRetry, 5000);
    });
};