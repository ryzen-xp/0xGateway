#[starknet::contract]
mod Gateway {
    use core::num::traits::Zero;
    use gateway::errors::Errors;
    use gateway::events::UsernameRegistered;
    use gateway::interface::IGateway;
    use gateway::types::{UserInfo, Wallet};
    use gateway::utils::hash_username;
    use starknet::storage::{
        Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerReadAccess,
        StoragePointerWriteAccess,
    };
    use starknet::{get_block_timestamp, get_caller_address};

    #[storage]
    struct Storage {
        usernames: Map<felt252, UserInfo>,
        user_wallets: Map<felt252, Wallet>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        UsernameRegistered: UsernameRegistered,
    }

    #[abi(embed_v0)]
    impl GatewayImpl of IGateway<ContractState> {
        /// Register a new username (unique)
        fn register_username(ref self: ContractState, username: ByteArray) {
            assert(username.len() != 0, Errors::INVALID_USERNAME);
            assert(!self.check_username_exist(username.clone()), Errors::USERNAME_TAKEN);

            let username_hash = hash_username(username.clone());

            let new_user = UserInfo {
                username: username.clone(),
                user_address: get_caller_address(),
                active: true // Set to true when registering
            };

            self.usernames.write(username_hash, new_user);

            self
                .emit(
                    Event::UsernameRegistered(
                        UsernameRegistered {
                            username,
                            user_address: get_caller_address(),
                            timestamp: get_block_timestamp(),
                        },
                    ),
                );
        }

        // Check if the username exists on-chain
        fn check_username_exist(self: @ContractState, username: ByteArray) -> bool {
            let hash = hash_username(username);
            let user = self.usernames.read(hash);

            // Username exists if the user_address is non-zero
            user.user_address.is_non_zero()
        }
    }
}
