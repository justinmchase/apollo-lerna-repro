import { ApolloServer, gql } from 'apollo-server'
import { Credentials, SimpleSigner } from 'uport-credentials'
import { message, transport } from 'uport-transports'
import { Resolver } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'
import ngrok from 'ngrok'


// Make new keys...
// const { did, privateKey } = Credentials.createIdentity()
// console.log(did)
// console.log(privateKey)

const credentials = new Credentials({
  did: 'did:ethr:0x018d7f598960a64a4b674774522c4b0582bc398a',
  signer: SimpleSigner('5d554e1cb77269c8b57da7793a81015cdc8b59e3f7d15d42bffb1fe4e344afbd'), // SimpleSigner(privateKey),
  resolver: new Resolver(getResolver({ rpcUrl: 'https://mainnet.infura.io/v3/ca1094ed58b546d58a135899d83c959a' }))
})

const typeDefs = gql`
  enum ConnectState {
    pending
  }

  type Connect {
    _id: ID!
    state: ConnectState!
    token: String
    qr: String
  }

  type Health {
    ok: Boolean!
    version: String!
  }

  type Query {
    health: Health!
  }

  type Mutation {
    connect: Connect!
  }
`

const resolvers = {
  Query: {
    health: () => ({
      ok: true,
      version: process.env['npm_package_version']
    })
  },
  Mutation: {
    connect: async (root: void, args: { connectId: string }, context: unknown) => {
      console.log('connecting...')
      console.log(context)

      const requestToken = await credentials.createDisclosureRequest({
        requested: ['name', 'email', 'country', 'state'],
        notifications: true,
        callbackUrl: ''
      })
      const query = message.util.messageToURI(requestToken)
      console.log('query:', JSON.stringify(query, null, 2))

      const uri = message.util.paramsToQueryString(query, { callback_type: 'post' })
      console.log('uri:', JSON.stringify(uri, null, 2))

      const qr = transport.ui.getImageDataURI(uri)
      console.log('qr:', JSON.stringify(qr, null, 2))

      return {
        _id: "abc123",
        state: "pending",
        token: "123456789",
        qr
      }
    }
  },
}

async function main() {

  const publicUrl = await ngrok.connect(4000)
  console.log('public url:', publicUrl)

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => {
      return {
        publicUrl,
      }
    }
  })

  // The `listen` method launches a web server.
  const { url } = await server.listen({ port: 4000 })
  console.log(' local url:', url)

  async function exit(signal?: NodeJS.Signals | 'ERROR', statusCode: number = 0, err?: any) {
    console.log(`exiting with ${signal} (${statusCode})`)
    if (err) console.log(err)
    try {
      console.log('closing proxy...')
      await ngrok.kill()
    } catch (err) {
      console.log(err)
    }
    try {
      console.log('closing server...')
      await server.stop()
    } catch (err) {
      console.log(err)
    } finally {
      process.exit(0)
    }
  }

  // process.on('SIGKILL', (signal) => console.log(signal)) // exit(signal))
  process.on('SIGTERM', exit)
  process.on('SIGINT', exit)
  process.on('SIGLOST', exit)
  process.on('unhandledRejection', err => exit('ERROR', -1, err))
}

main().catch(err => {
  console.log(err)
  process.exit(1)
})
