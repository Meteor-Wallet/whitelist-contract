"use client";

import { CONTRACT_ID_BY_NETWORK } from "@/constant/nearConstant";
import { CURRENT_NEAR_NETWORK } from "@/constant/nearConstant";
import {
  isSignedInAtom,
  walletSelectorAtom,
  walletSelectorModalAtom,
} from "../jotai/wallet.jotai";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect } from "react";

export default function WalletSelectorInitializer() {
  const [walletSelectorModal, setWalletSelectorModal] = useAtom(
    walletSelectorModalAtom
  );
  const [walletSelector, setWalletSelector] = useAtom(walletSelectorAtom);
  const [isSignedIn, setIsSignedIn] = useAtom(isSignedInAtom);

  const init = useCallback(async () => {
    const selector = await setupWalletSelector({
      network: CURRENT_NEAR_NETWORK,
      modules: [setupMeteorWallet()],
    });
    setWalletSelector(selector);
    setIsSignedIn(selector.isSignedIn);

    const modal = setupModal(selector, {
      contractId: CONTRACT_ID_BY_NETWORK[CURRENT_NEAR_NETWORK],
    });
    setWalletSelectorModal(modal);

    return {
      modal,
      selector,
    };
  }, []);

  useEffect(() => {
    if (walletSelectorModal && walletSelector) {
      const onHide = () => {
        setIsSignedIn(walletSelector.isSignedIn);
      };

      walletSelectorModal.on("onHide", onHide);

      return () => {
        walletSelectorModal.off("onHide", onHide);
      };
    }
  }, [walletSelectorModal, walletSelector]);

  useEffect(() => {
    init();
  }, []);

  return <></>;
}
