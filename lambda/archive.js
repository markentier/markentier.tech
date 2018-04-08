export function handler (event, context, callback) {
  const sgKey = process.env.SENDGRID_API_KEY;
  const sgTo = process.env.SENDGRID_TO;
  const sgMail = require('@sendgrid/mail');

  sgMail.setApiKey(sgKey);

  console.log('[archive.js] triggered!');
  console.log('event', event);
  console.log('context', context);

  if(event.body) {
    const sEvent = JSON.stringify(event);
    const sContext = JSON.stringify(context);
    const msg = {
      to: sgTo,
      from: 'noreply+netlify-deployment@markentier.tech',
      subject: 'Deployment happened!',
      text: `Event: ${sEvent}\nContext: ${sContext}\n\nBye!`,
      html: `<p>Event: ${sEvent}\nContext: ${sContext}\n\nBye!<p>`
    };
    console.log(`[SG-MSG]\n${JSON.stringify(msg)}`);
    sgMail.send(msg);

    callback(null, { statusCode: 200, body: 'Sent' });
  } else {
    callback(null, { statusCode: 400, body: 'No payload given' });
  };
};
