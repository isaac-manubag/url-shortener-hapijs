const Boom = require('@hapi/boom');
const shortid = require('shortid');
const ShortUrls = require('../models/ShortUrls');

const validURL = str => {
  var pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  return !!pattern.test(str);
};

exports.shorten = async request => {
  const params = request.payload;
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

  if (!protocolOk || !validURL(longurl)) {
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
