// PUBLIC PATH: /.netlify/functions/beacon_img OR /beacon.svg

const BEACON_SVG = '<svg xmlns="http://www.w3.org/2000/svg"/>';

exports.handler = async (event, context) => {
  const qs = event.queryStringParameters || {};
  const url = qs.u || "(missing)";
  const headers = event.headers || {};
  const ua = headers["user-agent"] || "(no UA)";

  console.log("[PAGEHIT]", url);
  console.log("[UA]", ua);

  return {
    statusCode: 200,
    headers: { "content-type": "image/svg+xml" },
    isBase64Encoded: false,
    body: BEACON_SVG,
  };
};
