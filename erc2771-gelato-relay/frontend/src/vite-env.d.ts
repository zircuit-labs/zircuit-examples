/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GELATO_RELAY_API_KEY: string
  readonly VITE_CONTRACT_ADDRESS: string
  readonly VITE_CHAIN_ID: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
