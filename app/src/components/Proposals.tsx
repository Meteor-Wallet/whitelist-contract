import { whitelistQueries } from "@/hooks/whitelistQueries";
import TableLayout from "./TableLayout";
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
import ComparisonModal from "./ComparisonModal";
import { useDisclosure } from "@mantine/hooks";

const limit = 6;

function ProposalCard({
  proposalId,
  proposalInfo,
  currentWalletId,
  compare,
  isOneOfGuardians,
}: {
  proposalId: string;
  proposalInfo: IProposal;
  currentWalletId?: string;
  compare: () => void;
  isOneOfGuardians: boolean;
}) {
  const voteProposal = whitelistMutate.useVoteProposal();
  const withdrawVote = whitelistMutate.useWithdrawVoteOnProposal();
  const metadataStructure = whitelistQueries.useMetadataStructure();

  const { project_info } = proposalInfo;
  const metadata = JSON.parse(project_info.metadata) as {
    [key: string]: string | string[];
  };
  const {
    description,
    website_url,
    audit_report_url,
    telegram_username,
    twitter_url,
    ...rest
  } = metadata;
  const openInNewTab = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <Card shadow="sm" padding="xs" withBorder radius={"md"}>
      <Group justify="space-between">
        <Text fw={500}>{proposalId}</Text>
        <Badge>{proposalInfo.kind}</Badge>
      </Group>

      <Text size="sm" c="dimmed" mb={"sm"}>
        {metadata["description"]}
      </Text>
      <HoverCard shadow="md" openDelay={500}>
        <HoverCard.Target>
          <List size="sm">
            {project_info.contract_ids.slice(0, 2).map((v) => {
              return <List.Item key={v}>{v}</List.Item>;
            })}
            {project_info.contract_ids.length > 2 && (
              <List.Item>more...</List.Item>
            )}
          </List>
        </HoverCard.Target>

        <HoverCard.Dropdown>
          <Text>All contract ID</Text>
          <List size="sm">
            {project_info.contract_ids.map((v) => {
              return <List.Item key={`modal-${v}`}>{v}</List.Item>;
            })}
          </List>
        </HoverCard.Dropdown>
      </HoverCard>

      {Object.entries(rest).length > 0 && (
        <>
          <Text mt={"sm"}>Additional metadata</Text>
          <List size="sm">
            {Object.entries(rest).map(([key, value]) => {
              return (
                <List.Item>
                  {key}: {value}
                </List.Item>
              );
            })}
          </List>
        </>
      )}

      <Flex
        align={"flex-end"}
        justify={"flex-end"}
        direction={"column"}
        flex={1}
      >
        <Flex gap="xs" my={"xs"}>
          {metadata.website_url && (
            <ActionIcon
              size="lg"
              variant="subtle"
              onClick={() => {
                if (metadata.website_url) {
                  openInNewTab(metadata.website_url);
                }
              }}
            >
              <IconLink />
            </ActionIcon>
          )}
          {metadata.audit_report_url && (
            <ActionIcon
              size="lg"
              variant="subtle"
              onClick={() => {
                if (metadata.audit_report_url) {
                  openInNewTab(metadata.audit_report_url);
                }
              }}
            >
              <IconMessageReport />
            </ActionIcon>
          )}
          {metadata.telegram_username && (
            <ActionIcon
              size="lg"
              variant="subtle"
              onClick={() => {
                if (metadata.telegram_username) {
                  openInNewTab(metadata.telegram_username);
                }
              }}
            >
              <IconBrandTelegram />
            </ActionIcon>
          )}
          {metadata.twitter_url && (
            <ActionIcon
              size="lg"
              variant="subtle"
              onClick={() => {
                if (metadata.twitter_url) {
                  openInNewTab(metadata.twitter_url);
                }
              }}
            >
              <IconBrandTwitter />
            </ActionIcon>
          )}
        </Flex>
      </Flex>

      {proposalInfo.kind === EProjectKind.UPDATE && (
        <Button variant="light" mb="xs" onClick={compare}>
          Compare
        </Button>
      )}
      {proposalInfo.votes.includes(currentWalletId || "") ? (
        <Button
          disabled={currentWalletId === undefined || !isOneOfGuardians}
          loading={withdrawVote.status === "pending"}
          onClick={() => {
            withdrawVote.mutate(proposalId);
          }}
        >
          Withdraw Vote ({proposalInfo.votes.length})
        </Button>
      ) : (
        <Button
          disabled={currentWalletId === undefined || !isOneOfGuardians}
          loading={voteProposal.status === "pending"}
          onClick={() => {
            voteProposal.mutate(proposalId);
          }}
        >
          Vote ({proposalInfo.votes.length})
        </Button>
      )}
    </Card>
  );
}

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
