use gateway::interface::{IGatewayDispatcher, IGatewayDispatcherTrait};
use snforge_std_deprecated::{
    ContractClassTrait, DeclareResultTrait, EventSpyTrait, declare, spy_events,
    start_cheat_caller_address, stop_cheat_caller_address,
};
use starknet::{ContractAddress, contract_address_const, get_block_timestamp, get_caller_address};

pub fn BOB() -> ContractAddress {
    contract_address_const::<'BOB'>()
}


fn deploy_contract() -> ContractAddress {
    let contract = declare("Gateway").unwrap().contract_class();
    let (contract_address, _) = contract.deploy(@ArrayTrait::new()).unwrap();
    contract_address
}


#[test]
fn test_reg_username_pass() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";

    let mut spy = spy_events();

    dispatcher.register_username(username.clone());

    let events = spy.get_events();
    assert(events.events.len() == 1, 'Should emit 1 event');
}

#[test]
#[should_panic(expected: ('INVALID_USERNAME',))]
fn test_reg_username_failed() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "";

    dispatcher.register_username(username);
}
#[test]
#[should_panic(expected: ('USERNAME_TAKEN',))]
fn test_reg_same_username_bob() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";

    dispatcher.register_username(username.clone());

    start_cheat_caller_address(contract_address, BOB());
    dispatcher.register_username(username);
    stop_cheat_caller_address(contract_address);
}


#[test]
#[should_panic(expected: ('CALLER_ALREADY_HAVE_USERNAME',))]
fn test_reg_same_username() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";

    dispatcher.register_username(username.clone());
    dispatcher.register_username(username);
}

// ==================== ADD WALLET TESTS ====================

#[test]
fn test_add_wallet_pass() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username.clone());

    let chain_id: felt252 = 1;
    let wallet_address: felt252 = 0x123456;

    let mut spy = spy_events();

    dispatcher.add_wallets(chain_id, wallet_address, Option::None, Option::None, Option::None);

    let events = spy.get_events();
    assert(events.events.len() == 1, 'Should emit 1 event');
}

#[test]
#[should_panic(expected: ('USER_NOT_REGISTERED',))]
fn test_add_wallet_without_registration() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let chain_id: felt252 = 1;
    let wallet_address: felt252 = 0x123456;

    dispatcher.add_wallets(chain_id, wallet_address, Option::None, Option::None, Option::None);
}

#[test]
#[should_panic(expected: ('INVALID_CHAIN_ID',))]
fn test_add_wallet_invalid_chain_id() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username);

    let chain_id: felt252 = 0;
    let wallet_address: felt252 = 0x123456;

    dispatcher.add_wallets(chain_id, wallet_address, Option::None, Option::None, Option::None);
}

#[test]
#[should_panic(expected: ('INVALID_WALLET_ADDRESS',))]
fn test_add_wallet_invalid_address() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username);

    let chain_id: felt252 = 1;
    let wallet_address: felt252 = 0;

    dispatcher.add_wallets(chain_id, wallet_address, Option::None, Option::None, Option::None);
}

#[test]
fn test_add_multiple_wallets() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username.clone());

    dispatcher.add_wallets(1, 0x111, Option::None, Option::None, Option::None);
    dispatcher.add_wallets(2, 0x222, Option::None, Option::None, Option::None);
    dispatcher.add_wallets(3, 0x333, Option::None, Option::None, Option::None);

    let chain_ids = dispatcher.get_user_chain_ids(username);
    assert(chain_ids.len() == 3, 'Should have 3 chain IDs');
}

// ==================== REMOVE WALLET TESTS ====================

#[test]
fn test_remove_wallet_pass() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username.clone());

    let chain_id: felt252 = 1;
    let wallet_address: felt252 = 0x123456;

    dispatcher.add_wallets(chain_id, wallet_address, Option::None, Option::None, Option::None);

    let mut spy = spy_events();

    dispatcher.remove_wallet(chain_id);

    let events = spy.get_events();
    assert(events.events.len() == 1, 'Should emit 1 event');

    let chain_ids = dispatcher.get_user_chain_ids(username);
    assert(chain_ids.len() == 0, 'Should have 0 chain IDs');
}

