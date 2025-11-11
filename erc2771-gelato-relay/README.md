# Gelato Relay ERC2771 Sponsored Transactions

## Video

[![Gelato Relay ERC2771 Sponsored Transactions Video](http://img.youtube.com/vi/pEJmuOBpssw/0.jpg)](https://www.youtube.com/watch?v=pEJmuOBpssw "Gelato Relay ERC2771 Sponsored Transactions Video")

This project demonstrates how to implement sponsored transactions using Gelato Relay with ERC2771 context. It allows users to interact with your dApp without paying gas fees.

## Prerequisites

- Node.js v18+
- MetaMask or another Web3 wallet
- Gelato Sponsor API Key (get one at https://app.gelato.cloud/relay)

## Smart Contract

The project includes a simple Counter contract that:
- Inherits from ERC2771Context for sponsored transactions
- Allows incrementing and decrementing a counter
- Stores messages with each interaction

### Contract Address & Trusted Forwarder

- **Network**: Sepolia Testnet
- **Trusted Forwarder**: `0xd8253782c45a12053594b9deB72d8e8aB2Fca54c` (for sponsoredCallERC2771)

Check [Supported Networks](https://docs.gelato.cloud/relay/additional-resources/supported-networks) for other networks.

## Setup Instructions

### 1. Install Dependencies

```bash
# Install contract dependencies
cd contracts
forge install

# Install frontend dependencies
cd ../frontend
npm ci
```

### 2. Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_GELATO_RELAY_API_KEY=your_sponsor_api_key_here
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
```

### 3. Deploy Smart Contract

```bash
cd contracts
forge compile

# Create a foundry wallet
forge wallet import deployer --interactive

# Deploy to Sepolia or your preferred network
forge script script/DeployCounter.s.sol \
  --rpc-url sepolia \
  --account deployer \
  --broadcast
```

### 4. Run Frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` to interact with the dApp.

## How It Works

### ERC2771 Context

The smart contract uses ERC2771Context to extract the original sender from the transaction data when called through Gelato's trusted forwarder. This enables:

1. **Gasless Transactions**: Users sign messages instead of sending transactions
2. **Original Sender Preservation**: `_msgSender()` returns the actual user, not the relayer
3. **Sponsored Gas**: Your Gas Tank covers the transaction costs

### Frontend Flow

1. User connects wallet (MetaMask)
2. User clicks "Increment" or "Decrement"
3. Frontend encodes the function call
4. User signs the ERC2771 message
5. Gelato Relay executes the transaction
6. User sees the result without paying gas

## Key Features

- ✅ Gasless transactions for users
- ✅ ERC2771 context preservation
- ✅ Multi-chain support via Gelato
- ✅ Real-time transaction status tracking
- ✅ Modern React + Viem setup
- ✅ TypeScript support
- ✅ TailwindCSS styling

## Gas Tank Management

Monitor your Gas Tank balance at: https://app.gelato.cloud/one-balance

Top up your balance to continue sponsoring transactions.

## Resources

- [Gelato Relay Documentation](https://docs.gelato.cloud/relay)
- [ERC2771 Overview](https://docs.gelato.cloud/relay/erc2771-recommended/overview)
- [Supported Networks](https://docs.gelato.cloud/relay/additional-resources/supported-networks)

## License

MIT
