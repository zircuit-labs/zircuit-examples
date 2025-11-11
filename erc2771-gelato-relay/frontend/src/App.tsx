import { WalletConnect } from './components/WalletConnect'
import { Counter } from './components/Counter'
import { ExternalLink, Github } from 'lucide-react'
import { CONTRACT_ADDRESS, GELATO_RELAY_API_KEY } from './config'

function App() {
  const hasConfig = CONTRACT_ADDRESS !== '0x' && GELATO_RELAY_API_KEY !== ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <svg className="w-10 h-10 text-gelato-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                Gelato Relay ERC2771
              </h1>
              <p className="text-slate-400 mt-1">
                Sponsored Gasless Transactions Demo
              </p>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!hasConfig && (
          <div className="mb-8 bg-yellow-900/20 border border-yellow-800 rounded-xl p-6">
            <h3 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              ⚠️ Configuration Required
            </h3>
            <div className="text-sm text-slate-300 space-y-2">
              <p>Please configure the following environment variables in <code className="bg-slate-800 px-2 py-1 rounded">.env</code>:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><code>VITE_GELATO_RELAY_API_KEY</code> - Get your API key from Gelato Relay</li>
                <li><code>VITE_CONTRACT_ADDRESS</code> - Deploy the Counter contract and add its address</li>
                <li><code>VITE_CHAIN_ID</code> - The chain ID you're deploying to (default: 11155111 for Sepolia)</li>
              </ul>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <Counter />

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="text-gelato-400 text-2xl mb-3">⚡</div>
              <h3 className="font-semibold text-white mb-2">Gasless Transactions</h3>
              <p className="text-sm text-slate-400">
                Users don't need ETH for gas. All fees are covered by your Gas Tank.
              </p>
            </div>

            <div className="card">
              <div className="text-gelato-400 text-2xl mb-3">🔐</div>
              <h3 className="font-semibold text-white mb-2">ERC2771 Context</h3>
              <p className="text-sm text-slate-400">
                Original sender is preserved through trusted forwarder architecture.
              </p>
            </div>

            <div className="card">
              <div className="text-gelato-400 text-2xl mb-3">🌐</div>
              <h3 className="font-semibold text-white mb-2">Multi-chain Support</h3>
              <p className="text-sm text-slate-400">
                Works across Ethereum, Polygon, Optimism, Arbitrum, Base, and more.
              </p>
            </div>
          </div>

          {/* Resources */}
          <div className="mt-12 card">
            <h3 className="font-semibold text-white mb-4 text-lg">📚 Resources</h3>
            <div className="space-y-3">
              <a
                href="https://docs.gelato.cloud/relay"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group"
              >
                <span className="text-slate-300">Gelato Relay Documentation</span>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-gelato-400" />
              </a>
              <a
                href="https://docs.gelato.cloud/relay/erc2771-recommended/overview"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group"
              >
                <span className="text-slate-300">ERC2771 Overview</span>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-gelato-400" />
              </a>
              <a
                href="https://app.gelato.cloud/relay"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group"
              >
                <span className="text-slate-300">Gelato Relay Dashboard</span>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-gelato-400" />
              </a>
              <a
                href="https://github.com/gelatodigital/relay-sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group"
              >
                <span className="text-slate-300 flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  Gelato Relay SDK
                </span>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-gelato-400" />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-500 text-sm">
            <p>Built with Gelato Relay • ERC2771 • Viem • React</p>
            <p className="mt-2">
              Powered by{' '}
              <a
                href="https://app.gelato.cloud/relay"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gelato-400 hover:text-gelato-300"
              >
                Gelato Network
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
