import { utils } from "near-api-js";
import { CONTRACT_ID_BY_NETWORK, EQueryKeys } from "../constant/queryKeys";
import { nearNetworkAtom } from "../jotai/near.jotai";
import { walletSelectorAtom } from "../jotai/wallet.jotai";
import { useMutation } from "@tanstack/react-query";
import { useAtom, useAtomValue } from "jotai";
import { browserQueryClient } from "../providers/QueryProvider";
import { IProjectInfo } from "@/types/whitelist.types";
import { notifications } from "@mantine/notifications";

const useVoteProposal = () => {
  const walletSelector = useAtomValue(walletSelectorAtom);
  const network = useAtomValue(nearNetworkAtom);

  return useMutation({
    mutationFn: async (proposal_id: string) => {
      if (walletSelector) {
        const wallet = await walletSelector.wallet();
        if (wallet) {
          await wallet.signAndSendTransaction({
            receiverId: CONTRACT_ID_BY_NETWORK[network],
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "vote_proposal",
                  args: {
                    proposal_id,
                  },
                  gas: utils.format.parseNearAmount("0.00000000003")!,
                  deposit: "0",
                },
              },
            ],
          });
        } else {
          throw new Error("Please login with a wallet first");
        }
      } else {
        throw new Error("Wallet selector is not initialized.");
      }
    },
    onSuccess: () => {
      browserQueryClient?.invalidateQueries({
        queryKey: [EQueryKeys.APPROVED_CONTRACTS],
      });
      browserQueryClient?.invalidateQueries({
        queryKey: [EQueryKeys.APPROVED_PROJECTS],
      });
      browserQueryClient?.invalidateQueries({
        queryKey: [EQueryKeys.PROPOSALS],
      });
    },
    onError: (err) => {
      notifications.show({
        title: "Error",
        message: err.message,
        color: "red",
      });
    },
  });
};

const useWithdrawVoteOnProposal = () => {
  const walletSelector = useAtomValue(walletSelectorAtom);
  const network = useAtomValue(nearNetworkAtom);

  return useMutation({
    mutationFn: async (proposal_id: string) => {
      if (walletSelector) {
        const wallet = await walletSelector.wallet();
        if (wallet) {
          await wallet.signAndSendTransaction({
            receiverId: CONTRACT_ID_BY_NETWORK[network],
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "withdraw_vote_on_proposal",
                  args: {
                    proposal_id,
                  },
                  gas: utils.format.parseNearAmount("0.00000000003")!,
                  deposit: "0",
                },
              },
            ],
          });
        } else {
          throw new Error("Please login with a wallet first");
        }
      } else {
        throw new Error("Wallet selector is not initialized.");
      }
    },
    onSuccess: () => {
      browserQueryClient?.invalidateQueries({
        queryKey: [EQueryKeys.PROPOSALS],
      });
    },
    onError: (err) => {
      notifications.show({
        title: "Error",
        message: err.message,
        color: "red",
      });
    },
  });
};

const useAddProject = () => {
  const walletSelector = useAtomValue(walletSelectorAtom);
  const network = useAtomValue(nearNetworkAtom);

  return useMutation({
    mutationFn: async ({ project_info }: { project_info: IProjectInfo }) => {
      if (walletSelector) {
        const wallet = await walletSelector.wallet();
        if (wallet) {
          await wallet.signAndSendTransaction({
            receiverId: CONTRACT_ID_BY_NETWORK[network],
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "add_project",
                  args: {
                    ...project_info,
                  },
                  gas: utils.format.parseNearAmount("0.00000000003")!,
                  deposit: utils.format.parseNearAmount("1")!,
                },
              },
            ],
          });
        } else {
          throw new Error("Please login with a wallet first");
        }
      } else {
        throw new Error("Wallet selector is not initialized.");
      }
    },
    onSuccess: () => {
      browserQueryClient?.invalidateQueries({
        queryKey: [EQueryKeys.PROPOSALS],
      });
    },
    onError: (err) => {
      notifications.show({
        title: "Error",
        message: err.message,
        color: "red",
      });
    },
  });
};

const useUpdateProject = () => {
  const walletSelector = useAtomValue(walletSelectorAtom);
  const network = useAtomValue(nearNetworkAtom);

  return useMutation({
    mutationFn: async ({
      project_info,
      project_id,
    }: {
      project_info: IProjectInfo;
      project_id: string;
    }) => {
      if (walletSelector) {
        const wallet = await walletSelector.wallet();
        if (wallet) {
          await wallet.signAndSendTransaction({
            receiverId: CONTRACT_ID_BY_NETWORK[network],
            actions: [
              {
                type: "FunctionCall",
                params: {
                  methodName: "update_project",
                  args: {
                    project_id,
                    ...project_info,
                  },
                  gas: utils.format.parseNearAmount("0.00000000003")!,
                  deposit: utils.format.parseNearAmount("1")!,
                },
              },
            ],
          });
        } else {
          throw new Error("Please login with a wallet first");
        }
      } else {
        throw new Error("Wallet selector is not initialized.");
      }
    },
    onSuccess: () => {
      browserQueryClient?.invalidateQueries({
        queryKey: [EQueryKeys.PROPOSALS],
      });
    },
    onError: (err) => {
      notifications.show({
        title: "Error",
        message: err.message,
        color: "red",
      });
    },
  });
};

export const whitelistMutate = {
  useVoteProposal,
  useWithdrawVoteOnProposal,
  useAddProject,
  useUpdateProject,
};
