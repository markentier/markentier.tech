export function handler (event, context, callback) {
  console.log('event', event)
  console.log('context', context)

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({ msg: 'Hello, World!' })
  })
}
