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
import { CURRENT_NEAR_NETWORK } from "@/constant/nearConstant";
import { ENearNetwork } from "@/constant/nearConstant";
import Guardians from "@/components/Guardians";

import Projects from "@/components/Projects";
import Proposals from "@/components/proposal/Proposals";
import { IconMoon, IconSun, IconWifi } from "@tabler/icons-react";
import Contracts from "@/components/Contracts";
import { useState } from "react";
import { whitelistQueries } from "@/hooks/whitelistQueries";
import { notifications } from "@mantine/notifications";
import classes from "./page.module.css";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()
  const { toggleColorScheme } = useMantineColorScheme({
    keepTransitions: true,
  });

  const computedColorScheme = useComputedColorScheme("dark", {
    getInitialValueInEffect: true,
  });

  const [walletSelector] = useAtom(walletSelectorAtom);
  const [isSignedIn, setIsSignedIn] = useAtom(isSignedInAtom);
  const [walletSelectorModal] = useAtom(walletSelectorModalAtom);

  const [contractId, setContractId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [associatedProjectId, setAssociatedProjectId] = useState("");

  const isContractWhitelisted = whitelistQueries.useIsContractWhitelisted({
    contract_id: contractId,
    enabled: false,
  });

  const projectIdByContractId = whitelistQueries.useProjectIdByContractId({
    enabled: false,
    contract_id: contractId,
  });

  const checkContractId = async () => {
    const payload = await isContractWhitelisted.refetch();
    notifications.show({
      message: payload.data
        ? `${contractId} is whitelisted`
        : `${contractId} is not whitelisted`,
      color: payload.data ? "green" : "red",
    });

    const projectIdPayload = await projectIdByContractId.refetch();
    if (projectIdPayload.data) {
      setAssociatedProjectId(projectIdPayload.data);
    }
  };

  const goToProject = async () => {
    router.push(`/project?project_id=${projectId}`)
  }

  return (
    <>
      <Title mt="sm">NEAR Smart Contract Whitelist </Title>
      <Flex direction={"column"} align={"flex-end"}>
        <Flex gap="sm" align={"center"} mt="sm">
          <ActionIcon size="lg" onClick={toggleColorScheme}>
            <IconSun className={classes.light} />
            <IconMoon className={classes.dark} />
          </ActionIcon>
          {/* <Menu shadow="md">
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
          </Menu> */}

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
          Selected network: {CURRENT_NEAR_NETWORK}
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
        <Input.Wrapper label="Contract ID">
          <Input
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            onKeyDown={(e) => {
              setAssociatedProjectId("");
              if (e.key === "Enter") {
                checkContractId();
              }
            }}
          />
        </Input.Wrapper>
        <Button
          loading={isContractWhitelisted.isFetching}
          onClick={checkContractId}
        >
          Check
        </Button>
      </Flex>
      <Flex align={"center"}>
        <Text>Associated Project ID:</Text>
        {associatedProjectId && (
          <Link href={`/project?project_id=${associatedProjectId}`}>
            <Button variant="transparent">{associatedProjectId}</Button>
          </Link>
        )}
      </Flex>
      <Divider />

      <Text mt="sm">Go to project page by project ID</Text>
      <Flex gap="sm" align={"flex-end"}>
        <Input.Wrapper label="Project ID">
          <Input
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                goToProject();
              }
            }}
          />
        </Input.Wrapper>
        <Button
          loading={isContractWhitelisted.isFetching}
          onClick={goToProject}
        >
          Go to Project
        </Button>
      </Flex>
    </>
  );
}
