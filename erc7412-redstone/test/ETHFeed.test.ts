import { describe, it, beforeAll, afterAll, expect } from '@jest/globals';
import { createPublicClient, http, createWalletClient, PublicClient, WalletClient, PrivateKeyAccount } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { foundry } from 'viem/chains';
import { generate7412CompatibleCall } from "@redstone-finance/erc7412";
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as viem from "viem";

// Helper function to sleep for a given time
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Read contract ABI and bytecode from Foundry's output
const contractArtifact = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../out/ETHFeed.sol/ETHFeed.json'), 'utf-8')
);
const multicallArtifact = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../out/Multicall3.sol/Multicall3.json'), 'utf-8')
  );
const contractAbi = contractArtifact.abi;
const multicallAbi = multicallArtifact.abi;

describe('ETHFeed Jest Tests', () => {
  let anvilProcess: ChildProcess;
  const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'); // Default Anvil private key
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let contractAddress: `0x${string}`;
  let multicallAddress: `0x${string}`;

  beforeAll(async () => {
    // Start a local Anvil instance
    anvilProcess = spawn('anvil', ['--silent'], { stdio: 'pipe' });
    await sleep(3000); // Wait for Anvil to be ready

    // Create viem clients
    publicClient = createPublicClient({ chain: foundry, transport: http() });
    walletClient = createWalletClient({ account, chain: foundry, transport: http() });

    // Deploy the ETHFeed contract
    const hash = await walletClient.deployContract({
      abi: contractAbi,
      bytecode: contractArtifact.bytecode.object as `0x${string}`,
      account,
      chain: null, // Explicitly set chain to null for local deployment
      args: [], // ETHFeed has no constructor args
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    contractAddress = receipt.contractAddress!;
    console.log(`ETHFeed deployed at: ${contractAddress}`);

    // Deploy the Multicall contract
    const multicallHash = await walletClient.deployContract({
        abi: multicallAbi,
        bytecode: multicallArtifact.bytecode.object as `0x${string}`,
        account,
        chain: null, // Explicitly set chain to null for local deployment
        args: [], // ETHFeed has no constructor args
      });
      const multicallReceipt = await publicClient.waitForTransactionReceipt({ hash: multicallHash });
      multicallAddress = multicallReceipt.contractAddress!;
      console.log(`Multicall deployed at: ${multicallAddress}`);

  }, 20000); // 20-second timeout for setup

  afterAll(() => {
    // Stop the Anvil instance
    if (anvilProcess) {
      anvilProcess.kill();
    }
  });

  it('should fetch the ETH price using Redstone ERC7412 flow', async () => {
    // Create a Redstone-wrapped public client
    const callData = viem.encodeFunctionData({
        functionName: "latestAnswer",
        args: [],
        abi: contractAbi,
      });

    // Call latestAnswer through the wrapped client
    // This will automatically fetch data from the oracle and include it in the transaction
    console.log('Fetching latest answer from wrapped contract...');
    const call = await generate7412CompatibleCall(
        publicClient,
        contractAddress,
        account.address,
        callData,
        multicallAddress,
      );

    const txHash = await walletClient.sendTransaction({ ...call, account, chain: null });
    await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log('latestAnswer transaction sent');

    // Now, verify that the value is cached in the contract by calling it directly
    console.log('Reading latest answer from the contract directly (should be cached)...');
    const price = await publicClient.readContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'latestAnswer',
        args: [],
    });
    console.log(`Received price: ${price}`);

    // Assert that the price is valid
    expect(price).toBeGreaterThan(0n);
  }, 30000); // 30-second timeout for the test
});
