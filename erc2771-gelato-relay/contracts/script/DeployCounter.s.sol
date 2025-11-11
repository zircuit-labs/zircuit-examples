// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {Counter} from "../contracts/Counter.sol";

/// @notice Foundry deployment script for Counter
contract DeployCounter is Script {
    function run() external {
        address trustedForwarder;
        if (block.chainid == 11155111) trustedForwarder = 0xd8253782c45a12053594b9deB72d8e8aB2Fca54c;        // Sepolia
        else if (block.chainid == 48900) trustedForwarder = 0x61F2976610970AFeDc1d83229e1E21bdc3D5cbE4;       // Zircuit
        else revert("Unsupported chain");

        vm.startBroadcast();
        Counter counter = new Counter(trustedForwarder);
        vm.stopBroadcast();

        console2.log("Counter deployed at:", address(counter));
    }
}
