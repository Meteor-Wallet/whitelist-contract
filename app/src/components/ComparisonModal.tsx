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
  return (
    <>
      <Input.Wrapper label="Audit report URL">
        <Flex align={"center"} gap="xs" mb="xs">
          <Text w={40}>Old: </Text>
          <Input
            value={oldProjectInfo.audit_report_url ?? ""}
            disabled
            w="100%"
          />
        </Flex>
        <Flex align={"center"} gap="xs" mb="xs">
          <Text w={40}>New: </Text>
          <Input
            value={newProjectInfo.audit_report_url ?? ""}
            disabled
            w="100%"
          />
        </Flex>
      </Input.Wrapper>

      <Input.Wrapper label="Project Description">
        <Flex align={"center"} gap="xs" mb="xs">
          <Text w={40}>Old: </Text>
          <Input value={oldProjectInfo.description ?? ""} disabled w="100%" />
        </Flex>
        <Flex align={"center"} gap="xs" mb="xs">
          <Text w={40}>New: </Text>
          <Input value={newProjectInfo.description ?? ""} disabled w="100%" />
        </Flex>
      </Input.Wrapper>

      <Input.Wrapper label="Telegram Username">
        <Flex align={"center"} gap="xs" mb="xs">
          <Text w={40}>Old: </Text>
          <Input
            value={oldProjectInfo.telegram_username ?? ""}
            disabled
            w="100%"
          />
        </Flex>
        <Flex align={"center"} gap="xs" mb="xs">
          <Text w={40}>New: </Text>
          <Input
            value={newProjectInfo.telegram_username ?? ""}
            disabled
            w="100%"
          />
        </Flex>
      </Input.Wrapper>

      <Input.Wrapper label="Twitter URL">
        <Flex align={"center"} gap="xs" mb="xs">
          <Text w={40}>Old: </Text>
          <Input value={oldProjectInfo.twitter_url ?? ""} disabled w="100%" />
        </Flex>
        <Flex align={"center"} gap="xs" mb="xs">
          <Text w={40}>New: </Text>
          <Input value={newProjectInfo.twitter_url ?? ""} disabled w="100%" />
        </Flex>
      </Input.Wrapper>

      <Input.Wrapper label="Website URL">
        <Flex align={"center"} gap="xs" mb="xs">
          <Text w={40}>Old: </Text>
          <Input value={oldProjectInfo.website_url ?? ""} disabled w="100%" />
        </Flex>
        <Flex align={"center"} gap="xs" mb="xs">
          <Text w={40}>New: </Text>
          <Input value={newProjectInfo.website_url ?? ""} disabled w="100%" />
        </Flex>
      </Input.Wrapper>

      <Input.Wrapper label="Contract IDs">
        <Flex align={"center"} gap="xs" mb="xs" wrap={"wrap"}>
          <Text w={40}>Old: </Text>
          {oldProjectInfo.contract_ids.map((v) => {
            return (
              <Badge tt={"none"} color="gray">
                {v}
              </Badge>
            );
          })}
        </Flex>
        <Flex align={"center"} gap="xs" mb="xs" wrap={"wrap"}>
          <Text w={40}>New: </Text>
          {newProjectInfo.contract_ids.map((v) => {
            return (
              <Badge tt={"none"} color="gray">
                {v}
              </Badge>
            );
          })}
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
    projectId: oldProjectId,
  });

  return (
    <Modal opened={isOpen} title="Comparison" onClose={close}>
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
