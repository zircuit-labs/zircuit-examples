import {
  assert,
  describe,
  test,
  clearStore
} from "matchstick-as/assembly/index"
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { createMockedFunction } from "matchstick-as/assembly/index"
import { handleTransfer } from "../src/mapping"
import { createTransferEvent } from "./token-utils"

// Default mock event address used by newMockEvent()
const CONTRACT = Address.fromString(
  "0xa16081f360e3847006db660bae1c6d1b2e17ec2a"
)

function mockBalanceOf(holder: Address, value: BigInt): void {
  createMockedFunction(
    CONTRACT,
    "balanceOf",
    "balanceOf(address):(uint256)"
  )
    .withArgs([ethereum.Value.fromAddress(holder)])
    .returns([ethereum.Value.fromUnsignedBigInt(value)])
}

function mockTokenMetaReverts(): void {
  // loadOrCreateToken() calls these via try_*. We want them to "revert"
  // so the mapping uses the default fallback values.
  createMockedFunction(CONTRACT, "name", "name():(string)").reverts()
  createMockedFunction(CONTRACT, "symbol", "symbol():(string)").reverts()
  createMockedFunction(CONTRACT, "decimals", "decimals():(uint8)").reverts()
  createMockedFunction(
    CONTRACT,
    "totalSupply",
    "totalSupply():(uint256)"
  ).reverts()
}

describe("Mapping behavior", () => {
  test("Transfer updates balances and creates entities", () => {
    clearStore()

    let from = Address.fromString("0x00000000000000000000000000000000000000f1")
    let to = Address.fromString("0x00000000000000000000000000000000000000f2")
    let value = BigInt.fromI32(100)

    // Mock token metadata to revert so defaults are used
    mockTokenMetaReverts()
    // Mock post-transfer balances returned by the contract
    mockBalanceOf(from, BigInt.fromI32(900))
    mockBalanceOf(to, BigInt.fromI32(1100))

    let event = createTransferEvent(from, to, value)
    handleTransfer(event)

    // Accounts exist with mocked balances
    assert.fieldEquals("Account", from.toHexString(), "balance", "900")
    assert.fieldEquals("Account", to.toHexString(), "balance", "1100")

    // Transfer entity recorded
    assert.entityCount("Transfer", 1)
    assert.fieldEquals(
      "Transfer",
      `${CONTRACT.toHexString()}-1`,
      "from",
      from.toHexString()
    )
    assert.fieldEquals(
      "Transfer",
      `${CONTRACT.toHexString()}-1`,
      "to",
      to.toHexString()
    )
    assert.fieldEquals(
      "Transfer",
      `${CONTRACT.toHexString()}-1`,
      "value",
      value.toString()
    )

    // Token entity gets created on first transfer; defaults are acceptable if calls revert
    assert.entityCount("Token", 1)
    assert.fieldEquals("Token", CONTRACT.toHexString(), "name", "Unknown")
    assert.fieldEquals("Token", CONTRACT.toHexString(), "symbol", "Unknown")
    assert.fieldEquals("Token", CONTRACT.toHexString(), "decimals", "18")
    assert.fieldEquals("Token", CONTRACT.toHexString(), "totalSupply", "0")
  })

  test("Self-transfer updates both balances from a single mocked call", () => {
    clearStore()

    let self = Address.fromString("0x0000000000000000000000000000000000000abc")
    let value = BigInt.fromI32(1)

    // Mock token metadata to revert so defaults are used
    mockTokenMetaReverts()
    // Mock one balance for the self address; mapping will apply to both from/to
    mockBalanceOf(self, BigInt.fromI32(1234))

    let event = createTransferEvent(self, self, value)
    handleTransfer(event)

    assert.fieldEquals("Account", self.toHexString(), "balance", "1234")

    // Transfer entity recorded
    assert.entityCount("Transfer", 1)
    assert.fieldEquals(
      "Transfer",
      `${CONTRACT.toHexString()}-1`,
      "from",
      self.toHexString()
    )
    assert.fieldEquals(
      "Transfer",
      `${CONTRACT.toHexString()}-1`,
      "to",
      self.toHexString()
    )
  })
})
