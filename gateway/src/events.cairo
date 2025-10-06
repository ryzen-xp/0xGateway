use starknet::ContractAddress;

#[derive(Drop, Serde, starknet::Event)]
pub struct UsernameRegistered {
    pub username: ByteArray,
    pub user_address: ContractAddress,
    pub timestamp: u64,
}
