// PUBLIC PATH: /.netlify/functions/beacon_png

const BEACON_PNG_B64 =  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklE" +
                        "QVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg";

exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    headers: {"content-type": "image/png"},
    isBase64Encoded: true,
    body: BEACON_PNG_B64
  };
}
