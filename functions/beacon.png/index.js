// PUBLIC PATH: /.netlify/functions/beacon.png

const BEACON_PNG_B64 =  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklE" +
                        "QVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg";

exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: BEACON_PNG_B64
  };
}
