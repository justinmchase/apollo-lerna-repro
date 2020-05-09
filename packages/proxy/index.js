const ngrok = require('ngrok')

async function main() {
  // const url = await ngrok.connect(4000)
  // console.log('public url:', url)
}
async function exit() {
  // await ngrok.kill()
}
process.on('SIGTERM', exit)
main()
