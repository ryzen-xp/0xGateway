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
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address};

    #[storage]
    struct Storage {
        usernames: Map<felt252, UserInfo>,
        user_wallets: Map<felt252, Wallet>,
        address_usernames: Map<ContractAddress, ByteArray>,
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
            let caller = get_caller_address();
            assert(self.get_username(caller).len() != 0, Errors::CALLER_ALREADY_HAVE_USERNAME);
            assert(!self.check_username_exist(username.clone()), Errors::USERNAME_TAKEN);

            let username_hash = hash_username(username.clone());

            let new_user = UserInfo {
                username: username.clone(), user_address: get_caller_address(), active: false,
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

        /// Add Diffrent wallet address

        fn add_wallets(
            ref self: ContractState, chain_id: felt252, wallet_address: felt252, memo: u128,
        ) {}

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

        // get username
        fn get_username(self: @ContractState, address: ContractAddress) -> ByteArray {
            assert(address.is_non_zero(), Errors::INVALID_ADDRESS);

            self.address_usernames.read(address)
        }
    }
}
