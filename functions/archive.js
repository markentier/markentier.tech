export function handler (event, context, callback) {
  console.log('[archive.js] triggered!');
  const request = require('request');

  if(event.body) {
    const body = JSON.parse(event.body || '{}')
    const url = body.url;
    if (url) {
      request.post(`https://web.archive.org/save/${url}`, function (error, response, body) {
        const statusCode = response && response.statusCode;
        console.log('+ url:', url);
        console.log('+ error:', error);
        console.log('+ statusCode:', statusCode);
        callback(null, { statusCode: statusCode, body: 'Sent' });
      })
    } else {
      callback(null, { statusCode: 400, body: 'URL is empty' });
    };
  } else {
    callback(null, { statusCode: 400, body: 'No payload given' });
  };
};
