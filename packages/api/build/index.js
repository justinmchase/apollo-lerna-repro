"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const uport_credentials_1 = require("uport-credentials");
const uport_transports_1 = require("uport-transports");
const did_resolver_1 = require("did-resolver");
const ethr_did_resolver_1 = require("ethr-did-resolver");
const ngrok_1 = __importDefault(require("ngrok"));
// Make new keys...
// const { did, privateKey } = Credentials.createIdentity()
// console.log(did)
// console.log(privateKey)
const credentials = new uport_credentials_1.Credentials({
    did: 'did:ethr:0x018d7f598960a64a4b674774522c4b0582bc398a',
    signer: uport_credentials_1.SimpleSigner('5d554e1cb77269c8b57da7793a81015cdc8b59e3f7d15d42bffb1fe4e344afbd'),
    resolver: new did_resolver_1.Resolver(ethr_did_resolver_1.getResolver({ rpcUrl: 'https://mainnet.infura.io/v3/ca1094ed58b546d58a135899d83c959a' }))
});
const typeDefs = apollo_server_1.gql `
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
`;
const resolvers = {
    Query: {
        health: () => ({
            ok: true,
            version: process.env['npm_package_version']
        })
    },
    Mutation: {
        connect: async (root, args, context) => {
            console.log('connecting...');
            console.log(context);
            const requestToken = await credentials.createDisclosureRequest({
                requested: ['name', 'email', 'country', 'state'],
                notifications: true,
                callbackUrl: ''
            });
            const query = uport_transports_1.message.util.messageToURI(requestToken);
            console.log('query:', JSON.stringify(query, null, 2));
            const uri = uport_transports_1.message.util.paramsToQueryString(query, { callback_type: 'post' });
            console.log('uri:', JSON.stringify(uri, null, 2));
            const qr = uport_transports_1.transport.ui.getImageDataURI(uri);
            console.log('qr:', JSON.stringify(qr, null, 2));
            return {
                _id: "abc123",
                state: "pending",
                token: "123456789",
                qr
            };
        }
    },
};
async function main() {
    const publicUrl = await ngrok_1.default.connect(4000);
    console.log('public url:', publicUrl);
    const server = new apollo_server_1.ApolloServer({
        typeDefs,
        resolvers,
        context: () => {
            return {
                publicUrl,
            };
        }
    });
    // The `listen` method launches a web server.
    const { url } = await server.listen({ port: 4000 });
    console.log(' local url:', url);
    async function exit(signal, statusCode = 0, err) {
        console.log(`exiting with ${signal} (${statusCode})`);
        if (err)
            console.log(err);
        try {
            console.log('closing proxy...');
            await ngrok_1.default.kill();
        }
        catch (err) {
            console.log(err);
        }
        try {
            console.log('closing server...');
            await server.stop();
        }
        catch (err) {
            console.log(err);
        }
        finally {
            process.exit(0);
        }
    }
    // process.on('SIGKILL', (signal) => console.log(signal)) // exit(signal))
    process.on('SIGTERM', exit);
    process.on('SIGINT', exit);
    process.on('SIGLOST', exit);
    process.on('unhandledRejection', err => exit('ERROR', -1, err));
}
main().catch(err => {
    console.log(err);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxpREFBaUQ7QUFDakQseURBQTZEO0FBQzdELHVEQUFxRDtBQUNyRCwrQ0FBdUM7QUFDdkMseURBQStDO0FBQy9DLGtEQUF5QjtBQUd6QixtQkFBbUI7QUFDbkIsMkRBQTJEO0FBQzNELG1CQUFtQjtBQUNuQiwwQkFBMEI7QUFFMUIsTUFBTSxXQUFXLEdBQUcsSUFBSSwrQkFBVyxDQUFDO0lBQ2xDLEdBQUcsRUFBRSxxREFBcUQ7SUFDMUQsTUFBTSxFQUFFLGdDQUFZLENBQUMsa0VBQWtFLENBQUM7SUFDeEYsUUFBUSxFQUFFLElBQUksdUJBQVEsQ0FBQywrQkFBVyxDQUFDLEVBQUUsTUFBTSxFQUFFLCtEQUErRCxFQUFFLENBQUMsQ0FBQztDQUNqSCxDQUFDLENBQUE7QUFFRixNQUFNLFFBQVEsR0FBRyxtQkFBRyxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3Qm5CLENBQUE7QUFFRCxNQUFNLFNBQVMsR0FBRztJQUNoQixLQUFLLEVBQUU7UUFDTCxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUNiLEVBQUUsRUFBRSxJQUFJO1lBQ1IsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUM7U0FDNUMsQ0FBQztLQUNIO0lBQ0QsUUFBUSxFQUFFO1FBQ1IsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFVLEVBQUUsSUFBMkIsRUFBRSxPQUFnQixFQUFFLEVBQUU7WUFDM0UsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQTtZQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBRXBCLE1BQU0sWUFBWSxHQUFHLE1BQU0sV0FBVyxDQUFDLHVCQUF1QixDQUFDO2dCQUM3RCxTQUFTLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFNB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