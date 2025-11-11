# RedStone ERC-7412 Example

## Video

[![RedStone ERC-7412 Example Video](http://img.youtube.com/vi/2u2SeT60UcE/0.jpg)](https://www.youtube.com/watch?v=2u2SeT60UcE "Understanding Price Oracles and ERC-7412: A Developer’s Guide")

This repository provides a comprehensive example of how to integrate [RedStone Oracles](https://redstone.finance/) into a smart contract using the [ERC-7412 standard](https://docs.redstone.finance/docs/smart-contract-devs/get-started/redstone-erc7412). The project uses a hybrid setup:

- **[Foundry](https://book.getfoundry.sh/)** is used for compiling and deploying.
- **[Jest](https://jestjs.io/)** and **[Viem](https://viem.sh/)** are used for end-to-end testing of the oracle functionality, both locally with Anvil and on a live testnet.

## Important Notices

- This repository is a sample for demonstration/education. It is not production-ready.
- This repository is excluded from all Zircuit bug bounty programs.
- This package is not published on npmjs.

## Project Structure

- `src/ETHFeed.sol`: A simple price feed contract that fetches the price of ETH using RedStone's ERC-7412 interface.
- `test/ETHFeed.test.ts`: Jest tests for local end-to-end validation. It deploys the contract to a local Anvil instance and verifies the oracle data fetching mechanism.
- `test/ETHFeed.garfield.test.ts`: Jest tests for interacting with a pre-deployed contract on the Garfield (Zircuit) testnet.
- `script/DeployETHFeed.s.sol`: A Foundry script for deploying the `ETHFeed` contract to any EVM-compatible chain.
- `foundry.toml`: Foundry configuration, including remappings for Node.js dependencies.

## Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)

## Getting Started

### 1. Installation

Clone the repository and install the required dependencies:

```bash
npm ci
```

### 2. Compile the Contract

Use Foundry to compile the smart contracts:

```bash
forge build
```

## Testing

This project includes two types of tests: local end-to-end tests and testnet interaction tests.

### Local End-to-End Testing

The local tests use Jest to deploy the `ETHFeed` contract to a temporary Anvil instance and verify that it can correctly fetch data from the RedStone oracle.

Run the tests with:

```bash
bun test
```

This command will automatically:
1. Start a local Anvil node.
2. Deploy the `ETHFeed` and `Multicall3` contracts.
3. Execute a transaction that uses the ERC-7412 mechanism to fetch the ETH price.
4. Verify that the price is correctly stored in the contract.

### Testnet Interaction (Garfield)

The `ETHFeed.garfield.test.ts` file is configured to interact with a pre-deployed contract on the Garfield testnet. To run it, you need to set up your environment.

1. Create a `.env` file by copying the example:

```bash
cp .env.example .env
```

2. Add your private key to the `.env` file:

```
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

3. Run the Garfield-specific test:

```bash
bun jest test/ETHFeed.garfield.test.ts
```

## Deployment

You can deploy the `ETHFeed` contract to any EVM-compatible chain using the provided Foundry script.

**1. Setup Private Key**

```bash
cast wallet import testnetKey --interactive
```

**2. Run the Deployment Script**:

```bash
forge script script/DeployETHFeed.s.sol \
     --rpc-url garfield_testnet \
     --account testnetKey \
     --broadcast -vv
   ```

This will deploy the `ETHFeed` contract and print its address to the console.

You can add this address to the `ETHFeed.garfield.test.ts` file to interact with it in the tests.

```
$ bun test
bun test v1.2.20 (6ad208bc)

test/ETHFeed.test.ts:
ETHFeed deployed at: 0x5fbdb2315678afecb367f032d93f642f64180aa3
Multicall deployed at: 0xe7f1725e7734ce288f8367e1bb143e90bb3f0512
Fetching latest answer from wrapped contract...
latestAnswer transaction sent
Reading latest answer from the contract directly (should be cached)...
Received price: 465332588475
✓ ETHFeed Jest Tests > should fetch the ETH price using Redstone ERC7412 flow [223.56ms]

test/ETHFeed.garfield.test.ts:
ETHFeed read at: 0x5B511454E49F26BdaA426E9E3e1C8C4d531bCd2F
Multicall read at: 0xcA11bde05977b3631167028862bE2a173976CA11
Attempting to read latest answer directly...
Read successful. Price: 466083048340
✓ ETHFeed Garfield Testnet Tests > should fetch the ETH price using Redstone ERC7412 flow [289.92ms]

 2 pass
 0 fail
 2 expect() calls
Ran 2 tests across 2 files. [4.04s]
```
