export enum ENearNetwork {
  mainnet = "mainnet",
  testnet = "testnet",
}

export const CONTRACT_ID_BY_NETWORK = {
  [ENearNetwork.mainnet]: "",
  [ENearNetwork.testnet]: "whitelisthonkai.testnet",
};

export const DEFAULT_RPC_URL_BY_NETWORK = {
  [ENearNetwork.mainnet]: "https://rpc.mainnet.near.org",
  [ENearNetwork.testnet]: "https://rpc.testnet.near.org",
};

export const CURRENT_NEAR_NETWORK = process.env.NEXT_PUBLIC_NEAR_NETWORK as ENearNetwork;