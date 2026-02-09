import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Transfer,
} from "../generated/Token/Token"

// Predictable transaction hash for testing
export const MOCK_TX_HASH = Bytes.fromHexString(
  "0x0000000000000000000000000000000000000000000000000000000000000001"
) as Bytes

export function createTransferEvent(
  from: Address,
  to: Address,
  value: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  // Set predictable transaction hash and logIndex for consistent entity IDs
  transferEvent.transaction.hash = MOCK_TX_HASH
  transferEvent.logIndex = BigInt.fromI32(1)

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return transferEvent
}
