"use client";

import {
  StarknetConfig,
  publicProvider,
  argent,
  braavos,
} from "@starknet-react/core";
import { sepolia } from "@starknet-react/chains";
import React from "react";

export const StarknetProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={publicProvider()}
      connectors={[argent(), braavos()]}
      autoConnect
    >
      {children}
    </StarknetConfig>
  );
};
