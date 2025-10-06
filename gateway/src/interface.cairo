use gateway::types::{UserInfo, Wallet};
use starknet::ContractAddress;

#[starknet::interface]
pub trait IGateway<TContractState> {
    fn register_username(ref self: TContractState, username: ByteArray);
    fn check_username_exist(self: @TContractState, username: ByteArray) -> bool;
    fn add_wallets(
        ref self: TContractState,
        chain_id: felt252,
        wallet_address: felt252,
        memo: Option<u128>,
        tag: Option<u128>,
        metadata: Option<ByteArray>,
    );
    fn get_user_info(self: @TContractState, username: ByteArray) -> UserInfo;
    fn get_username(self: @TContractState, address: ContractAddress) -> ByteArray;
    fn get_wallet(self: @TContractState, username: ByteArray, chain_id: felt252) -> Wallet;
    fn get_user_chain_ids(self: @TContractState, username: ByteArray) -> Array<felt252>;
    fn get_all_user_wallets(self: @TContractState, username: ByteArray) -> Array<Wallet>;
}
