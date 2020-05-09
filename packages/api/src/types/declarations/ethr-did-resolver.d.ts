import { DIDResolver } from 'did-resolver'

declare module "ethr-did-resolver" {

  interface ResolverRegistry {
    [index: string]: DIDResolver;
  }

  const fn: (value: { rpcUrl: string }) => ResolverRegistry;
  export = fn;
}
