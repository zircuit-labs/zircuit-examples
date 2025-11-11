// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import { RedstonePrimaryProdWithoutRoundsERC7412 } from '@redstone-finance/on-chain-relayer/contracts/erc7412/RedstonePrimaryProdWithoutRoundsERC7412.sol';

contract ETHFeed is RedstonePrimaryProdWithoutRoundsERC7412 {
  function getTTL() override view internal virtual returns (uint256) {
    return 30;
  }

  function getDataFeedId() override view public virtual returns (bytes32) {
    return bytes32("ETH");
  }
}
