const Boom = require('@hapi/boom');
const shortid = require('shortid');
const ShortUrls = require('../models/ShortUrls');

exports.shorten = async (request, h) => {
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

  const exists = await ShortUrls.findOne({ longurl });

  if (exists) {
    return exists;
  }

  const shorturl = shortid.generate();
  const data = new ShortUrls({
    shorturl,
    longurl,
  });

  return await data.save();
};

exports.getShortUrl = async (request, h) => {
  const data = await ShortUrls.findOne({
    shorturl: request.params.shorturl,
  });

  if (data) {
    return h.redirect(data.longurl).permanent();
  }

  return 'short url not found';
};
