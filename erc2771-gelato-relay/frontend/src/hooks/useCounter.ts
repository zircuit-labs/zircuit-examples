import { useState, useCallback, useMemo } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { GelatoRelay, CallWithERC2771Request } from '@gelatonetwork/relay-sdk-viem'
import { encodeFunctionData, type Hex, publicActions } from 'viem'
import { 
  GELATO_RELAY_API_KEY, 
  CONTRACT_ADDRESS, 
  COUNTER_ABI,
} from '../config'

export interface RelayResponse {
  taskId: string
}

export function useCounter() {
  const { address, chainId } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [isLoading, setIsLoading] = useState(false)
  const [taskId, setTaskId] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [counterValue, setCounterValue] = useState<bigint>(0n)

  // Initialize Gelato Relay once (no need to re-create per chain)
  const relay = useMemo(() => new GelatoRelay(), [])

  // Fetch current counter value
  const fetchCounter = useCallback(async () => {
    try {
      if (!publicClient) return

      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: COUNTER_ABI,
        functionName: 'getCounter',
      })

      setCounterValue(data as bigint)
    } catch (err) {
      console.error('Error fetching counter:', err)
    }
  }, [publicClient])

  // Send sponsored transaction
  const sendSponsoredTransaction = useCallback(async (
    functionName: 'increment' | 'decrement' | 'reset',
    message: string = ''
  ) => {
    setIsLoading(true)
    setError('')
    setTaskId('')

    try {
      if (!address) {
        throw new Error('Please connect your wallet')
      }

      if (!walletClient) {
        throw new Error('Wallet client not available')
      }

      if (!chainId) {
        throw new Error('Chain ID not available')
      }

      if (!GELATO_RELAY_API_KEY) {
        throw new Error('Gelato Relay API key not configured')
      }

      if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === '0x') {
        throw new Error('Contract address not configured')
      }

      // Encode function data
      let data: Hex
      if (functionName === 'reset') {
        data = encodeFunctionData({
          abi: COUNTER_ABI,
          functionName: 'reset',
        })
      } else {
        data = encodeFunctionData({
          abi: COUNTER_ABI,
          functionName,
          args: [message],
        })
      }

      // Prepare ERC2771 request
      const request: CallWithERC2771Request = {
        user: address,
        chainId: BigInt(chainId),
        target: CONTRACT_ADDRESS,
        data: data,
      }

      // Use the single Gelato Relay instance

      // Extend wallet client with public actions so it has readContract method
      const clientWithPublicActions = walletClient.extend(publicActions)

      // Send sponsored transaction via Gelato Relay
      const response = await relay.sponsoredCallERC2771(
        request,
        clientWithPublicActions as any,
        GELATO_RELAY_API_KEY
      )

      setTaskId(response.taskId)
      
      // Wait a bit and refresh counter
      setTimeout(() => {
        fetchCounter()
      }, 3000)

      return response
    } catch (err: any) {
      console.error('Error sending transaction:', err)
      setError(err.message || 'Transaction failed')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [address, walletClient, chainId, relay, fetchCounter])

  const increment = useCallback(
    (message: string) => sendSponsoredTransaction('increment', message),
    [sendSponsoredTransaction]
  )

  const decrement = useCallback(
    (message: string) => sendSponsoredTransaction('decrement', message),
    [sendSponsoredTransaction]
  )

  const reset = useCallback(
    () => sendSponsoredTransaction('reset'),
    [sendSponsoredTransaction]
  )

  return {
    counterValue,
    isLoading,
    taskId,
    error,
    increment,
    decrement,
    reset,
    fetchCounter,
  }
}
