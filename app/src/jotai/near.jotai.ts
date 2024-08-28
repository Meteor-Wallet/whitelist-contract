import { atomWithStorage } from "jotai/utils";
import { ENearNetwork } from "@/constant/nearConstant";

export const nearNetworkAtom = atomWithStorage<ENearNetwork>(
  "meteor_near_network",
  ENearNetwork.mainnet
);
