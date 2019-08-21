'use strict';

const Hapi = require('@hapi/hapi');
const Joi = require('@hapi/joi');
const Mongoose = require('mongoose');
const shortUrlController = require('./src/controllers/shortUrlController');

Mongoose.connect('mongodb://mongo:27017/urlshortenerdb', {
  useNewUrlParser: true,
});

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: '0.0.0.0',
  });

  await server.register(require('inert'));
  await server.register({
    plugin: require('hapi-cors'),
  });

  server.route({
    method: 'GET',
    path: '/{path*}',
    handler: {
      directory: {
        path: ['public'],
        listing: true,
        index: ['index.html'],
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/shorten',
    handler: shortUrlController.shorten,
    config: {
      validate: {
        query: {
          url: Joi.string()
            .uri()
            .required()
            .error(new Error('Invalid URL Provided')),
        },
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/u/{shorturl}',
    handler: shortUrlController.getShortUrl,
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
