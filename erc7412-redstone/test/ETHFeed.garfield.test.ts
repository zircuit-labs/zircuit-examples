import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import * as viem from "viem";

import { describe, it, beforeAll, expect } from '@jest/globals';
import { createPublicClient, http, createWalletClient, PublicClient, WalletClient, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { generate7412CompatibleCall } from "@redstone-finance/erc7412";

// Read contract ABI and bytecode from Foundry's output
const contractArtifact = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../out/ETHFeed.sol/ETHFeed.json'), 'utf-8')
);
const contractAbi = contractArtifact.abi;

// Define the Garfield Testnet
const garfield = defineChain({
    id: 48898,
    name: 'Garfield Testnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://garfield-testnet.zircuit.com/']
        }
    }
});

describe('ETHFeed Garfield Testnet Tests', () => {
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY environment variable is not set');
  }
  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
  let publicClient: PublicClient;
  let walletClient: WalletClient;
  let contractAddress: `0x${string}`;
  let multicallAddress: `0x${string}`;

  beforeAll(async () => {
    // Create viem clients for Garfield Testnet
    publicClient = createPublicClient({ chain: garfield, transport: http() });
    walletClient = createWalletClient({ account, chain: garfield, transport: http() });

    // Set the ETHFeed contract address
    contractAddress = "0xF7A7310F8C676d07D85FBe69f49e03b6CE304BFC";
    console.log(`ETHFeed read at: ${contractAddress}`);

    // Set the multicall address
    multicallAddress = "0xcA11bde05977b3631167028862bE2a173976CA11";
    console.log(`Multicall read at: ${multicallAddress}`);
  });

  it('should fetch the ETH price using Redstone ERC7412 flow', async () => {
    try {
      // First, try to read the value directly
      console.log('Attempting to read latest answer directly...');
      const price = await publicClient.readContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: 'latestAnswer',
        args: [],
      });
      console.log(`Read successful. Price: ${price}`);
      expect(price).toBeGreaterThan(0n);
    } catch (error) {
      // If the read fails, proceed with the update
      console.log('Direct read failed. Proceeding with update...');
      const callData = viem.encodeFunctionData({
        functionName: "latestAnswer",
        args: [],
        abi: contractAbi,
      });

      console.log('Fetching latest answer from wrapped contract...');
      const call = await generate7412CompatibleCall(
        publicClient,
        contractAddress,
        account.address,
        callData,
        multicallAddress,
      );

      const txHash = await walletClient.sendTransaction({ ...call, account, chain: garfield });
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
    }
  }, 60000); // 60-second timeout for the test
});
