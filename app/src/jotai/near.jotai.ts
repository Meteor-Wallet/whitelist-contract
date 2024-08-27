import { atomWithStorage } from "jotai/utils";
import { ENearNetwork } from "../constant/queryKeys";

export const nearNetworkAtom = atomWithStorage<ENearNetwork>(
  "near_network",
  ENearNetwork.testnet
);
