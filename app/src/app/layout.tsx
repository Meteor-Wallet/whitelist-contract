import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@near-wallet-selector/modal-ui/styles.css";
import type { Metadata } from "next";

import { ColorSchemeScript, Container, MantineProvider } from "@mantine/core";
import { Provider as JotaiProvider } from "jotai";
import QueryProvider from "../providers/QueryProvider";
import WalletSelectorInitializer from "./WalletSelectorInitializer";
import { Notifications } from "@mantine/notifications";
export const metadata: Metadata = {
  title: "Near Whitelist",
  description: "Near Whitelist - maintained by Meteor.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <QueryProvider>
          <JotaiProvider>
            <MantineProvider defaultColorScheme="dark">
              <Notifications position="bottom-center" />
              <WalletSelectorInitializer />
              <Container>{children}</Container>
            </MantineProvider>
          </JotaiProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
