export enum EQueryKeys {
  GUARDIANS = "GUARDIANS",
  APPROVED_PROJECTS = "APPROVED_PROJECTS",
  APPROVED_CONTRACTS = "APPROVED_CONTRACTS",
  PROPOSALS = "PROPOSALS",
  CONTRACT_ID_WHITELIST = "CONTRACT_ID_WHITELIST"
}

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
