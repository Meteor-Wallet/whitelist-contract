"use client";

import { whitelistQueries } from "@/hooks/whitelistQueries";
import { whitelistMutate } from "../../hooks/whitelistMutate";
import { EProjectKind, IProjectInfo } from "../../types/whitelist.types";
import { Button, Flex, Input, Loader, TagsInput, Text } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

const ProposalForm = () => {
  const searchParams = useSearchParams();
  const kind = searchParams.get("kind") as EProjectKind | null;
  const projectId = searchParams.get("project_id");
  const router = useRouter();

  const [form, setForm] = useState<IProjectInfo>({
    description: "",
    audit_report_url: "",
    telegram_username: "",
    twitter_url: "",
    website_url: "",
    contract_ids: [],
  });

  const isUpdateFormInit = useRef(false);

  const type =
    kind === EProjectKind.UPDATE && projectId !== null ? "update" : "new";

  const oldProjectInfo = whitelistQueries.useProjectById({
    enabled: type === "update",
    projectId: projectId ?? undefined,
  });

  const addProject = whitelistMutate.useAddProject();
  const updateProject = whitelistMutate.useUpdateProject();

  useEffect(() => {
    if (!isUpdateFormInit.current) {
      if (type === "update" && oldProjectInfo.data) {
        setForm(oldProjectInfo.data);
        isUpdateFormInit.current = true;
      }
    }
  }, [type, oldProjectInfo]);
  return (
    <>
      <Flex gap="sm" align={"center"}>
        <Text size="xl" variant="gradient">
          {type === "update" ? "Update project" : "Add project"}
        </Text>
        {oldProjectInfo.isFetching && <Loader size="sm" />}
      </Flex>
      {type === "update" && projectId && (
        <Input.Wrapper label="Project ID">
          <Input value={projectId} disabled />
        </Input.Wrapper>
      )}
      <Input.Wrapper label="Audit report URL">
        <Input
          value={form.audit_report_url ?? ""}
          onChange={(e) =>
            setForm((s) => ({
              ...s,
              audit_report_url: e.target.value,
            }))
          }
        />
      </Input.Wrapper>
      <Input.Wrapper label="Project Description">
        <Input
          value={form.description ?? ""}
          onChange={(e) =>
            setForm((s) => ({
              ...s,
              description: e.target.value,
            }))
          }
        />
      </Input.Wrapper>
      <Input.Wrapper label="Telegram Username">
        <Input
          value={form.telegram_username ?? ""}
          onChange={(e) =>
            setForm((s) => ({
              ...s,
              telegram_username: e.target.value,
            }))
          }
        />
      </Input.Wrapper>
      <Input.Wrapper label="Twitter URL">
        <Input
          value={form.twitter_url ?? ""}
          onChange={(e) =>
            setForm((s) => ({
              ...s,
              twitter_url: e.target.value,
            }))
          }
        />
      </Input.Wrapper>
      <Input.Wrapper label="Website URL">
        <Input
          value={form.website_url ?? ""}
          onChange={(e) =>
            setForm((s) => ({
              ...s,
              website_url: e.target.value,
            }))
          }
        />
      </Input.Wrapper>
      <TagsInput
        label="Contract IDs (Enter to submit a contract ID)"
        placeholder="Enter contract ID"
        data={[]}
        value={form.contract_ids}
        onChange={(e) => {
          setForm((s) => ({
            ...s,
            contract_ids: e,
          }));
        }}
      />
      <Button
        mt={"sm"}
        loading={
          addProject.status === "pending" || updateProject.status === "pending"
        }
        onClick={async () => {
          try {
            if (type === "new") {
              await addProject.mutateAsync({
                project_info: form,
              });
            } else {
              if (projectId) {
                await updateProject.mutateAsync({
                  project_id: projectId,
                  project_info: form,
                });
              }
            }
            router.push("/");
          } catch (err) {
            // error is handled in mutation.
            console.log(err);
          }
        }}
      >
        {type === "new" ? "Add Project" : "Update Project"}
      </Button>
    </>
  );
};

export default function ProposalPage() {
  return (
    <div>
      <Suspense>
        <ProposalForm />
      </Suspense>
    </div>
  );
}
