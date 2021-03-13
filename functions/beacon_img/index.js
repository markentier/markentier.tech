// PUBLIC PATH: /.netlify/functions/beacon_img OR /beacon.svg

const BEACON_SVG = '<svg xmlns="http://www.w3.org/2000/svg"/>';

exports.handler = async (event, context) => {
  const qs = event.queryStringParameters || {};
  const headers = event.headers || {};

  const url = qs.u || "(missing)";
  const ua = headers["user-agent"] || "(no UA)";

  const clientIp = headers["client-ip"];
  const secUA = headers["sec-ch-ua"];
  const netlifyRequestId = headers["x-nf-request-id"];

  const more = { clientIp, secUA, netlifyRequestId }

  console.log("[PAGEHIT]", url);
  console.log("[UA]", ua);
  console.log("[more]", more)

  return {
    statusCode: 200,
    headers: { "content-type": "image/svg+xml" },
    isBase64Encoded: false,
    body: BEACON_SVG,
  };
};
