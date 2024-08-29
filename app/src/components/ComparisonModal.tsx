import { whitelistQueries } from "@/hooks/whitelistQueries";
import { IProjectInfo } from "@/types/whitelist.types";
import { Badge, Flex, Input, Loader, Modal, Text } from "@mantine/core";

const SimpleForm = ({
  newProjectInfo,
  oldProjectInfo,
}: {
  newProjectInfo: IProjectInfo;
  oldProjectInfo: IProjectInfo;
}) => {
  const metadataStructure = whitelistQueries.useMetadataStructure();

  const oldMetadata = JSON.parse(oldProjectInfo.metadata);
  const newMetadata = JSON.parse(newProjectInfo.metadata);

  const contractIdIsDiff =
    oldProjectInfo.contract_ids.toString() !==
    newProjectInfo.contract_ids.toString();

  return (
    <>
      {metadataStructure.data &&
        metadataStructure.data.map((v) => {
          let isDiff =
            oldMetadata[v.key].toString() !== newMetadata[v.key].toString();

          return (
            <Input.Wrapper
              label={v.label}
              mb="xs"
              px="xs"
              bd={isDiff ? "1px solid yellow.4" : undefined}
            >
              <Flex gap="sm">
                <Flex align={"center"} gap="xs" mb="xs" flex={1}>
                  <Text w={40}>Old: </Text>
                  <Input value={oldMetadata[v.key] ?? ""} w="100%" />
                </Flex>
                <Flex align={"center"} gap="xs" mb="xs" flex={1}>
                  <Text w={40}>New: </Text>
                  <Input value={newMetadata[v.key] ?? ""} w="100%" />
                </Flex>
              </Flex>
            </Input.Wrapper>
          );
        })}

      <Input.Wrapper
        label="Contract IDs"
        px="xs"
        bd={contractIdIsDiff ? "1px solid yellow.4" : undefined}
      >
        <Flex gap="sm">
          <Flex align={"center"} gap="xs" mb="xs" wrap={"wrap"} flex={1}>
            <Text w={40}>Old: </Text>
            {oldProjectInfo.contract_ids.map((v) => {
              return (
                <Badge tt={"none"} color="gray" key={v}>
                  {v}
                </Badge>
              );
            })}
          </Flex>
          <Flex align={"center"} gap="xs" mb="xs" wrap={"wrap"} flex={1}>
            <Text w={40}>New: </Text>
            {newProjectInfo.contract_ids.map((v) => {
              return (
                <Badge tt={"none"} color="gray" key={v}>
                  {v}
                </Badge>
              );
            })}
          </Flex>
        </Flex>
      </Input.Wrapper>
    </>
  );
};

export default function ComparisonModal({
  isOpen,
  close,
  newProjectInfo,
  oldProjectId,
}: {
  oldProjectId?: string;
  newProjectInfo?: IProjectInfo;
  isOpen: boolean;
  close: () => void;
}) {
  const projectInfo = whitelistQueries.useProjectById({
    projectId: oldProjectId || "",
    enabled: oldProjectId !== undefined,
  });

  return (
    <Modal opened={isOpen} title="Comparison" onClose={close} size="xl">
      {projectInfo.status === "pending" && (
        <Flex justify={"center"}>
          <Loader size="sm" />
        </Flex>
      )}
      {newProjectInfo && projectInfo.data && (
        <SimpleForm
          newProjectInfo={newProjectInfo}
          oldProjectInfo={projectInfo.data}
        />
      )}
    </Modal>
  );
}