#[test]
#[should_panic(expected: ('INVALID_USERNAME',))]
fn test_remove_wallet_not_registered() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let chain_id: felt252 = 1;
    dispatcher.remove_wallet(chain_id);
}

#[test]
#[should_panic(expected: ('WALLET_NOT_FOUND',))]
fn test_remove_wallet_not_exist() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username);

    let chain_id: felt252 = 1;
    dispatcher.remove_wallet(chain_id);
}

#[test]
#[should_panic(expected: ('INVALID_CHAIN_ID',))]
fn test_remove_wallet_invalid_chain() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username);

    dispatcher.remove_wallet(0);
}

#[test]
fn test_remove_wallet_from_multiple() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username.clone());

    dispatcher.add_wallets(1, 0x111, Option::None, Option::None, Option::None);
    dispatcher.add_wallets(2, 0x222, Option::None, Option::None, Option::None);
    dispatcher.add_wallets(3, 0x333, Option::None, Option::None, Option::None);

    dispatcher.remove_wallet(2);

    let chain_ids = dispatcher.get_user_chain_ids(username);
    assert(chain_ids.len() == 2, 'Should have 2 chain IDs');
}

// ==================== GET WALLET TESTS ====================

#[test]
fn test_get_wallet_pass() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username.clone());

    let chain_id: felt252 = 1;
    let wallet_address: felt252 = 0x123456;

    dispatcher.add_wallets(chain_id, wallet_address, Option::None, Option::None, Option::None);

    let wallet = dispatcher.get_wallet(username, chain_id);
    assert(wallet.address == wallet_address, 'Wallet address mismatch');
    assert(wallet.chain_id == chain_id, 'Chain ID mismatch');
}

#[test]
#[should_panic(expected: ('INVALID_USERNAME',))]
fn test_get_wallet_invalid_username() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "";
    dispatcher.get_wallet(username, 1);
}

#[test]
#[should_panic(expected: ('INVALID_CHAIN_ID',))]
fn test_get_wallet_invalid_chain() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username.clone());

    dispatcher.get_wallet(username, 0);
}

// ==================== USER MANAGEMENT TESTS ====================

#[test]
fn test_change_address_pass() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username.clone());

    let mut spy = spy_events();

    dispatcher.change_user_address(BOB());

    let events = spy.get_events();
    assert(events.events.len() == 1, 'Should emit 1 event');

    start_cheat_caller_address(contract_address, BOB());
    let new_username = dispatcher.get_username(BOB());
    assert(new_username == username, 'Username not transferred');
    stop_cheat_caller_address(contract_address);
}

#[test]
#[should_panic(expected: ('USER_NOT_REGISTERED',))]
fn test_change_address_not_registered() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    dispatcher.change_user_address(BOB());
}

#[test]
#[should_panic(expected: ('ADDRESS_ALREADY_HAS_USERNAME',))]
fn test_change_address_already_has_username() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username1: ByteArray = "ryzen_xp";
    dispatcher.register_username(username1);

    start_cheat_caller_address(contract_address, BOB());
    let username2: ByteArray = "bob_user";
    dispatcher.register_username(username2);
    stop_cheat_caller_address(contract_address);

    dispatcher.change_user_address(BOB());
}

#[test]
#[should_panic(expected: ('INVALID_ADDRESS',))]
fn test_change_address_zero_address() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username);

    dispatcher.change_user_address(contract_address_const::<0>());
}

// ==================== ACCOUNT ACTIVATION TESTS ====================

#[test]
fn test_deactivate_account_pass() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username.clone());

    let mut spy = spy_events();

    dispatcher.deactivate_account();

    let events = spy.get_events();
    assert(events.events.len() == 1, 'Should emit 1 event');

    assert(!dispatcher.is_account_active(username), 'Account should be inactive');
}

