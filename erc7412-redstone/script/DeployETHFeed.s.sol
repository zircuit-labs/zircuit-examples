// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "forge-std/Script.sol";
import {ETHFeed} from "src/ETHFeed.sol";

contract DeployETHFeed is Script {
  function run() external {
    vm.startBroadcast();

    ETHFeed feed = new ETHFeed();
    console2.log("ETHFeed deployed at:", address(feed));

    vm.stopBroadcast();
  }
}
