import { whitelistQueries } from "@/hooks/whitelistQueries";
import ProposalCard from "./ProposalCard";
import ComparisonModal from "../ComparisonModal";
import { IProjectInfo } from "@/types/whitelist.types";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { useAtomValue } from "jotai";
import { walletSelectorAtom } from "@/jotai/wallet.jotai";
import { Skeleton } from "@mantine/core";

export default function ProposalCardWithData({
  proposal_id,
}: {
  proposal_id: string;
}) {
  const walletSelector = useAtomValue(walletSelectorAtom);

  const proposalInfo = whitelistQueries.useProposalById(proposal_id);
  const guardians = whitelistQueries.useGuardians();

  const [opened, { open, close }] = useDisclosure(false);

  const [comparisonInfo, setComparisonInfo] = useState<{
    oldProjectId?: string;
    newProjectInfo?: IProjectInfo;
  }>({
    oldProjectId: undefined,
    newProjectInfo: undefined,
  });

  const currentWalletId =
    walletSelector?.store.getState().accounts[0]?.accountId;

  const isOneOfGuardians =
    guardians.data?.includes(currentWalletId ?? "") ?? false;

  if (proposalInfo.isFetching || guardians.isFetching) {
    return <Skeleton h={170} />;
  }

  return (
    <>
      <ProposalCard
        currentWalletId={currentWalletId}
        isOneOfGuardians={isOneOfGuardians}
        proposalId={proposal_id}
        proposalInfo={proposalInfo.data}
        compare={() => {
          if (proposalInfo.data.project_id) {
            setComparisonInfo({
              oldProjectId: proposalInfo.data.project_id,
              newProjectInfo: proposalInfo.data.project_info,
            });
            open();
          }
        }}
      />
      <ComparisonModal
        oldProjectId={comparisonInfo.oldProjectId}
        newProjectInfo={comparisonInfo.newProjectInfo}
        isOpen={opened}
        close={close}
      />
    </>
  );
}
