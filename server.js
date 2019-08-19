'use strict';

const Hapi = require('@hapi/hapi');
const Joi = require('@hapi/joi');
const utils = require('./utils');

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: '0.0.0.0',
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return 'Hello World!';
    },
  });

  server.route({
    method: 'GET',
    path: '/shorten',
    handler: (request, h) => {
      const params = request.query;
      const url = params.url;
      const allowedProtocols = ['https', 'http', 'mailto']; 
      let protocolOk = false;

      if (allowedProtocols.length > 0) {

        for (let i = 0; i < allowedProtocols.length - 1; i++) {
          let protocol = allowedProtocols[i];
          if (( url.substring(0, protocol.length) ).toLowerCase() == protocol.toLowerCase()) {
            protocolOk = true;
            break;
          }
        }

        if (protocolOk) {
          // check if url is already on the db and return its short url

          // generate random str
          // const random_string = Math.random().toString(32).substring(2, 5) + Math.random().toString(32).substring(2, 5);
          const random_string = utils.randomString();
          console.log(random_string);
          // store the url to db 
          // check if mongoose has ability to save
        } 
      } else {
        protocolOk = true; // everything is allowed
      }


      

      console.log(url);

      return params;
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

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
