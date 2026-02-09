import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useAccount, useWalletClient, usePublicClient } from 'wagmi'
import { GelatoRelay, CallWithERC2771Request, TaskState } from '@gelatonetwork/relay-sdk-viem'
import { encodeFunctionData, type Hex, publicActions } from 'viem'
import { 
  GELATO_RELAY_API_KEY, 
  CONTRACT_ADDRESS, 
  COUNTER_ABI,
} from '../config'

export interface RelayResponse {
  taskId: string
}

const TERMINAL_TASK_STATES = new Set<TaskState>([
  TaskState.ExecSuccess,
  TaskState.ExecReverted,
  TaskState.Cancelled,
])

const POLL_INTERVAL_MS = 2000
const MAX_POLL_ATTEMPTS = 60

export function useCounter() {
  const { address, chainId } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const [isLoading, setIsLoading] = useState(false)
  const [taskId, setTaskId] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [counterValue, setCounterValue] = useState<bigint>(0n)

  const mountedRef = useRef(true)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Initialize Gelato Relay once (no need to re-create per chain)
  const relay = useMemo(() => new GelatoRelay(), [])

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (pollIntervalRef.current !== null) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [])

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

  // Poll relay task status until terminal, then refresh counter
  const pollTaskStatus = useCallback((relayTaskId: string) => {
    let attempts = 0

    if (pollIntervalRef.current !== null) {
      clearInterval(pollIntervalRef.current)
    }

    pollIntervalRef.current = setInterval(async () => {
      attempts++

      if (!mountedRef.current) {
        clearInterval(pollIntervalRef.current!)
        pollIntervalRef.current = null
        return
      }

      try {
        const status = await relay.getTaskStatus(relayTaskId)
        if (!mountedRef.current) return

        if (status && TERMINAL_TASK_STATES.has(status.taskState)) {
          clearInterval(pollIntervalRef.current!)
          pollIntervalRef.current = null

          if (status.taskState === TaskState.ExecSuccess) {
            await fetchCounter()
          } else {
            setError(
              `Task ${status.taskState}: ${status.lastCheckMessage ?? 'Unknown error'}`
            )
          }

          if (mountedRef.current) {
            setIsLoading(false)
          }
          return
        }
      } catch (err) {
        console.error('Error polling task status:', err)
      }

      if (attempts >= MAX_POLL_ATTEMPTS) {
        clearInterval(pollIntervalRef.current!)
        pollIntervalRef.current = null
        if (mountedRef.current) {
          setError('Task polling timed out')
          setIsLoading(false)
        }
      }
    }, POLL_INTERVAL_MS)
  }, [relay, fetchCounter])

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

      // Poll for task completion, then refresh counter
      pollTaskStatus(response.taskId)

      return response
    } catch (err: any) {
      console.error('Error sending transaction:', err)
      setError(err.message || 'Transaction failed')
      setIsLoading(false)
      throw err
    }
  }, [address, walletClient, chainId, relay, pollTaskStatus])

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
