import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useCallback, useEffect, useState } from "react";
import { useStarknetContract } from "./useStarknetContract";
import { WallerAccountProviderUrl } from "./";
import toast from "react-hot-toast";

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

  const handleConnect = useCallback(async () => {
    const connector = connectors[0];

    try {
      await connect({ connector });
      // toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  }, [connectors, connect]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setUsername("");
    toast.success("Wallet disconnected");
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
          toast.error("Failed to fetch username");
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
