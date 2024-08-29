import { whitelistQueries } from "@/hooks/whitelistQueries";
import TableLayout from "../TableLayout";
import { useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Flex,
  Grid,
  Group,
  HoverCard,
  List,
  SimpleGrid,
  Skeleton,
  Text,
} from "@mantine/core";
import {
  IconBrandTelegram,
  IconBrandTwitter,
  IconLink,
  IconMessageReport,
} from "@tabler/icons-react";
import { whitelistMutate } from "@/hooks/whitelistMutate";
import { useAtomValue } from "jotai";
import { walletSelectorAtom } from "@/jotai/wallet.jotai";
import { EProjectKind, IProjectInfo, IProposal } from "@/types/whitelist.types";
import ComparisonModal from "../ComparisonModal";
import { useDisclosure } from "@mantine/hooks";
import ProposalCard from "./ProposalCard";

const limit = 6;

export default function Proposals() {
  const [page, setPage] = useState(0);

  const [opened, { open, close }] = useDisclosure(false);
  const [comparisonInfo, setComparisonInfo] = useState<{
    oldProjectId?: string;
    newProjectInfo?: IProjectInfo;
  }>({
    oldProjectId: undefined,
    newProjectInfo: undefined,
  });

  const proposals = whitelistQueries.useProposals({
    fromIndex: limit * page,
    limit,
  });

  const walletSelector = useAtomValue(walletSelectorAtom);

  const guardians = whitelistQueries.useGuardians();

  const currentWalletId =
    walletSelector?.store.getState().accounts[0]?.accountId;

  const isOneOfGuardians =
    guardians.data?.includes(currentWalletId ?? "") ?? false;

  return (
    <>
      <TableLayout
        isFetching={proposals.isFetching}
        isLoading={proposals.status === "pending"}
        page={page + 1}
        title="Pending Proposals"
        onClickNext={() => {
          if (proposals.data?.length !== 0) {
            setPage((i) => {
              return i + 1;
            });
          }
        }}
        onClickPrev={() => {
          setPage((i) => {
            if (i !== 0) {
              return i - 1;
            } else {
              return i;
            }
          });
        }}
      >
        <SimpleGrid
          cols={{
            xs: 1,
            sm: 3,
          }}
        >
          {proposals.status === "pending" && (
            <>
              <Skeleton h={170} />
              <Skeleton h={170} />
              <Skeleton h={170} />
            </>
          )}
          {proposals.data?.map(([proposal_id, proposal_info]) => {
            return (
              <ProposalCard
                key={proposal_id}
                isOneOfGuardians={isOneOfGuardians}
                proposalId={proposal_id}
                proposalInfo={proposal_info}
                currentWalletId={currentWalletId}
                compare={() => {
                  if (proposal_info.project_id) {
                    setComparisonInfo({
                      oldProjectId: proposal_info.project_id,
                      newProjectInfo: proposal_info.project_info,
                    });
                    open();
                  }
                }}
              />
            );
          })}
        </SimpleGrid>
      </TableLayout>

      <ComparisonModal
        oldProjectId={comparisonInfo.oldProjectId}
        newProjectInfo={comparisonInfo.newProjectInfo}
        isOpen={opened}
        close={close}
      />
    </>
  );
}
