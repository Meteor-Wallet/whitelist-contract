import { whitelistMutate } from "@/hooks/whitelistMutate";
import { EProjectKind, IProposal } from "@/types/whitelist.types";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Flex,
  Group,
  HoverCard,
  List,
  Text,
} from "@mantine/core";
import {
  IconBrandTelegram,
  IconBrandTwitter,
  IconLink,
  IconMessageReport,
} from "@tabler/icons-react";

export default function ProposalCard({
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
                  openInNewTab(
                    typeof metadata.website_url === "string"
                      ? metadata.website_url
                      : ""
                  );
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
                  openInNewTab(
                    typeof metadata.audit_report_url === "string"
                      ? metadata.audit_report_url
                      : ""
                  );
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
                  openInNewTab(
                    typeof metadata.telegram_username === "string"
                      ? metadata.telegram_username
                      : ""
                  );
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
                  openInNewTab(
                    typeof metadata.twitter_url === "string"
                      ? metadata.twitter_url
                      : ""
                  );
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
