use starknet::ContractAddress;

#[starknet::interface]
pub trait IGateway<TContractState> {
    fn register_username(ref self: TContractState, username: ByteArray);
    fn check_username_exist(self: @TContractState, username: ByteArray) -> bool;
    // fn get_user(self: @TContractState, username_hash: felt252) -> ContractAddress;
}
