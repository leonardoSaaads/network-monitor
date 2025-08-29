import { useState, useEffect, useRef } from 'react'

// Constants
const ALGORITHMS = [
  { 
    id: 'round-robin',
    name: 'Round Robin', 
    description: 'Distributes requests sequentially across servers',
    pros: ['Simple implementation', 'Equal distribution'],
    cons: ['Ignores server load', 'No session persistence'],
    icon: '🔄'
  },
  { 
    id: 'least-connections',
    name: 'Least Connections', 
    description: 'Routes to server with fewest active connections',
    pros: ['Considers current load', 'Dynamic balancing'],
    cons: ['More complex', 'Requires connection tracking'],
    icon: '📊'
  },
  { 
    id: 'weighted',
    name: 'Weighted', 
    description: 'Routes based on predefined server weights',
    pros: ['Accounts for server capacity', 'Predictable distribution'],
    cons: ['Static configuration', 'Manual weight adjustment'],
    icon: '⚖️'
  },
  { 
    id: 'ip-hash',
    name: 'IP Hash', 
    description: 'Routes based on client IP hash for session persistence',
    pros: ['Session persistence', 'No additional storage'],
    cons: ['Uneven distribution possible', 'Issues with NAT'],
    icon: '🔐'
  }
]

const SERVER_COLORS = {
  healthy: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', dot: 'bg-emerald-500', text: 'text-emerald-400' },
  warning: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', dot: 'bg-amber-500', text: 'text-amber-400' },
  critical: { bg: 'bg-red-500/20', border: 'border-red-500/50', dot: 'bg-red-500', text: 'text-red-400' },
  offline: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', dot: 'bg-gray-500', text: 'text-gray-500' }
}

