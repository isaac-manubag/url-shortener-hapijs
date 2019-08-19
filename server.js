'use strict';

const Hapi = require('@hapi/hapi');
const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');
const shortid = require('shortid');
const Mongoose = require('mongoose');
const Path = require('path');

Mongoose.connect('mongodb://mongo:27017/urlshortenerdb', {
  useNewUrlParser: true,
});

const ShortUrlModel = Mongoose.model('shortUrl', {
  shorturl: String,
  longurl: String,
});

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: '0.0.0.0',
  });

  await server.register(require('inert'));

  server.route({
    method: 'GET',
    path: '/{path*}',
    handler: {
      directory: {
        path: ['public'],
        listing: true,
        index: ['index.html']
      }
    }    
  });

  server.route({
    method: 'GET',
    path: '/shorten',
    handler: async (request, h) => {
      const params = request.query;
      const longurl = params.url;
      const allowedProtocols = ['https', 'http', 'mailto'];
      let protocolOk = false;

      if (allowedProtocols.length > 0) {
        for (let i = 0; i < allowedProtocols.length - 1; i++) {
          let protocol = allowedProtocols[i];
          if (
            longurl.substring(0, protocol.length).toLowerCase() ==
            protocol.toLowerCase()
          ) {
            protocolOk = true;
            break;
          }
        }
      } else {
        protocolOk = true;
      }

      if (!protocolOk) {
        return Boom.badData('URL Protocol Validation Failed');
      }

      const exists = await ShortUrlModel.findOne({ longurl });

      if (exists) {
        return exists;
      }

      const shorturl = shortid.generate();
      const data = new ShortUrlModel({
        shorturl,
        longurl,
      });

      return await data.save();
    },
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
    handler: async (request, h) => {
      const data = await ShortUrlModel.findOne({
        shorturl: request.params.shorturl,
      });

      if (data) {
        return h.redirect(data.longurl).permanent();
      }

      return 'short url not found';
    },
  });


  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
