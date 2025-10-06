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
