import {
  DEFAULT_RPC_URL_BY_NETWORK,
  ENearNetwork
} from "@/constant/nearConstant";
import { connect, keyStores } from "near-api-js";

const myKeyStore = new keyStores.InMemoryKeyStore();

const getNear = async ({ network }: { network: ENearNetwork }) => {
  const near = await connect({
    networkId: network,
    keyStore: myKeyStore,
    nodeUrl: DEFAULT_RPC_URL_BY_NETWORK[network],
  });
  const account = await near.account("dontcare");

  return account;
};

export const nearUtils = {
  getNear,
};
