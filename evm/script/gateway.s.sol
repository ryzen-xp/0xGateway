// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Gateway} from "../src/gateway.sol";

contract CounterScript is Script {
    Gateway public counter;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // counter = new Gateway();

        vm.stopBroadcast();
    }
}