#[test]
#[should_panic(expected: ('USER_NOT_REGISTERED',))]
fn test_deactivate_account_not_registered() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    dispatcher.deactivate_account();
}

#[test]
#[should_panic(expected: ('ACCOUNT_ALREADY_INACTIVE',))]
fn test_deactivate_account_already_inactive() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username);

    dispatcher.deactivate_account();
    dispatcher.deactivate_account();
}

#[test]
fn test_reactivate_account_pass() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username.clone());

    dispatcher.deactivate_account();

    let mut spy = spy_events();

    dispatcher.reactivate_account();

    let events = spy.get_events();
    assert(events.events.len() == 1, 'Should emit 1 event');

    assert(dispatcher.is_account_active(username), 'Account should be active');
}

#[test]
#[should_panic(expected: ('ACCOUNT_ALREADY_ACTIVE',))]
fn test_reactivate_account_already_active() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username);

    dispatcher.reactivate_account();
}

#[test]
#[should_panic(expected: ('ACCOUNT_INACTIVE',))]
fn test_add_wallet_inactive_account() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username);

    dispatcher.deactivate_account();

    dispatcher.add_wallets(1, 0x123456, Option::None, Option::None, Option::None);
}

#[test]
#[should_panic(expected: ('ACCOUNT_INACTIVE',))]
fn test_remove_wallet_inactive_account() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username);

    dispatcher.add_wallets(1, 0x123456, Option::None, Option::None, Option::None);

    dispatcher.deactivate_account();

    dispatcher.remove_wallet(1);
}

#[test]
#[should_panic(expected: ('ACCOUNT_INACTIVE',))]
fn test_get_wallet_inactive_account() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username.clone());

    dispatcher.add_wallets(1, 0x123456, Option::None, Option::None, Option::None);

    dispatcher.deactivate_account();

    dispatcher.get_wallet(username, 1);
}

#[test]
#[should_panic(expected: ('ACCOUNT_INACTIVE',))]
fn test_change_address_inactive_account() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username);

    dispatcher.deactivate_account();

    dispatcher.change_user_address(BOB());
}

// ==================== GETTER TESTS ====================

#[test]
fn test_get_user_info_pass() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username.clone());

    let user_info = dispatcher.get_user_info(username);
    assert(user_info.active, 'User should be active');
}

#[test]
fn test_check_username_exist_pass() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username.clone());

    assert(dispatcher.check_username_exist(username), 'Username should exist');
}

#[test]
fn test_check_username_not_exist() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";

    assert(!dispatcher.check_username_exist(username), 'Username should not exist');
}

#[test]
fn test_get_username_pass() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";

    println!("Caller address: {:?}", BOB());

    start_cheat_caller_address(contract_address, BOB());
    dispatcher.register_username(username.clone());

    let fetched_username = dispatcher.get_username(BOB());

    println!("Original username: {}", username);
    println!("Fetched username: {}", fetched_username);
    println!("Username length - Original: {}, Fetched: {}", username.len(), fetched_username.len());

    assert(fetched_username == username, 'Username mismatch');
    stop_cheat_caller_address(contract_address);
}

#[test]
fn test_get_all_user_wallets_pass() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username.clone());

    dispatcher.add_wallets(1, 0x111, Option::None, Option::None, Option::None);
    dispatcher.add_wallets(2, 0x222, Option::None, Option::None, Option::None);

    let wallets = dispatcher.get_all_user_wallets(username);
    assert(wallets.len() == 2, 'Should have 2 wallets');
}

#[test]
fn test_is_account_active_pass() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";
    dispatcher.register_username(username.clone());

    assert(dispatcher.is_account_active(username), 'Account should be active');
}

#[test]
#[should_panic(expected: ('INVALID_USERNAME',))]
fn test_is_account_active_invalid_username() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    dispatcher.is_account_active("");
}
