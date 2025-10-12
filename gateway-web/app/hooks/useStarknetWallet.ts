import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useCallback, useEffect, useState } from "react";
import { useStarknetContract } from "./useStarknetContract";

export const useStarknetWallet = () => {
  const { address, isConnected, account } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [username, setUsername] = useState<string>("");

  const { getUsername } = useStarknetContract();

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConnect = useCallback(() => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  }, [connectors, connect]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setUsername("");
  }, [disconnect]);

  useEffect(() => {
    const fetchUsername = async () => {
      if (isConnected && address && account) {
        try {
          const fetchedUsername = await getUsername(address);

          if (fetchedUsername && fetchedUsername.length > 0) {
            setUsername(fetchedUsername.toString());
          }
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      }
    };

    fetchUsername();
  }, [isConnected, address, account]);

  return {
    isConnected,
    address,
    account,
    username,
    formattedAddress: formatAddress(address || ""),
    handleConnect,
    handleDisconnect,
    connectors,
  };
};
