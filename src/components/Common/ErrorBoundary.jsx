import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Network Monitor Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="w-16 h-16 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-white/70 mb-6">
              The network simulation encountered an unexpected error. 
              Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="text-white/70 cursor-pointer hover:text-white">
                  Error Details (Dev Mode)
                </summary>
                <pre className="text-xs text-red-300 bg-red-900/20 p-4 rounded-lg mt-2 overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary