import { ApolloServer, gql } from 'apollo-server'
import * as uuid from 'uuid'

type Signals = NodeJS.Signals | 'EXIT' | 'ERROR' | 'WARN'

const typeDefs = gql`
  type Health {
    ok: Boolean!
    instanceId: ID!
    version: String!
  }

  type Query {
    health(count:Int!): Health!
  }
`

const instanceId = uuid.v4();
const resolvers = {
  Query: {
    health: (root: void, args: { count: number }) => {
      console.log('health:', JSON.stringify({
        pid: process.pid,
        ppid: process.ppid,
        connected: process.connected,
        exitCode: process.exitCode,
        count: args.count,
        instanceId
      }))
      return {
        ok: true,
        instanceId,
        version: process.env['npm_package_version']
      }
    }
  },
}

async function main() {
  console.log('starting...')
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  // The `listen` method launches a web server.
  const { url } = await server.listen({ port: 4000 })
  console.log('  instance:', instanceId)
  console.log(' local url:', url)

  async function stop() {
    console.log('stopping...')
    // console.log((server as any).httpServer)
    await server.stop()
    console.log('stopped.')
  }

  async function exit(sig?: Signals, statusCode: number = 0, err?: any) {
    console.log('exiting...')
    signal(sig, statusCode, err)

    // await stop() // uncomment this line to see orphaning...

    console.log('exit.')
    process.exit(statusCode)
  }

  function signal(sig?: Signals, statusCode: number = 0, err?: any) {
    console.log(`signal ${sig} (${statusCode})`)
    if (err) console.log(err)
  }

  // tsc-watch sends this signal
  process.on('SIGTERM', exit)

  process.on('SIGABRT', (sig: Signals, statusCode: number = 0) => {
    signal(sig, statusCode)
    stop().then(() => { }).catch(() => { })
  });

  process.on('SIGALRM', exit)
  process.on('SIGBREAK', exit)
  process.on('SIGBUS', exit)
  process.on('SIGCHLD', exit)
  process.on('SIGCONT', exit)
  process.on('SIGFPE', exit)
  process.on('SIGFPE', exit)
  process.on('SIGHUP', exit)
  process.on('SIGILL', exit)
  process.on('SIGINFO', exit)
  process.on('SIGINT', exit)
  process.on('SIGIO', exit)
  process.on('SIGIOT', exit)
  // process.on('SIGKILL', exit) // this crashes node for some reason
  process.on('SIGLOST', exit)
  process.on('SIGPIPE', exit)
  process.on('SIGPOLL', exit)
  process.on('SIGPROF', exit)
  process.on('SIGPWR', exit)
  process.on('SIGQUIT', exit)
  process.on('SIGSEGV', exit)
  process.on('SIGSTKFLT', exit)
  // process.on('SIGSTOP', exit) // crashes node
  process.on('SIGSYS', exit)
  process.on('SIGTRAP', exit)
  process.on('SIGTSTP', exit)
  process.on('SIGTTIN', exit)
  process.on('SIGTTOU', exit)
  process.on('SIGUNUSED', exit)
  process.on('SIGURG', exit)
  process.on('SIGUSR1', exit)
  process.on('SIGUSR2', exit)
  process.on('SIGVTALRM', exit)
  process.on('SIGWINCH', signal)
  process.on('SIGXCPU', exit)
  process.on('SIGXFSZ', exit)

  process.on('beforeExit', (code) => console.log('before exit:', code))
  process.on('exit', (code) => signal('EXIT', code, null))
  process.on('warning', (err) => signal('WARN', -4, err))

  process.on('uncaughtException', err => exit('ERROR', -1, err))
  process.on('unhandledRejection', err => exit('ERROR', -2, err))
}

main().catch(err => {
  console.log(err)
  process.exit(1)
})
