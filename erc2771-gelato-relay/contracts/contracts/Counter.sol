// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC2771Context} from "@gelatonetwork/relay-context/contracts/vendor/ERC2771Context.sol";

/**
 * @title Counter
 * @notice A simple counter contract that supports Gelato Relay ERC2771 sponsored transactions
 * @dev Inherits from ERC2771Context to support gasless transactions through Gelato's trusted forwarder
 */
contract Counter is ERC2771Context {
    uint256 public counter;
    
    struct CounterAction {
        address user;
        uint256 previousValue;
        uint256 newValue;
        string message;
        uint256 timestamp;
    }
    
    CounterAction[] public history;
    
    event CounterIncremented(address indexed user, uint256 newValue, string message);
    event CounterDecremented(address indexed user, uint256 newValue, string message);
    event CounterReset(address indexed user);
    
    /**
     * @notice Constructor sets the trusted forwarder for ERC2771 context
     * @param trustedForwarder Address of Gelato's trusted forwarder for your network
     * @dev For Sepolia: 0xd8253782c45a12053594b9deB72d8e8aB2Fca54c
     * Check https://docs.gelato.cloud/relay/additional-resources/supported-networks for other networks
     */
    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {
        counter = 0;
    }
    
    /**
     * @notice Increments the counter by 1
     * @param message Optional message to log with the action
     * @dev Uses _msgSender() to get the original user address from ERC2771 context
     */
    function increment(string calldata message) external {
        address user = _msgSender(); // This returns the actual user, not the relayer
        uint256 previousValue = counter;
        counter++;
        
        history.push(CounterAction({
            user: user,
            previousValue: previousValue,
            newValue: counter,
            message: message,
            timestamp: block.timestamp
        }));
        
        emit CounterIncremented(user, counter, message);
    }
    
    /**
     * @notice Decrements the counter by 1
     * @param message Optional message to log with the action
     * @dev Reverts if counter is already 0
     */
    function decrement(string calldata message) external {
        require(counter > 0, "Counter: cannot decrement below zero");
        
        address user = _msgSender();
        uint256 previousValue = counter;
        counter--;
        
        history.push(CounterAction({
            user: user,
            previousValue: previousValue,
            newValue: counter,
            message: message,
            timestamp: block.timestamp
        }));
        
        emit CounterDecremented(user, counter, message);
    }
    
    /**
     * @notice Resets the counter to 0
     * @dev Only for demonstration purposes
     */
    function reset() external {
        address user = _msgSender();
        counter = 0;
        emit CounterReset(user);
    }
    
    /**
     * @notice Gets the total number of actions performed
     */
    function getHistoryLength() external view returns (uint256) {
        return history.length;
    }
    
    /**
     * @notice Gets a specific action from history
     * @param index The index of the action to retrieve
     */
    function getAction(uint256 index) external view returns (CounterAction memory) {
        require(index < history.length, "Counter: index out of bounds");
        return history[index];
    }
    
    /**
     * @notice Gets the current counter value
     */
    function getCounter() external view returns (uint256) {
        return counter;
    }
}
