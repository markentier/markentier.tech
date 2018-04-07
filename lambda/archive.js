export function handler (event, context, callback) {
  console.log('[archive.js] triggered!');
  console.log('event', event);
  console.log('context', context);

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({ msg: 'archive it!', event: event, context: context })
  });
};
