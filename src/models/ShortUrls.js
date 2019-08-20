'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shortUrlModel = new Schema({
  shorturl: { type: String, required: true },
  longurl: { type: String, required: true },
});

module.exports = mongoose.model('ShortUrls', shortUrlModel, 'shortUrls');
