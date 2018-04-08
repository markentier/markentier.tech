export function handler (event, context, callback) {
  console.log('event.body', event.body)

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({ msg: 'Hello, World!' })
  })
}
