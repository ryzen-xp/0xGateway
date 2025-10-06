use gateway::interface::{IGatewayDispatcher, IGatewayDispatcherTrait};
use snforge_std_deprecated::{
    ContractClassTrait, DeclareResultTrait, EventSpyTrait, declare, spy_events,
};
use starknet::{ContractAddress, get_block_timestamp, get_caller_address};


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
#[should_panic(expected: ('Invalid username',))]
fn test_reg_username_failed() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "";

    dispatcher.register_username(username);
}

#[test]
#[should_panic(expected: ('Username already exists',))]
fn test_reg_same_username() {
    let contract_address = deploy_contract();
    let dispatcher = IGatewayDispatcher { contract_address };

    let username: ByteArray = "ryzen_xp";

    dispatcher.register_username(username.clone());

    dispatcher.register_username(username);
}
