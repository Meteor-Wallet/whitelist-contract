"use client";

import { whitelistQueries } from "@/hooks/whitelistQueries";
import { Badge, Flex, Skeleton, Text } from "@mantine/core";

export default function Guardians() {
  const guardians = whitelistQueries.useGuardians();
  return (
    <>
      <Text>Guardians:</Text>
      {guardians.isLoading ? (
        <Flex gap="10">
          <Skeleton height={25} w={160} radius={20} />
          <Skeleton height={25} w={160} radius={20} />
          <Skeleton height={25} w={160} radius={20} />
        </Flex>
      ) : (
        <Flex gap={10} wrap={"wrap"}>
          {guardians.data?.map((v) => {
            return (
              <Badge
                key={v}
                tt={"none"}
                size="lg"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan", deg: 90 }}
              >
                {v}
              </Badge>
            );
          })}
        </Flex>
      )}
    </>
  );
}
