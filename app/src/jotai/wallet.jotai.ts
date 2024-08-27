import { WalletSelector } from "@near-wallet-selector/core";
import { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { atom } from "jotai";

export const walletSelectorAtom = atom<WalletSelector>()
export const isSignedInAtom = atom(false)
export const walletSelectorModalAtom = atom<WalletSelectorModal>()