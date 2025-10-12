"use client";

import { useState, useCallback } from "react";
import {
  Contract,
  RpcProvider,
  AccountInterface,
  ProviderInterface,
} from "starknet";
import { ABI } from "./abi";

const CONTRACT_ADDRESS =
  "0x024f4b18be04f1be6a808baf4a472a7a2d4171d016c8349548e76fff2587f8cb";
const RPC_URL = "https://starknet-sepolia.public.blastapi.io/rpc/v0_7";

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

  // Get all user wallets
  const getUserWallets = useCallback(
    async (username: string): Promise<Wallet[]> => {
      setLoading(true);
      setError(null);

      try {
        const contract = getContract();
        const wallets = await contract.get_all_user_wallets(username);
        return wallets as Wallet[];
      } catch (err) {
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
      account: ProviderInterface | AccountInterface,
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
          memo ? { Some: memo } : { None: {} },
          tag ? { Some: tag } : { None: {} },
          metadata ? { Some: metadata } : { None: {} }
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
  };
};
