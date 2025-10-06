use gateway::types::UserInfo;
use starknet::ContractAddress;

#[starknet::interface]
pub trait IGateway<TContractState> {
    fn register_username(ref self: TContractState, username: ByteArray);
    fn check_username_exist(self: @TContractState, username: ByteArray) -> bool;
    fn add_wallets(
        ref self: TContractState, chain_id: felt252, wallet_address: felt252, memo: u128,
    );
    fn get_user_info(self: @TContractState, username: ByteArray) -> UserInfo;
    fn get_username(self: @TContractState, address: ContractAddress) -> ByteArray;
}
