use starknet::ContractAddress;

// Metadata about the user
#[derive(Drop, Serde, starknet::Store, Debug)]
pub struct UserInfo {
    pub username: ByteArray,
    pub user_address: ContractAddress,
    pub active: bool,
}

// Store wallet info per chain
#[derive(Drop, Serde, starknet::Store, Debug)]
pub struct Wallet {
    pub chain_symbol: felt252,
    pub address: felt252,
    pub memo: Option<u128>,
    pub tag: Option<u128>,
    pub metadata: Option<ByteArray>,
    pub updated_at: u64,
}
