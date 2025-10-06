use starknet::ContractAddress;

#[derive(Drop, Serde, starknet::Event)]
pub struct UsernameRegistered {
    pub username: ByteArray,
    pub user_address: ContractAddress,
    pub timestamp: u64,
}

#[derive(Drop, Serde, starknet::Event)]
pub struct WalletAdded {
    pub user_address: ContractAddress,
    pub chain_id: felt252,
    pub wallet_address: felt252,
    pub timestamp: u64,
}
