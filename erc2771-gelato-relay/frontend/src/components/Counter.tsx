import { useEffect, useState } from 'react'
import { useCounter } from '../hooks/useCounter'
import { useAccount } from 'wagmi'
import { Plus, Minus, RotateCcw, Loader2, CheckCircle2, ExternalLink } from 'lucide-react'

export function Counter() {
  const { address, isConnected } = useAccount()
  const { 
    counterValue, 
    isLoading, 
    taskId, 
    error, 
    increment, 
    decrement, 
    reset,
    fetchCounter 
  } = useCounter()
  
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isConnected) {
      fetchCounter()
      const interval = setInterval(fetchCounter, 10000)
      return () => clearInterval(interval)
    }
  }, [isConnected, fetchCounter])

  const handleIncrement = async () => {
    try {
      await increment(message || 'Incremented')
      setMessage('')
    } catch (err) {
      console.error(err)
    }
  }

  const handleDecrement = async () => {
    try {
      await decrement(message || 'Decremented')
      setMessage('')
    } catch (err) {
      console.error(err)
    }
  }

  const handleReset = async () => {
    try {
      await reset()
    } catch (err) {
      console.error(err)
    }
  }

  if (!isConnected) {
    return (
      <div className="card text-center">
        <p className="text-slate-400">Please connect your wallet to interact with the counter</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Counter Display */}
      <div className="card text-center">
        <h2 className="text-2xl font-bold text-slate-400 mb-4">Current Counter</h2>
        <div className="text-7xl font-bold text-gelato-400 mb-4">
          {counterValue.toString()}
        </div>
        <p className="text-sm text-slate-500">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </div>

      {/* Message Input */}
      <div className="card">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Optional Message
        </label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a message (optional)"
          className="input w-full"
          disabled={isLoading}
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleIncrement}
          disabled={isLoading}
          className="btn-primary flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          Increment
        </button>

        <button
          onClick={handleDecrement}
          disabled={isLoading || counterValue === 0n}
          className="btn-primary flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Minus className="w-5 h-5" />
          )}
          Decrement
        </button>

        <button
          onClick={handleReset}
          disabled={isLoading}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RotateCcw className="w-5 h-5" />
          )}
          Reset
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="card bg-red-900/20 border-red-800">
          <p className="text-red-400">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {taskId && (
        <div className="card bg-green-900/20 border-green-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-400 font-semibold mb-2">
                Transaction Submitted Successfully!
              </p>
              <p className="text-sm text-slate-400 mb-2">
                Task ID: <code className="text-green-300">{taskId}</code>
              </p>
              <a
                href={`https://relay.gelato.digital/tasks/status/${taskId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gelato-400 hover:text-gelato-300 text-sm"
              >
                View on Gelato Relay
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="card bg-gelato-900/20 border-gelato-800">
        <h3 className="font-semibold text-gelato-400 mb-2">🎉 Gasless Transactions</h3>
        <p className="text-sm text-slate-400">
          All transactions are sponsored by Gelato Relay. You don't need any ETH for gas fees!
          Simply sign the message and the transaction will be executed on your behalf.
        </p>
      </div>
    </div>
  )
}
