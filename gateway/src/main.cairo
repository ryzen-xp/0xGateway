#[starknet::contract]
mod Gateway {
    use core::num::traits::Zero; 
    use gateway::errors::Errors;
    use gateway::events::{
        AccountDeactivated, AccountReactivated, UserAddressChanged, UsernameRegistered, WalletAdded,
        WalletRemoved,
    };
    use gateway::interface::IGateway;
    use gateway::types::{UserInfo, Wallet};
    use gateway::utils::hash_username;
    use starknet::storage::{
        Map, MutableVecTrait, StorageMapReadAccess, StorageMapWriteAccess, StoragePathEntry,
        StoragePointerReadAccess, StoragePointerWriteAccess, Vec, VecTrait,
    };
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address};

    #[storage]
    struct Storage {
        usernames: Map<felt252, UserInfo>,
        address_usernames: Map<ContractAddress, ByteArray>,
        user_chain_ids: Map<felt252, Vec<felt252>>,
        // Map from (username_hash, chain_id) to Wallet
        user_wallets: Map<(felt252, felt252), Wallet>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        UsernameRegistered: UsernameRegistered,
        WalletAdded: WalletAdded,
        WalletRemoved: WalletRemoved,
        UserAddressChanged: UserAddressChanged,
        AccountDeactivated: AccountDeactivated,
        AccountReactivated: AccountReactivated,
    }

    #[abi(embed_v0)]
    impl GatewayImpl of IGateway<ContractState> {
        /// Change user address - transfers username to a new address
        fn change_user_address(ref self: ContractState, new_address: ContractAddress) {
            assert(new_address.is_non_zero(), Errors::INVALID_ADDRESS);

            let caller = get_caller_address();
            let username = self.address_usernames.read(caller);

            assert(username.len() != 0, Errors::USER_NOT_REGISTERED);

            assert(self.is_account_active(username.clone()), Errors::ACCOUNT_INACTIVE);

            assert(
                self.address_usernames.read(new_address).len() == 0,
                Errors::ADDRESS_ALREADY_HAS_USERNAME,
            );

            let username_hash = hash_username(username.clone());

            let mut user_info = self.usernames.read(username_hash);
            user_info.user_address = new_address;
            self.usernames.write(username_hash, user_info);

            self.address_usernames.write(caller, "");

            self.address_usernames.write(new_address, username.clone());

            self
                .emit(
                    Event::UserAddressChanged(
                        UserAddressChanged {
                            username,
                            old_address: caller,
                            new_address,
                            timestamp: get_block_timestamp(),
                        },
                    ),
                );
        }

        /// Deactivate user account
        fn deactivate_account(ref self: ContractState) {
            let caller = get_caller_address();
            let username = self.address_usernames.read(caller);

            assert(username.len() != 0, Errors::USER_NOT_REGISTERED);

            let username_hash = hash_username(username.clone());
            let mut user_info = self.usernames.read(username_hash);

            assert(user_info.active, Errors::ACCOUNT_ALREADY_INACTIVE);

            user_info.active = false;
            self.usernames.write(username_hash, user_info);

            self
                .emit(
                    Event::AccountDeactivated(
                        AccountDeactivated {
                            username, user_address: caller, timestamp: get_block_timestamp(),
                        },
                    ),
                );
        }

        /// Reactivate user account
        fn reactivate_account(ref self: ContractState) {
            let caller = get_caller_address();
            let username = self.address_usernames.read(caller);

            assert(username.len() != 0, Errors::USER_NOT_REGISTERED);

            let username_hash = hash_username(username.clone());
            let mut user_info = self.usernames.read(username_hash);

            assert(!user_info.active, Errors::ACCOUNT_ALREADY_ACTIVE);

            user_info.active = true;
            self.usernames.write(username_hash, user_info);

            self
                .emit(
                    Event::AccountReactivated(
                        AccountReactivated {
                            username, user_address: caller, timestamp: get_block_timestamp(),
                        },
                    ),
                );
        }

        /// Check if user account is active
        fn is_account_active(self: @ContractState, username: ByteArray) -> bool {
            assert(username.len() != 0, Errors::INVALID_USERNAME);

            let username_hash = hash_username(username);
            let user_info = self.usernames.read(username_hash);
            user_info.active
        }

        /// Register a new username (unique)
        fn register_username(ref self: ContractState, username: ByteArray) {
            assert(username.len() != 0, Errors::INVALID_USERNAME);

            let caller = get_caller_address();
            assert(self.get_username(caller).len() == 0, Errors::CALLER_ALREADY_HAVE_USERNAME);
            assert(!self.check_username_exist(username.clone()), Errors::USERNAME_TAKEN);

            let username_hash = hash_username(username.clone());

            let new_user = UserInfo {
                username: username.clone(), user_address: caller, active: true,
            };

            self.usernames.write(username_hash, new_user);
            self.address_usernames.write(caller, username.clone());

            self
                .emit(
                    Event::UsernameRegistered(
                        UsernameRegistered {
                            username, user_address: caller, timestamp: get_block_timestamp(),
                        },
                    ),
                );
        }

        /// Add Different wallet address for different chains
        fn add_wallets(
            ref self: ContractState,
            chain_id: felt252,
            wallet_address: felt252,
            memo: Option<u128>,
            tag: Option<u128>,
            metadata: Option<ByteArray>,
        ) {
            assert(chain_id.is_non_zero(), Errors::INVALID_CHAIN_ID);
            assert(wallet_address.is_non_zero(), Errors::INVALID_WALLET_ADDRESS);

            let caller = get_caller_address();
            let username = self.get_username(caller);

            assert(username.len() != 0, Errors::USER_NOT_REGISTERED);

            assert(self.is_account_active(username.clone()), Errors::ACCOUNT_INACTIVE);

            let username_hash = hash_username(username);

            // Check if this chain_id already exists for this user
            let chain_exists = self._check_chain_exists(username_hash, chain_id);

            // If chain doesn't exist, add it to the Vec
            if !chain_exists {
                let mut chain_ids = self.user_chain_ids.entry(username_hash);
                chain_ids.append().write(chain_id);
            }

            let new_wallet = Wallet {
                chain_id,
                address: wallet_address,
                memo,
                tag,
                metadata,
                updated_at: get_block_timestamp(),
            };

            self.user_wallets.write((username_hash, chain_id), new_wallet);

            self
                .emit(
                    Event::WalletAdded(
                        WalletAdded {
                            user_address: caller,
                            chain_id,
                            wallet_address,
                            timestamp: get_block_timestamp(),
                        },
                    ),
                );
        }

        ///  Remove Wallet from wallet list
        fn remove_wallet(ref self: ContractState, chain_id: felt252) {
            assert(chain_id.is_non_zero(), Errors::INVALID_CHAIN_ID);

            let caller = get_caller_address();
            let username = self.get_username(caller);

            assert(username.len() != 0, Errors::INVALID_USERNAME);
            assert(self.check_username_exist(username.clone()), Errors::USER_NOT_REGISTERED);

            assert(self.is_account_active(username.clone()), Errors::ACCOUNT_INACTIVE);

            let username_hash = hash_username(username.clone());

            // Verify the wallet exists for this chain
            let wallet = self.user_wallets.read((username_hash, chain_id));
            assert(wallet.address.is_non_zero(), Errors::WALLET_NOT_FOUND);

            let empty_wallet = Wallet {
                chain_id: 0,
                address: 0,
                memo: Option::None,
                tag: Option::None,
                metadata: Option::None,
                updated_at: 0,
            };
            self.user_wallets.write((username_hash, chain_id), empty_wallet);

            // Remove chain_id from the Vec
            let mut chain_ids_vec = self.user_chain_ids.entry(username_hash);
            let len = chain_ids_vec.len();

            let mut idx: u64 = 0;
            let mut found = false;
            while idx != len {
                if chain_ids_vec.at(idx).read() == chain_id {
                    found = true;
                    break;
                }
                idx += 1;
            };

            assert(found, Errors::CHAIN_ID_NOT_FOUND);

            if idx != len - 1 {
                let last_chain = chain_ids_vec.at(len - 1).read();
                chain_ids_vec.at(idx).write(last_chain);
            }

            chain_ids_vec.pop().unwrap();

            self
                .emit(
                    Event::WalletRemoved(
                        WalletRemoved {
                            user_address: caller,
                            username,
                            chain_id,
                            timestamp: get_block_timestamp(),
                        },
                    ),
                );
        }

        /// Get wallet for a specific chain
        fn get_wallet(self: @ContractState, username: ByteArray, chain_id: felt252) -> Wallet {
            assert(username.len() != 0, Errors::INVALID_USERNAME);
            assert(chain_id.is_non_zero(), Errors::INVALID_CHAIN_ID);

            assert(self.is_account_active(username.clone()), Errors::ACCOUNT_INACTIVE);

            let username_hash = hash_username(username);
            self.user_wallets.read((username_hash, chain_id))
        }

        /// Get all chain IDs for a user
        fn get_user_chain_ids(self: @ContractState, username: ByteArray) -> Array<felt252> {
            assert(username.len() != 0, Errors::INVALID_USERNAME);

            assert(self.is_account_active(username.clone()), Errors::ACCOUNT_INACTIVE);

            let username_hash = hash_username(username);
            let chain_ids_vec = self.user_chain_ids.entry(username_hash);

            let mut chain_ids_array = ArrayTrait::new();
            let len = chain_ids_vec.len();

            let mut i: u64 = 0;
            while i != len {
                chain_ids_array.append(chain_ids_vec.at(i).read());
                i += 1;
            };

            chain_ids_array
        }

        /// Get all wallets for a user
        fn get_all_user_wallets(self: @ContractState, username: ByteArray) -> Array<Wallet> {
            assert(username.len() != 0, Errors::INVALID_USERNAME);

            assert(self.is_account_active(username.clone()), Errors::ACCOUNT_INACTIVE);

            let username_hash = hash_username(username);
            let chain_ids_vec = self.user_chain_ids.entry(username_hash);

            let mut wallets = ArrayTrait::new();
            let len = chain_ids_vec.len();

            let mut i: u64 = 0;
            while i != len {
                let chain_id = chain_ids_vec.at(i).read();
                let wallet = self.user_wallets.read((username_hash, chain_id));
                wallets.append(wallet);
                i += 1;
            };

            wallets
        }

        // Check if the username exists on-chain
        fn check_username_exist(self: @ContractState, username: ByteArray) -> bool {
            let hash = hash_username(username);
            let user = self.usernames.read(hash);
            user.user_address.is_non_zero()
        }

        // Get User Info
        fn get_user_info(self: @ContractState, username: ByteArray) -> UserInfo {
            assert(username.len() != 0, Errors::INVALID_USERNAME);
            let hash = hash_username(username);
            let user: UserInfo = self.usernames.read(hash);
            user
        }

        // Get username
        fn get_username(self: @ContractState, address: ContractAddress) -> ByteArray {
            assert(address.is_non_zero(), Errors::INVALID_ADDRESS);
            self.address_usernames.read(address)
        }
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        fn _check_chain_exists(
            self: @ContractState, username_hash: felt252, chain_id: felt252,
        ) -> bool {
            let chain_ids = self.user_chain_ids.entry(username_hash);
            let len = chain_ids.len();

            let mut i: u64 = 0;
            loop {
                if i >= len {
                    break false;
                }
                if chain_ids.at(i).read() == chain_id {
                    break true;
                }
                i += 1;
            }
        }
    }
}
