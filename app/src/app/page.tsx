"use client";

import {
  isSignedInAtom,
  walletSelectorAtom,
  walletSelectorModalAtom,
} from "@/jotai/wallet.jotai";
import {
  ActionIcon,
  Button,
  Divider,
  Flex,
  Input,
  Menu,
  Text,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useAtom } from "jotai";

import Link from "next/link";
import { nearNetworkAtom } from "@/jotai/near.jotai";
import { ENearNetwork } from "@/constant/queryKeys";
import Guardians from "@/components/Guardians";

import Projects from "@/components/Projects";
import Proposals from "@/components/Proposals";
import { IconMoon, IconSun, IconWifi } from "@tabler/icons-react";
import Contracts from "@/components/Contracts";
import { useState } from "react";
import { whitelistQueries } from "@/hooks/whitelistQueries";
import { notifications } from "@mantine/notifications";
import classes from './page.module.css';

export default function Home() {
  const { toggleColorScheme } = useMantineColorScheme({
    keepTransitions: true,
  });

  const computedColorScheme = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });

  const [walletSelector] = useAtom(walletSelectorAtom);
  const [isSignedIn, setIsSignedIn] = useAtom(isSignedInAtom);
  const [walletSelectorModal] = useAtom(walletSelectorModalAtom);
  const [network, setNetwork] = useAtom(nearNetworkAtom);

  const [contractId, setContractId] = useState("");

  const isContractWhitelisted = whitelistQueries.useIsContractWhitelisted({
    contract_id: contractId,
    enabled: false,
  });

  return (
    <>
      <Title mt="sm">NEAR Smart Contract Whitelist </Title>
      <Flex direction={"column"} align={"flex-end"}>
        <Flex gap="sm" align={"center"} mt="sm">
          <ActionIcon size="lg" onClick={toggleColorScheme}>
            <IconSun className={classes.light} />
            <IconMoon className={classes.dark} />
          </ActionIcon>
          <Menu shadow="md">
            <Menu.Target>
              <ActionIcon size="lg">
                <IconWifi />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                onClick={() => {
                  setNetwork(ENearNetwork.mainnet);
                }}
              >
                Mainnet
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  setNetwork(ENearNetwork.testnet);
                }}
              >
                Testnet
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <Button
            onClick={async () => {
              if (!isSignedIn) {
                walletSelectorModal?.show();
              } else {
                if (walletSelector) {
                  try {
                    const wallet = await walletSelector.wallet();

                    await wallet.signOut();
                    setIsSignedIn(walletSelector.isSignedIn);
                  } catch (err) {
                    console.warn("Fail to sign out", err);
                  }
                }
              }
            }}
          >
            {isSignedIn ? "Logout" : "Login"}
          </Button>
        </Flex>

        <Text c="dimmed" size="sm">
          Signed In wallet:{" "}
          {isSignedIn
            ? walletSelector?.store.getState().accounts[0].accountId
            : "-"}
        </Text>
        <Text c="dimmed" size="sm">
          Selected network: {network}
        </Text>
      </Flex>

      {isSignedIn && (
        <Flex justify={"flex-end"} my="sm">
          <Link href="/proposal">
            <Button>Add project</Button>
          </Link>
        </Flex>
      )}

      <Guardians />
      <Divider mt="sm" />

      <Projects />
      <Divider mt="sm" />

      <Proposals />
      <Divider mt="sm" />

      <Contracts />
      <Divider mt="sm" />

      <Text mt={"sm"}>Whitelist Checker</Text>
      <Flex gap="sm" align={"flex-end"}>
        <Input.Wrapper label="Telegram Username">
          <Input
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
          />
        </Input.Wrapper>
        <Button
          loading={isContractWhitelisted.isFetching}
          onClick={async () => {
            const payload = await isContractWhitelisted.refetch();
            notifications.show({
              message: payload.data
                ? `${contractId} is whitelisted`
                : `${contractId} is not whitelisted`,
              color: payload.data ? "green" : "red",
            });
          }}
        >
          Check
        </Button>
      </Flex>
    </>
  );
}
