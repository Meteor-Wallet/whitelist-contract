import { ActionIcon, Flex, Loader, Skeleton, Text } from "@mantine/core";
import { IconCaretLeft, IconCaretRight } from "@tabler/icons-react";
import { useState } from "react";

export default function TableLayout({
  title,
  onClickNext,
  onClickPrev,
  isLoading,
  children,
  page,
  isFetching,
}: React.PropsWithChildren<{
  title: string;
  onClickPrev: () => void;
  onClickNext: () => void;
  isLoading: boolean;
  page: number;
  isFetching: boolean;
}>) {
  return (
    <>
      <Flex align={"center"} my="sm" gap="sm">
        <Text>{title}</Text>
        <Flex gap={6} align={"center"} justify={"center"}>
          <ActionIcon
            disabled={isLoading}
            variant="filled"
            onClick={onClickPrev}
          >
            <IconCaretLeft
              style={{ width: "2rem", height: "2rem" }}
              stroke={1.5}
            />
          </ActionIcon>
          <Text>{page}</Text>
          <ActionIcon
            disabled={isLoading}
            variant="filled"
            onClick={onClickNext}
          >
            <IconCaretRight
              style={{ width: "2rem", height: "2rem" }}
              stroke={1.5}
            />
          </ActionIcon>
        </Flex>
        {isFetching && <Loader size="sm" />}
      </Flex>
      {children}
    </>
  );
}
