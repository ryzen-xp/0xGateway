"use client";

import { useState, useCallback } from "react";
import {
  Contract,
  RpcProvider,
  AccountInterface,
  ProviderInterface,
  CairoOption,
} from "starknet";
import { ABI } from "./abi";
import { isValidUsername, getUsernameError } from "../utils/validation";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

if (!CONTRACT_ADDRESS)
  throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS is not defined");
if (!RPC_URL) throw new Error("NEXT_PUBLIC_RPC_URL is not defined");

interface UserInfo {
  username: string;
  user_address: string;
  active: boolean;
}

interface Wallet {
  chain_symbol: string;
  address: string;
  memo?: number;
  tag?: number;
  metadata?: string;
  updated_at: number;
}

export const useStarknetContract = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContract = useCallback(() => {
    const provider = new RpcProvider({ nodeUrl: RPC_URL });
    return new Contract(ABI, CONTRACT_ADDRESS, provider);
  }, []);

  // Check if username exists
  const checkUsernameExists = useCallback(
    async (username: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const contract = getContract();
        const exists = await contract.check_username_exist(username);
        return exists as boolean;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to check username";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getContract]
  );

  const getUsername = useCallback(
    async (address: string): Promise<string> => {
      setLoading(true);
      setError(null);

      try {
        const contract = getContract();
        const result = await contract.get_username(address);

        const username =
          typeof result === "string"
            ? result
            : Array.isArray(result)
            ? result[0]?.toString?.() ?? ""
            : result?.username?.toString?.() ?? "";

        return username;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch username";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getContract]
  );

  // Get user info
  const getUserInfo = useCallback(
    async (username: string): Promise<UserInfo> => {
      setLoading(true);
      setError(null);

      try {
        const contract = getContract();
        const userInfo = await contract.get_user_info(username);

        return {
          username: userInfo.username,
          user_address: userInfo.user_address.toString(),
          active: userInfo.active,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get user info";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getContract]
  );

  // Check username availability (combines both checks)
  const checkUsernameAvailability = useCallback(
    async (username: string) => {
      setLoading(true);
      setError(null);

      try {
        const validationError = getUsernameError(username);
        if (validationError) {
          throw new Error(validationError);
        }
        const contract = getContract();
        const exists = await contract.check_username_exist(username);

        if (exists) {
          const userInfo = await contract.get_user_info(username);
          return {
            available: false,
            status: "taken" as const,
            userInfo: {
              username: userInfo.username,
              user_address: userInfo.user_address.toString(),
              active: userInfo.active,
            },
          };
        } else {
          return {
            available: true,
            status: "available" as const,
            userInfo: null,
          };
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to check availability";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getContract]
  );

  const getUserWallets = useCallback(
    async (username: string): Promise<Wallet[]> => {
      setLoading(true);
      setError(null);

      try {
        const contract = getContract();

        // Try to call the contract with different approaches
        let wallets;
        try {
          wallets = await contract.get_all_user_wallets(username);
        } catch (contractError) {
          console.error("Contract call error:", contractError);

          // Try calling without automatic parsing
          try {
            const provider = new RpcProvider({ nodeUrl: RPC_URL });
            const result = await provider.callContract({
              contractAddress: CONTRACT_ADDRESS,
              entrypoint: "get_all_user_wallets",
              calldata: [username],
            });

            console.log("Raw contract result:", result);
            // You'll need to manually parse this based on your contract's return format
            wallets = [];
          } catch (rawError) {
            console.error("Raw contract call error:", rawError);
            throw contractError; // Throw the original error
          }
        }

        console.log("Parsed wallets:", wallets);

        // Check if wallets is empty or invalid
        if (!wallets || !Array.isArray(wallets) || wallets.length === 0) {
          return [];
        }

        return wallets.map((wallet: any) => {
          console.log("Processing wallet:", wallet);

          // Handle address conversion safely
          let addressStr: string;

          if (typeof wallet.address === "bigint") {
            addressStr = "0x" + wallet.address.toString(16);
          } else if (typeof wallet.address === "string") {
            addressStr = wallet.address;
          } else if (wallet.address !== undefined && wallet.address !== null) {
            try {
              addressStr = "0x" + BigInt(wallet.address).toString(16);
            } catch {
              console.error("Failed to convert address:", wallet.address);
              addressStr = String(wallet.address);
            }
          } else {
            console.error("Invalid wallet address:", wallet);
            addressStr = "0x0";
          }

          return {
            chain_symbol: wallet.chain_symbol || "",
            address: addressStr,
            memo: wallet.memo?.Some ?? wallet.memo?.variant?.Some ?? undefined,
            tag: wallet.tag?.Some ?? wallet.tag?.variant?.Some ?? undefined,
            metadata:
              wallet.metadata?.Some ??
              wallet.metadata?.variant?.Some ??
              undefined,
            updated_at: wallet.updated_at || 0,
          };
        });
      } catch (err) {
        console.error("getUserWallets error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get wallets";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [getContract]
  );

  // Register username (requires wallet connection)
  const registerUsername = useCallback(
    async (username: string, account: AccountInterface) => {
      setLoading(true);
      setError(null);

      try {
        const validationError = getUsernameError(username);
        if (validationError) {
          throw new Error(validationError);
        }

        const contract = new Contract(ABI, CONTRACT_ADDRESS, account);
        const result = await contract.register_username(username);
        await account.waitForTransaction(result.transaction_hash);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to register username";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Add wallet
  const addWallet = useCallback(
    async (
      account: AccountInterface,
      chainSymbol: string,
      walletAddress: string,
      memo?: number,
      tag?: number,
      metadata?: string
    ) => {
      setLoading(true);
      setError(null);

      try {
        const contract = new Contract(ABI, CONTRACT_ADDRESS, account);
        const result = await contract.add_wallets(
          chainSymbol,
          walletAddress,
          new CairoOption(memo !== undefined ? 0 : 1, memo),
          new CairoOption(tag !== undefined ? 0 : 1, tag),
          new CairoOption(metadata !== undefined ? 0 : 1, metadata)
        );

        await account.waitForTransaction(result.transaction_hash);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add wallet";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeWallet = useCallback(
    async (account: AccountInterface, chainSymbol: string) => {
      setLoading(true);
      setError(null);

      try {
        const contract = new Contract(ABI, CONTRACT_ADDRESS, account);
        const result = await contract.remove_wallet(chainSymbol);

        await account.waitForTransaction(result.transaction_hash);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to remove wallet";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    checkUsernameExists,
    getUserInfo,
    checkUsernameAvailability,
    getUserWallets,
    registerUsername,
    addWallet,
    getUsername,
    removeWallet,
  };
};
