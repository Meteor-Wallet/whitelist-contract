"use client";
import { useAtomValue } from "jotai";
import { EQueryKeys } from "../constant/queryKeys";
import { CONTRACT_ID_BY_NETWORK } from "@/constant/nearConstant";
import { nearUtils } from "../near/near";
import {
  keepPreviousData,
  UndefinedInitialDataOptions,
  useQuery,
} from "@tanstack/react-query";
import { CURRENT_NEAR_NETWORK } from "@/constant/nearConstant";
import { IProjectInfo, IProposal } from "@/types/whitelist.types";

const useGuardians = () => {
  const network = CURRENT_NEAR_NETWORK;

  return useQuery({
    queryKey: [EQueryKeys.GUARDIANS, { network }],
    queryFn: async () => {
      const near = await nearUtils.getNear({
        network,
      });

      const outcome: string[] = await near.viewFunction({
        methodName: "list_guardians",
        contractId: CONTRACT_ID_BY_NETWORK[network],
      });

      return outcome;
    },
  });
};

const useApprovedProjects = ({
  limit,
  fromIndex,
}: {
  limit: number;
  fromIndex: number;
}) => {
  const network = CURRENT_NEAR_NETWORK;

  return useQuery({
    queryKey: [EQueryKeys.APPROVED_PROJECTS, { limit, fromIndex, network }],
    queryFn: async () => {
      const near = await nearUtils.getNear({
        network,
      });

      const outcome: [string, IProjectInfo][] = await near.viewFunction({
        methodName: "list_projects",
        contractId: CONTRACT_ID_BY_NETWORK[network],
        args: {
          limit,
          from_index: fromIndex,
        },
      });

      return outcome;
    },
    placeholderData: keepPreviousData,
  });
};

const useApprovedContracts = ({
  limit,
  fromIndex,
}: {
  limit: number;
  fromIndex: number;
}) => {
  const network = CURRENT_NEAR_NETWORK;

  return useQuery({
    queryKey: [EQueryKeys.APPROVED_CONTRACTS, { limit, fromIndex, network }],
    queryFn: async () => {
      const near = await nearUtils.getNear({
        network,
      });

      const outcome: [string, number][] = await near.viewFunction({
        methodName: "list_contracts",
        contractId: CONTRACT_ID_BY_NETWORK[network],
        args: {
          limit,
          from_index: fromIndex,
        },
      });

      return outcome;
    },
    placeholderData: keepPreviousData,
  });
};

const useProposals = ({
  limit,
  fromIndex,
}: {
  limit: number;
  fromIndex: number;
}) => {
  const network = CURRENT_NEAR_NETWORK;

  return useQuery({
    queryKey: [EQueryKeys.PROPOSALS, { limit, fromIndex, network }],
    queryFn: async () => {
      const near = await nearUtils.getNear({
        network,
      });

      const outcome: [string, IProposal][] = await near.viewFunction({
        methodName: "list_proposals",
        contractId: CONTRACT_ID_BY_NETWORK[network],
        args: {
          limit,
          from_index: fromIndex,
        },
      });

      return outcome;
    },
    placeholderData: keepPreviousData,
  });
};

const useProjectById = ({
  projectId,
  enabled,
}: {
  projectId?: string;
  enabled?: boolean;
}) => {
  const network = CURRENT_NEAR_NETWORK;

  return useQuery({
    queryKey: [EQueryKeys.APPROVED_PROJECTS, { projectId, network }],
    queryFn: async () => {
      if (!projectId) {
        return undefined;
      }

      const near = await nearUtils.getNear({
        network,
      });

      const outcome: IProjectInfo | undefined = await near.viewFunction({
        methodName: "get_project_by_id",
        contractId: CONTRACT_ID_BY_NETWORK[network],
        args: {
          project_id: projectId,
        },
      });

      return outcome;
    },
    enabled,
  });
};

const useIsContractWhitelisted = ({
  contract_id,
  enabled,
}: {
  contract_id: string;
  enabled?: boolean;
}) => {
  const network = CURRENT_NEAR_NETWORK;

  return useQuery({
    queryKey: [EQueryKeys.CONTRACT_ID_WHITELIST, { contract_id, network }],
    queryFn: async () => {
      if (!contract_id) {
        return false;
      }

      const near = await nearUtils.getNear({
        network,
      });

      const outcome: boolean = await near.viewFunction({
        methodName: "check_contract_whitelisted",
        contractId: CONTRACT_ID_BY_NETWORK[network],
        args: {
          contract_id: contract_id,
        },
      });

      return outcome;
    },
    enabled,
  });
};

export const whitelistQueries = {
  useGuardians,
  useApprovedProjects,
  useApprovedContracts,
  useProposals,
  useProjectById,
  useIsContractWhitelisted,
};
