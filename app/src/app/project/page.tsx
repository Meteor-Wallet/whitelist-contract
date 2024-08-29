"use client";
import ProposalCardWithData from "@/components/proposal/ProposalCardWithData";
import { CURRENT_NEAR_NETWORK } from "@/constant/nearConstant";
import { EQueryKeys } from "@/constant/queryKeys";
import { whitelistQueries } from "@/hooks/whitelistQueries";
import { walletSelectorAtom } from "@/jotai/wallet.jotai";
import { browserQueryClient } from "@/providers/QueryProvider";
import { Button, Flex, Loader, SimpleGrid, Text, Title } from "@mantine/core";
import { useAtomValue } from "jotai";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

const ProjectDetails = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const walletSelector = useAtomValue(walletSelectorAtom);

  const currentWalletId =
    walletSelector?.store.getState().accounts[0]?.accountId;

  const project = whitelistQueries.useProjectById({ projectId, enabled: projectId !== null });
  const metadataStructure = whitelistQueries.useMetadataStructure();

  const metadata = JSON.parse(project.data?.metadata ?? JSON.stringify({}));

  return (
    <>
      <Flex gap="sm" mb="sm">
        <Title>Project Details #{projectId}</Title>
        {project.isFetching && <Loader />}
      </Flex>
      {isClient && (
        <Flex>
          <Button
            mt={"sm"}
            w="100%"
            onClick={() => {
              browserQueryClient?.setQueryData(
                [
                  EQueryKeys.APPROVED_PROJECTS_BY_ID,
                  { projectId: projectId, network: CURRENT_NEAR_NETWORK },
                ],
                project.data
              );
              router.push(`/proposal?kind=UPDATE&project_id=${projectId}`);
            }}
            disabled={currentWalletId === undefined}
          >
            Update Project
          </Button>
        </Flex>
      )}
      <Flex direction={"column"}>
        <Text fw="bold" size="lg">
          Description
        </Text>
        <Text c="dimmed">{metadata["description"]}</Text>
      </Flex>
      <Flex gap="sm">
        {metadataStructure.data &&
          metadataStructure.data
            .filter((e) => e.key !== "description")
            .map((v) => {
              return (
                <Flex direction={"column"}>
                  <Text fw="bold" size="lg">
                    {v.label}
                  </Text>
                  <Text c="dimmed">{metadata?.[v.key]?.toString()}</Text>
                </Flex>
              );
            })}
      </Flex>

      <Title order={2}>Pending Proposal</Title>
      <SimpleGrid
        cols={{
          xs: 1,
          sm: 3,
        }}
      >
        {project.data &&
          project.data.pending_proposals.map((v) => {
            return <ProposalCardWithData proposal_id={v} />;
          })}
      </SimpleGrid>
    </>
  );
};

export default function ProjectPage() {
  return (
    <Suspense>
      <ProjectDetails />
    </Suspense>
  );
}
