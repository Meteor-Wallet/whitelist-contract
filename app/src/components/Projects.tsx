import { whitelistQueries } from "@/hooks/whitelistQueries";
import TableLayout from "./TableLayout";
import { useState } from "react";
import {
  ActionIcon,
  Button,
  Card,
  Flex,
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
import Link from "next/link";
import { useAtomValue } from "jotai";
import { walletSelectorAtom } from "@/jotai/wallet.jotai";
import { useRouter } from "next/navigation";
import { browserQueryClient } from "@/providers/QueryProvider";
import { EQueryKeys } from "@/constant/queryKeys";
import { CURRENT_NEAR_NETWORK } from "@/constant/nearConstant";

const limit = 6;

export default function Projects() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const projects = whitelistQueries.useApprovedProjects({
    fromIndex: limit * page,
    limit,
  });

  const walletSelector = useAtomValue(walletSelectorAtom);

  const currentWalletId =
    walletSelector?.store.getState().accounts[0]?.accountId;

  return (
    <TableLayout
      isFetching={projects.isFetching}
      isLoading={projects.status === "pending"}
      page={page + 1}
      title="Approved Projects"
      onClickNext={() => {
        if (projects.data?.length !== 0) {
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
        {projects.status === "pending" && (
          <>
            <Skeleton h={170} />
            <Skeleton h={170} />
            <Skeleton h={170} />
          </>
        )}
        {projects.data?.map(([project_id, project_info]) => {
          const openInNewTab = (url: string) => {
            window.open(url, "_blank");
          };
          const metadata = JSON.parse(project_info.metadata);
          return (
            <Card
              shadow="sm"
              padding="xs"
              withBorder
              radius={"md"}
              key={project_id}
            >
              <Group justify="space-between">
                <Text fw={500}>{project_id}</Text>
              </Group>

              <Text size="sm" c="dimmed" mb={"sm"}>
                {metadata.description}
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

              <Button
                mt={"sm"}
                w="100%"
                onClick={() => {
                  browserQueryClient?.setQueryData(
                    [
                      EQueryKeys.APPROVED_PROJECTS_BY_ID,
                      { projectId: project_id, network: CURRENT_NEAR_NETWORK },
                    ],
                    project_info
                  );
                  router.push(`/project?project_id=${project_id}`);
                }}
                variant="light"
              >
                View
              </Button>
              <Button
                mt={"sm"}
                w="100%"
                onClick={() => {
                  browserQueryClient?.setQueryData(
                    [
                      EQueryKeys.APPROVED_PROJECTS_BY_ID,
                      { projectId: project_id, network: CURRENT_NEAR_NETWORK },
                    ],
                    project_info
                  );
                  router.push(`/proposal?kind=UPDATE&project_id=${project_id}`);
                }}
                disabled={currentWalletId === undefined}
              >
                Update
              </Button>
            </Card>
          );
        })}
      </SimpleGrid>
    </TableLayout>
  );
}
