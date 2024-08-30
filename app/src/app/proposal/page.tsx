"use client";

import { whitelistQueries } from "@/hooks/whitelistQueries";
import { whitelistMutate } from "../../hooks/whitelistMutate";
import { EProjectKind, IProjectInfo } from "../../types/whitelist.types";
import { Button, Flex, Input, Loader, TagsInput, Text } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

interface IForm {
  contract_ids: string[];
  metadata: {
    [key: string]: string | string[];
  };
  project_id: string;
}

const ProposalForm = () => {
  const searchParams = useSearchParams();
  const kind = searchParams.get("kind") as EProjectKind | null;
  const projectId = searchParams.get("project_id");
  const router = useRouter();

  const metadataStructure = whitelistQueries.useMetadataStructure();

  const isUpdateFormInit = useRef(false);

  const type =
    kind === EProjectKind.UPDATE && projectId !== null ? "update" : "new";

  const oldProjectInfo = whitelistQueries.useProjectById({
    enabled:
      type === "update" &&
      metadataStructure.status === "success" &&
      projectId !== null,
    projectId: projectId ?? "",
  });

  const addProject = whitelistMutate.useAddProject();
  const updateProject = whitelistMutate.useUpdateProject();

  const [form, setForm] = useState<IForm>({
    metadata: {},
    contract_ids: [],
    project_id: "",
  });

  useEffect(() => {
    if (type === "new" && metadataStructure.data) {
      setForm((s) => {
        const tmp = { ...s };
        metadataStructure.data.map(({ key, value_type }) => {
          tmp.metadata[key] = value_type === "STRING" ? "" : [];
        });
        return tmp;
      });
    }
  }, [metadataStructure.data]);

  useEffect(() => {
    if (!isUpdateFormInit.current) {
      if (type === "update" && metadataStructure.data && oldProjectInfo.data) {
        const oldMetadata = JSON.parse(oldProjectInfo.data.metadata);

        setForm((s) => {
          const tmp = { ...s };
          metadataStructure.data.map(({ key, value_type }) => {
            if (oldMetadata[key]) {
              tmp.metadata[key] = oldMetadata[key];
            } else {
              tmp.metadata[key] = value_type === "STRING" ? "" : [];
            }
          });
          tmp.contract_ids = oldProjectInfo.data?.contract_ids!;
          return tmp;
        });
        isUpdateFormInit.current = true;
      }
    }
  }, [type, oldProjectInfo.data, metadataStructure.data]);

  console.log(form);

  return (
    <>
      <Flex gap="sm" align={"center"}>
        <Text size="xl" variant="gradient">
          {type === "update" ? "Update project" : "Add project"}
        </Text>
        {(oldProjectInfo.isFetching || metadataStructure.isFetching) && (
          <Loader size="sm" />
        )}
      </Flex>
      {type === "update" && projectId && (
        <Input.Wrapper label="Project ID">
          <Input value={projectId} disabled />
        </Input.Wrapper>
      )}
      {type === "new" && (
        <Input.Wrapper label="Project ID">
          <Input
            value={form.project_id}
            onChange={(e) =>
              setForm((s) => ({
                ...s,
                project_id: e.target.value,
              }))
            }
          />
        </Input.Wrapper>
      )}
      {metadataStructure.data &&
        metadataStructure.data.map((structure) => {
          if (structure.value_type === "ARRAY") {
            let value = form.metadata[structure.key];
            if (typeof value === "string") {
              value = [];
            }
            return (
              <TagsInput
                key={structure.key}
                label={structure.label}
                data={[]}
                value={value}
                onChange={(e) => {
                  setForm((s) => {
                    const tmp = { ...s };
                    tmp.metadata[structure.key] = e;
                    return tmp;
                  });
                }}
              />
            );
          }
          return (
            <Input.Wrapper label={structure.label} key={structure.key}>
              <Input
                value={form.metadata[structure.key] ?? ""}
                onChange={(e) =>
                  setForm((s) => {
                    const tmp = { ...s };
                    tmp.metadata[structure.key] = e.target.value;
                    return tmp;
                  })
                }
              />
            </Input.Wrapper>
          );
        })}

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
                project_info: {
                  contract_ids: form.contract_ids,
                  metadata: JSON.stringify(form.metadata),
                  project_id: form.project_id
                },
              });
            } else {
              if (projectId) {
                await updateProject.mutateAsync({
                  project_id: projectId,
                  project_info: {
                    contract_ids: form.contract_ids,
                    metadata: JSON.stringify(form.metadata),
                    project_id: projectId
                  },
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
