import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  Transfer as TransferEvent,
  Token as TokenContract
} from "../generated/Token/Token";
import { Token, Account, Transfer } from "../generated/schema";

// Helper function to load or create account
function loadOrCreateAccount(address: Address): Account {
  let account = Account.load(address.toHex());
  if (account == null) {
    account = new Account(address.toHex());
    account.balance = BigInt.fromI32(0);
    account.save();
  }
  return account;
}

// Helper function to load or create token
function loadOrCreateToken(address: Address): Token {
  let token = Token.load(address.toHex());
  if (token == null) {
    token = new Token(address.toHex());
    let contract = TokenContract.bind(address);
    
    // Try to get token details
    let nameCall = contract.try_name();
    let symbolCall = contract.try_symbol();
    let decimalsCall = contract.try_decimals();
    let totalSupplyCall = contract.try_totalSupply();
    
    token.name = nameCall.reverted ? "Unknown" : nameCall.value;
    token.symbol = symbolCall.reverted ? "Unknown" : symbolCall.value;
    token.decimals = decimalsCall.reverted ? 18 : decimalsCall.value;
    token.totalSupply = totalSupplyCall.reverted ? BigInt.fromI32(0) : totalSupplyCall.value;
    
    token.save();
  }
  return token;
}

export function handleTransfer(event: TransferEvent): void {
  // Load or create token
  loadOrCreateToken(event.address);
  
  // Load or create accounts
  let fromAccount = loadOrCreateAccount(event.params.from);
  let toAccount = loadOrCreateAccount(event.params.to);
  
  // Update balances
  let contract = TokenContract.bind(event.address);

  // If transfer is from self, update both accounts
  if (event.params.from.equals(event.params.to)) {
    let balCall = contract.try_balanceOf(event.params.from);
    if (!balCall.reverted) {
      fromAccount.balance = balCall.value;
      toAccount.balance = balCall.value;
      fromAccount.save();
      toAccount.save();
    }
  } else {
    let fromBalanceCall = contract.try_balanceOf(event.params.from);
    if (!fromBalanceCall.reverted) {
      fromAccount.balance = fromBalanceCall.value;
      fromAccount.save();
    }
  
    let toBalanceCall = contract.try_balanceOf(event.params.to);
    if (!toBalanceCall.reverted) {
      toAccount.balance = toBalanceCall.value;
      toAccount.save();
    }
  }
  
  // Create transfer entity
  let transfer = new Transfer(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  transfer.from = fromAccount.id;
  transfer.to = toAccount.id;
  transfer.value = event.params.value;
  transfer.timestamp = event.block.timestamp;
  transfer.blockNumber = event.block.number;
  transfer.transactionHash = event.transaction.hash;
  transfer.save();
}