function LoadBalancerIndicator({ isAnimating }) {
  const [algorithm, setAlgorithm] = useState('round-robin')
  const [servers, setServers] = useState([
    { id: 1, name: 'web-01', cpu: 45, memory: 62, connections: 234, status: 'healthy', region: 'us-east' },
    { id: 2, name: 'web-02', cpu: 67, memory: 71, connections: 412, status: 'healthy', region: 'us-east' },
    { id: 3, name: 'web-03', cpu: 23, memory: 45, connections: 156, status: 'healthy', region: 'us-west' },
    { id: 4, name: 'web-04', cpu: 89, memory: 92, connections: 523, status: 'warning', region: 'us-west' }
  ])
  const [activeRequests, setActiveRequests] = useState([])
  const [metrics, setMetrics] = useState({ totalRequests: 0, avgLatency: 0, errorRate: 0 })
  const [selectedServer, setSelectedServer] = useState(null)
  const [showAlgorithmDetails, setShowAlgorithmDetails] = useState(false)
  const roundRobinIndex = useRef(0)

  useEffect(() => {
    if (!isAnimating) return

    const interval = setInterval(() => {
      // Generate new request
      const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const clientIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      
      // Select target server based on algorithm
      let targetServer = selectServer(clientIp)
      if (!targetServer) return

      // Create request object
      const newRequest = {
        id: requestId,
        clientIp,
        targetServerId: targetServer.id,
        status: 'routing',
        timestamp: Date.now()
      }

      setActiveRequests(prev => [...prev.slice(-4), newRequest])

      // Update server load
      setTimeout(() => {
        setServers(prev => prev.map(server => {
          if (server.id === targetServer.id) {
            const newConnections = server.connections + 1
            const newCpu = Math.min(95, server.cpu + Math.random() * 5)
            const newMemory = Math.min(95, server.memory + Math.random() * 3)
            
            return {
              ...server,
              connections: newConnections,
              cpu: newCpu,
              memory: newMemory,
              status: getServerStatus(newCpu, newMemory)
            }
          }
          // Gradually decrease load on other servers
          return {
            ...server,
            cpu: Math.max(10, server.cpu - Math.random() * 2),
            memory: Math.max(10, server.memory - Math.random() * 1),
            connections: Math.max(50, server.connections - Math.floor(Math.random() * 5))
          }
        }))

        // Update request status
        setActiveRequests(prev => 
          prev.map(req => req.id === requestId ? { ...req, status: 'completed' } : req)
        )

        // Update metrics
        setMetrics(prev => ({
          totalRequests: prev.totalRequests + 1,
          avgLatency: Math.floor(20 + Math.random() * 80),
          errorRate: Math.random() * 5
        }))

        // Remove old requests
        setTimeout(() => {
          setActiveRequests(prev => prev.filter(req => req.id !== requestId))
        }, 2000)
      }, 1000)
    }, 2000)

    return () => clearInterval(interval)
  }, [isAnimating, algorithm])

  const selectServer = (clientIp) => {
    const healthyServers = servers.filter(s => s.status !== 'offline')
    if (healthyServers.length === 0) return null

    switch (algorithm) {
      case 'round-robin':
        roundRobinIndex.current = (roundRobinIndex.current + 1) % healthyServers.length
        return healthyServers[roundRobinIndex.current]
      
      case 'least-connections':
        return healthyServers.reduce((min, server) => 
          server.connections < min.connections ? server : min
        )
      
      case 'weighted': {
        const weights = healthyServers.map(s => 100 - s.cpu)
        const totalWeight = weights.reduce((a, b) => a + b, 0)
        let random = Math.random() * totalWeight
        
        for (let i = 0; i < healthyServers.length; i++) {
          if (random <= weights[i]) return healthyServers[i]
          random -= weights[i]
        }
        return healthyServers[0]
      }
      
      case 'ip-hash': {
        const ipParts = clientIp.split('.').map(octet => parseInt(octet, 10));
        if (ipParts.length !== 4 || ipParts.some(isNaN)) {
          return healthyServers[0];
        }
        const hash = ipParts.reduce((acc, octet) => acc + octet, 0);
        return healthyServers[hash % healthyServers.length];
      }
      
      default:
        return healthyServers[0];
    }
  }

  const getServerStatus = (cpu, memory) => {
    if (cpu > 85 || memory > 85) return 'critical'
    if (cpu > 70 || memory > 70) return 'warning'
    return 'healthy'
  }

  const currentAlgorithm = ALGORITHMS.find(alg => alg.id === algorithm)

  return (
    <div className="space-y-6">
      {/* Algorithm Selector - Mobile Optimized */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-white">Load Balancing Algorithm</h3>
          <button
            onClick={() => setShowAlgorithmDetails(!showAlgorithmDetails)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 self-start lg:self-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Learn More
          </button>
        </div>

        {/* Algorithm Buttons - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
          {ALGORITHMS.map((alg) => (
            <button
              key={alg.id}
              onClick={() => setAlgorithm(alg.id)}
              className={`
                relative p-3 md:p-4 rounded-xl transition-all duration-300 
                ${algorithm === alg.id 
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]' 
                  : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                }
              `}
            >
              <div className="text-2xl mb-1">{alg.icon}</div>
              <div className="text-xs md:text-sm font-medium">{alg.name}</div>
              {algorithm === alg.id && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Algorithm Details - Collapsible */}
        {showAlgorithmDetails && currentAlgorithm && (
          <div className="mt-4 p-4 bg-white/5 rounded-xl animate-fadeIn">
            <p className="text-white/80 text-sm mb-3">{currentAlgorithm.description}</p>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-green-400 font-medium mb-1">Advantages</div>
                <ul className="space-y-1">
                  {currentAlgorithm.pros.map((pro, i) => (
                    <li key={i} className="text-white/70 flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-amber-400 font-medium mb-1">Considerations</div>
                <ul className="space-y-1">
                  {currentAlgorithm.cons.map((con, i) => (
                    <li key={i} className="text-white/70 flex items-start gap-2">
                      <span className="text-amber-400 mt-1">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Metrics Dashboard */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-blue-500/30">
          <div className="text-2xl md:text-3xl font-bold text-white mb-1">
            {metrics.totalRequests.toLocaleString()}
          </div>
          <div className="text-xs md:text-sm text-blue-400">Total Requests</div>
        </div>
        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-green-500/30">
          <div className="text-2xl md:text-3xl font-bold text-white mb-1">
            {metrics.avgLatency}ms
          </div>
          <div className="text-xs md:text-sm text-green-400">Avg Latency</div>
        </div>
        <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/30 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-amber-500/30">
          <div className="text-2xl md:text-3xl font-bold text-white mb-1">
            {metrics.errorRate.toFixed(2)}%
          </div>
          <div className="text-xs md:text-sm text-amber-400">Error Rate</div>
        </div>
      </div>

      {/* Live Traffic Flow Visualization */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
        <h3 className="text-lg md:text-xl font-semibold text-white mb-4">Live Traffic Distribution</h3>
        
        <div className="relative">
          {/* Active Requests Animation */}
          <div className="mb-4 min-h-[60px]">
            <div className="flex flex-wrap gap-2">
              {activeRequests.map((request) => (
                <div
                  key={request.id}
                  className={`
                    px-2 py-1 rounded-lg text-xs font-mono transition-all duration-500
                    ${request.status === 'routing' 
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse' 
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                    }
                  `}
                >
                  {request.clientIp} → {servers.find(s => s.id === request.targetServerId)?.name}
                </div>
              ))}
            </div>
          </div>

          {/* Server Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {servers.map((server) => {
              const colors = SERVER_COLORS[server.status]
              const isActive = activeRequests.some(req => req.targetServerId === server.id)
              
              return (
                <div
                  key={server.id}
                  onClick={() => setSelectedServer(server)}
                  className={`
                    relative p-4 rounded-xl cursor-pointer transition-all duration-300
                    ${colors.bg} ${colors.border} border-2
                    ${isActive ? 'scale-105 shadow-lg' : 'hover:scale-102'}
                    ${selectedServer?.id === server.id ? 'ring-2 ring-white/30' : ''}
                  `}
                >
                  {/* Server Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colors.dot} ${isActive ? 'animate-pulse' : ''}`} />
                      <span className="text-white font-medium">{server.name}</span>
                    </div>
                    <span className="text-xs text-white/50">{server.region}</span>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-2">
                    {/* CPU */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70">CPU</span>
                        <span className={colors.text}>{server.cpu}%</span>
                      </div>
                      <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${colors.dot} transition-all duration-500`}
                          style={{ width: `${server.cpu}%` }}
                        />
                      </div>
                    </div>

                    {/* Memory */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70">Memory</span>
                        <span className={colors.text}>{server.memory}%</span>
                      </div>
                      <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${colors.dot} transition-all duration-500`}
                          style={{ width: `${server.memory}%` }}
                        />
                      </div>
                    </div>

                    {/* Connections */}
                    <div className="pt-2 border-t border-white/10">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/70">Connections</span>
                        <span className="text-white font-medium">{server.connections}</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Request Indicator */}
                  {isActive && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                      Active
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Server Details Modal */}
      {selectedServer && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedServer(null)}
        >
          <div 
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-white">{selectedServer.name}</h3>
              <button
                onClick={() => setSelectedServer(null)}
                className="text-white/60 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Status</span>
                <span className={`font-medium ${SERVER_COLORS[selectedServer.status].text}`}>
                  {selectedServer.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Region</span>
                <span className="text-white">{selectedServer.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">CPU Usage</span>
                <span className="text-white">{selectedServer.cpu}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Memory Usage</span>
                <span className="text-white">{selectedServer.memory}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Active Connections</span>
                <span className="text-white">{selectedServer.connections}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoadBalancerIndicator