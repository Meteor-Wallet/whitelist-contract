import { whitelistQueries } from "@/hooks/whitelistQueries";
import TableLayout from "./TableLayout";
import { useState } from "react";
import { Badge, Flex, Skeleton } from "@mantine/core";

const limit = 30;

export default function Contracts() {
  const [page, setPage] = useState(0);
  const contracts = whitelistQueries.useApprovedContracts({
    fromIndex: limit * page,
    limit,
  });

  return (
    <TableLayout
      isFetching={contracts.isFetching}
      isLoading={contracts.status === "pending"}
      page={page + 1}
      title="Approved Contracts"
      onClickNext={() => {
        if (contracts.data?.length !== 0) {
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
      <Flex gap="md" wrap="wrap">
        {contracts.status === "pending" && (
          <>
            <Skeleton height={25} w={160} radius={20} />
            <Skeleton height={25} w={160} radius={20} />
            <Skeleton height={25} w={160} radius={20} />
          </>
        )}
        {contracts.data?.map(([contract_id]) => {
          return (
            <Badge
              tt={"none"}
              size="lg"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan", deg: 90 }}
            >
              {contract_id}
            </Badge>
          );
        })}
      </Flex>
    </TableLayout>
  );
}
