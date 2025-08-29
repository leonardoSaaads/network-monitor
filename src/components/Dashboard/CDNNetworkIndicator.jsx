import { useState, useEffect, useRef } from 'react'

// CDN Regions and Edge Servers
const CDN_REGIONS = [
  {
    id: 'us-east',
    name: 'US East',
    location: 'Virginia',
    coordinates: { x: 25, y: 40 },
    servers: 12,
    load: 45,
    latency: 10,
    cached: ['images', 'css', 'js', 'video']
  },
  {
    id: 'us-west',
    name: 'US West',
    location: 'California',
    coordinates: { x: 15, y: 45 },
    servers: 10,
    load: 67,
    latency: 15,
    cached: ['images', 'css', 'js']
  },
  {
    id: 'eu-central',
    name: 'EU Central',
    location: 'Frankfurt',
    coordinates: { x: 50, y: 30 },
    servers: 15,
    load: 72,
    latency: 25,
    cached: ['images', 'css', 'js', 'fonts']
  },
  {
    id: 'asia-pacific',
    name: 'Asia Pacific',
    location: 'Singapore',
    coordinates: { x: 75, y: 60 },
    servers: 8,
    load: 89,
    latency: 45,
    cached: ['images', 'css']
  },
  {
    id: 'south-america',
    name: 'South America',
    location: 'São Paulo',
    coordinates: { x: 35, y: 70 },
    servers: 6,
    load: 34,
    latency: 35,
    cached: ['images', 'css', 'js', 'video', 'fonts']
  }
]

// Content Types
const CONTENT_TYPES = [
  { type: 'HTML', size: '15 KB', cacheable: false, icon: '📄', color: 'bg-orange-500' },
  { type: 'CSS', size: '45 KB', cacheable: true, icon: '🎨', color: 'bg-blue-500' },
  { type: 'JavaScript', size: '120 KB', cacheable: true, icon: '⚡', color: 'bg-yellow-500' },
  { type: 'Images', size: '2.5 MB', cacheable: true, icon: '🖼️', color: 'bg-green-500' },
  { type: 'Video', size: '25 MB', cacheable: true, icon: '🎬', color: 'bg-purple-500' },
  { type: 'Fonts', size: '80 KB', cacheable: true, icon: '🔤', color: 'bg-pink-500' }
]

// Cache Strategies
const CACHE_STRATEGIES = [
  {
    id: 'pull',
    name: 'Pull Through Cache',
    description: 'CDN fetches content from origin on first request',
    icon: '⬇️',
    pros: ['Simple setup', 'No pre-warming needed'],
    cons: ['First request slower', 'Origin load on cache miss']
  },
  {
    id: 'push',
    name: 'Push to Edge',
    description: 'Content pre-populated to edge servers',
    icon: '⬆️',
    pros: ['Fast first request', 'Predictable performance'],
    cons: ['Storage costs', 'Manual management']
  },
  {
    id: 'hybrid',
    name: 'Hybrid Strategy',
    description: 'Combines pull and push based on content',
    icon: '🔄',
    pros: ['Flexible', 'Optimized per content type'],
    cons: ['Complex configuration', 'Monitoring overhead']
  }
]

function CDNNetworkIndicator({ isAnimating }) {
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [activeRequests, setActiveRequests] = useState([])
  const [cacheHits, setCacheHits] = useState(0)
  const [cacheMisses, setCacheMisses] = useState(0)
  const [selectedStrategy, setSelectedStrategy] = useState('pull')
  const [showMetrics, setShowMetrics] = useState(true)
  const [bandwidthSaved, setBandwidthSaved] = useState(0)
  const [activeContent, setActiveContent] = useState(null)
  const [purgeCache, setPurgeCache] = useState(false)
  const [regionStats, setRegionStats] = useState({})
  const animationRef = useRef(null)

  useEffect(() => {
    if (!isAnimating) {
      setActiveRequests([])
      return
    }

    // Simulate requests from different regions
    animationRef.current = setInterval(() => {
      const userRegions = ['North America', 'Europe', 'Asia', 'South America', 'Africa']
      const userRegion = userRegions[Math.floor(Math.random() * userRegions.length)]
      
      // Select random content type
      const content = CONTENT_TYPES[Math.floor(Math.random() * CONTENT_TYPES.length)]
      
      // Find nearest CDN edge server
      const nearestEdge = CDN_REGIONS[Math.floor(Math.random() * CDN_REGIONS.length)]
      
      // Determine cache hit or miss
      const isCacheHit = content.cacheable && Math.random() > 0.3 && nearestEdge.cached.includes(content.type.toLowerCase())
      
      const request = {
        id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userRegion,
        content,
        targetEdge: nearestEdge,
        isCacheHit,
        timestamp: Date.now(),
        status: 'routing'
      }

      setActiveRequests(prev => [...prev.slice(-5), request])

      // Update statistics
      if (isCacheHit) {
        setCacheHits(prev => prev + 1)
        setBandwidthSaved(prev => prev + parseFloat(content.size))
      } else {
        setCacheMisses(prev => prev + 1)
      }

      // Update region stats
      setRegionStats(prev => ({
        ...prev,
        [nearestEdge.id]: {
          requests: (prev[nearestEdge.id]?.requests || 0) + 1,
          hits: (prev[nearestEdge.id]?.hits || 0) + (isCacheHit ? 1 : 0),
          bandwidth: (prev[nearestEdge.id]?.bandwidth || 0) + parseFloat(content.size)
        }
      }))

      // Update request status
      setTimeout(() => {
        setActiveRequests(prev =>
          prev.map(req =>
            req.id === request.id ? { ...req, status: 'serving' } : req
          )
        )

        // Remove request after serving
        setTimeout(() => {
          setActiveRequests(prev => prev.filter(req => req.id !== request.id))
        }, 1000)
      }, nearestEdge.latency * 20)

    }, 2000)

    return () => {
      if (animationRef.current) clearInterval(animationRef.current)
    }
  }, [isAnimating])

  const cacheHitRate = cacheHits + cacheMisses > 0 
    ? ((cacheHits / (cacheHits + cacheMisses)) * 100).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              Content Delivery Network
            </h3>
            <p className="text-sm text-white/70">
              Global edge server network for fast content delivery
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {showMetrics ? 'Hide' : 'Show'} Metrics
            </button>
            <button
              onClick={() => setPurgeCache(!purgeCache)}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Purge Cache
            </button>
          </div>
        </div>

        {/* Cache Strategy Selector */}
        <div className="mt-4 p-4 bg-black/30 rounded-xl">
          <h4 className="text-white font-semibold mb-3">Cache Strategy</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {CACHE_STRATEGIES.map((strategy) => (
              <button
                key={strategy.id}
                onClick={() => setSelectedStrategy(strategy.id)}
                className={`
                  p-4 rounded-xl text-left transition-all
                  ${selectedStrategy === strategy.id
                    ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-500/50'
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                  } border
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{strategy.icon}</span>
                  <span className="text-white font-medium">{strategy.name}</span>
                </div>
                <p className="text-xs text-white/60">{strategy.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {showMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">✅</span>
              <span className="text-xs text-green-400">HITS</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white">
              {cacheHits}
            </div>
            <div className="text-xs text-green-400 mt-1">Cache Hits</div>
          </div>

          <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-red-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">❌</span>
              <span className="text-xs text-red-400">MISSES</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white">
              {cacheMisses}
            </div>
            <div className="text-xs text-red-400 mt-1">Cache Misses</div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📊</span>
              <span className="text-xs text-blue-400">HIT RATE</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white">
              {cacheHitRate}%
            </div>
            <div className="text-xs text-blue-400 mt-1">Hit Rate</div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💾</span>
              <span className="text-xs text-purple-400">SAVED</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-white">
              {bandwidthSaved > 1000 ? `${(bandwidthSaved/1000).toFixed(1)} GB` : `${bandwidthSaved.toFixed(0)} MB`}
            </div>
            <div className="text-xs text-purple-400 mt-1">Bandwidth Saved</div>
          </div>
        </div>
      )}

      {/* Global CDN Map Visualization */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">Global Edge Network</h4>
        
        <div className="relative bg-black/30 rounded-xl p-8 min-h-[400px]">
          {/* Edge Servers */}
          {CDN_REGIONS.map((region) => (
            <div
              key={region.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ 
                left: `${region.coordinates.x}%`, 
                top: `${region.coordinates.y}%` 
              }}
              onClick={() => setSelectedRegion(region)}
            >
              {/* Server Icon with Animation */}
              <div className="relative group">
                <div className={`
                  w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center
                  transition-all duration-300 hover:scale-110
                  ${activeRequests.some(r => r.targetEdge.id === region.id)
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 animate-pulse shadow-lg shadow-green-500/50'
                    : 'bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg'
                  }
                `}>
                  <span className="text-2xl md:text-3xl">🖥️</span>
                </div>

                {/* Region Label */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className="bg-black/80 px-2 py-1 rounded text-xs text-white">
                    {region.name}
                  </div>
                </div>

                {/* Hover Info */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-black/90 rounded-lg p-3 text-xs text-white whitespace-nowrap">
                    <div className="font-semibold mb-1">{region.location}</div>
                    <div>Servers: {region.servers}</div>
                    <div>Load: {region.load}%</div>
                    <div>Latency: {region.latency}ms</div>
                  </div>
                </div>

                {/* Active Request Indicator */}
                {activeRequests.filter(r => r.targetEdge.id === region.id).map((req, index) => (
                  <div
                    key={req.id}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      animation: `ping 2s cubic-bezier(0, 0, 0.2, 1) ${index * 0.2}s`
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-green-400 opacity-75"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Request Paths */}
          {activeRequests.map((request) => (
            <div
              key={request.id}
              className="absolute pointer-events-none animate-fadeIn"
              style={{
                left: '50%',
                top: '10%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-3 py-1">
                <span className="text-xl">{request.content.icon}</span>
                <span className="text-xs text-yellow-400 font-mono">
                  {request.userRegion} → {request.targetEdge.name}
                </span>
                <span className={`
                  text-xs font-medium px-2 py-0.5 rounded
                  ${request.isCacheHit 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                  }
                `}>
                  {request.isCacheHit ? 'HIT' : 'MISS'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-600 to-purple-600"></div>
            <span>Edge Server</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500"></div>
            <span>Active Server</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">HIT</div>
            <span>Cache Hit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">MISS</div>
            <span>Cache Miss</span>
          </div>
        </div>
      </div>

      {/* Content Types Distribution */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">Content Types & Caching</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CONTENT_TYPES.map((content) => (
            <div
              key={content.type}
              onClick={() => setActiveContent(content)}
              className={`
                p-4 rounded-xl cursor-pointer transition-all
                ${activeContent?.type === content.type
                  ? 'bg-white/20 scale-105 shadow-lg'
                  : 'bg-white/5 hover:bg-white/10'
                }
              `}
            >
              <div className="text-3xl text-center mb-2">{content.icon}</div>
              <div className="text-white font-medium text-sm text-center">{content.type}</div>
              <div className="text-xs text-white/60 text-center mt-1">{content.size}</div>
              <div className="mt-2">
                <div className={`
                  h-1 rounded-full ${content.color} 
                  ${content.cacheable ? 'opacity-100' : 'opacity-30'}
                `}></div>
              </div>
              <div className="text-xs text-center mt-1">
                {content.cacheable ? (
                  <span className="text-green-400">Cacheable</span>
                ) : (
                  <span className="text-yellow-400">Dynamic</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {activeContent && (
          <div className="mt-4 p-4 bg-white/5 rounded-xl animate-fadeIn">
            <h5 className="text-white font-semibold mb-2">{activeContent.type} Caching Strategy</h5>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-white/60 mb-1">Cache Duration</div>
                <div className="text-white">
                  {activeContent.cacheable ? '7-30 days' : 'No cache (dynamic)'}
                </div>
              </div>
              <div>
                <div className="text-white/60 mb-1">Compression</div>
                <div className="text-white">
                  {['CSS', 'JavaScript', 'HTML'].includes(activeContent.type) ? 'Gzip/Brotli' : 'None'}
                </div>
              </div>
              <div>
                <div className="text-white/60 mb-1">Typical Size</div>
                <div className="text-white">{activeContent.size}</div>
              </div>
              <div>
                <div className="text-white/60 mb-1">Priority</div>
                <div className="text-white">
                  {activeContent.type === 'HTML' ? 'Critical' : 
                   activeContent.type === 'CSS' ? 'High' : 'Normal'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edge Server Details Modal */}
      {selectedRegion && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRegion(null)}
        >
          <div 
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedRegion.name}</h3>
                <p className="text-sm text-white/60">{selectedRegion.location}</p>
              </div>
              <button
                onClick={() => setSelectedRegion(null)}
                className="text-white/60 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/60 mb-1">Edge Servers</div>
                  <div className="text-2xl font-bold text-white">{selectedRegion.servers}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/60 mb-1">Current Load</div>
                  <div className="text-2xl font-bold text-white">{selectedRegion.load}%</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/60 mb-1">Avg Latency</div>
                  <div className="text-2xl font-bold text-white">{selectedRegion.latency}ms</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/60 mb-1">Total Requests</div>
                  <div className="text-2xl font-bold text-white">
                    {regionStats[selectedRegion.id]?.requests || 0}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Cached Content</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedRegion.cached.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm"
                    >
                      {type.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Performance Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Cache Hit Rate</span>
                    <span className="text-white">
                      {regionStats[selectedRegion.id] 
                        ? ((regionStats[selectedRegion.id].hits / regionStats[selectedRegion.id].requests * 100) || 0).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Bandwidth Served</span>
                    <span className="text-white">
                      {(regionStats[selectedRegion.id]?.bandwidth || 0).toFixed(1)} MB
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Availability</span>
                    <span className="text-green-400">99.99%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Educational Tips */}
      <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-indigo-500/30">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          CDN Best Practices
        </h4>
        
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="bg-black/30 rounded-xl p-4">
            <h5 className="text-white font-semibold mb-2">Cache Optimization</h5>
            <ul className="space-y-1 text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Set appropriate TTL values based on content type</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Use versioning for static assets to enable long caching</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Implement cache purging strategies for updated content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Implement cache purging strategies for updated content</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-black/30 rounded-xl p-4">
            <h5 className="text-white font-semibold mb-2">Performance Tips</h5>
            <ul className="space-y-1 text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Enable compression for text-based content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Use HTTP/2 or HTTP/3 for multiplexing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Implement smart routing based on user geography</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Monitor origin shield effectiveness</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CDN Benefits & Use Cases */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">Why Use a CDN?</h4>
        
        <div className="grid md:grid-cols-3 gap-4">
          {/* Performance */}
          <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h5 className="text-white font-semibold">Performance</h5>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Reduce latency by serving content from geographically closer servers. Faster load times improve user experience and SEO rankings.
            </p>
          </div>

          {/* Scalability */}
          <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h5 className="text-white font-semibold">Scalability</h5>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Handle traffic spikes and high loads without impacting origin servers. CDNs automatically scale to meet demand.
            </p>
          </div>

          {/* Security */}
          <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h5 className="text-white font-semibold">Security</h5>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Protection against DDoS attacks, Web Application Firewall (WAF), and SSL/TLS encryption at the edge.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Origin vs CDN Comparison */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">Origin Server vs CDN Performance</h4>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Without CDN */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-red-400">Without CDN</span>
            </h5>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Average Latency</span>
                <span className="text-red-400 font-mono">250-500ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Origin Load</span>
                <span className="text-red-400 font-mono">100%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Bandwidth Cost</span>
                <span className="text-red-400 font-mono">High</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Global Performance</span>
                <span className="text-red-400 font-mono">Poor</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">DDoS Protection</span>
                <span className="text-red-400 font-mono">Limited</span>
              </div>
            </div>
          </div>

          {/* With CDN */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
            <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-green-400">With CDN</span>
            </h5>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Average Latency</span>
                <span className="text-green-400 font-mono">10-50ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Origin Load</span>
                <span className="text-green-400 font-mono">10-30%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Bandwidth Cost</span>
                <span className="text-green-400 font-mono">Optimized</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Global Performance</span>
                <span className="text-green-400 font-mono">Excellent</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">DDoS Protection</span>
                <span className="text-green-400 font-mono">Advanced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Comparison Bar */}
        <div className="mt-6 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/70">Page Load Time Improvement</span>
              <span className="text-green-400">80% faster</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-2">
              <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full" 
                   style={{ width: '80%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quiz */}
      <CDNQuiz />
    </div>
  )
}

// CDN Quiz Component
function CDNQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState(0)

  const questions = [
    {
      question: "What is the primary benefit of using a CDN?",
      options: [
        "Increased server storage",
        "Reduced latency and faster content delivery",
        "Better code compilation",
        "More database connections"
      ],
      correct: 1,
      explanation: "CDNs reduce latency by serving content from geographically distributed edge servers closer to users."
    },
    {
      question: "Which type of content benefits most from CDN caching?",
      options: [
        "User-specific dynamic content",
        "Database queries",
        "Static assets (images, CSS, JS)",
        "Real-time chat messages"
      ],
      correct: 2,
      explanation: "Static assets are ideal for CDN caching as they don't change frequently and can be served from edge locations."
    },
    {
      question: "What happens during a 'cache miss' in a CDN?",
      options: [
        "The request fails",
        "CDN fetches content from origin server",
        "User is redirected to origin",
        "Content is deleted"
      ],
      correct: 1,
      explanation: "During a cache miss, the CDN fetches the content from the origin server, caches it, and serves it to the user."
    }
  ]

  const handleAnswer = (index) => {
    if (index === questions[currentQuestion].correct) {
      setScore(score + 1)
    }
    setShowAnswer(true)
  }

  const nextQuestion = () => {
    setShowAnswer(false)
    setCurrentQuestion((prev) => (prev + 1) % questions.length)
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-indigo-500/30">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-white">Test Your CDN Knowledge</h4>
        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-sm rounded-full">
          Score: {score}/{questions.length}
        </span>
      </div>

      <div className="bg-black/30 rounded-xl p-4">
        <p className="text-white mb-4">{questions[currentQuestion].question}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showAnswer}
              className={`
                p-3 rounded-lg text-sm font-medium transition-all text-left
                ${showAnswer 
                  ? index === questions[currentQuestion].correct
                    ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                    : 'bg-red-500/20 text-red-400/50 border border-red-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }
              `}
            >
              {option}
            </button>
          ))}
        </div>

        {showAnswer && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4 animate-fadeIn">
            <p className="text-sm text-blue-400">{questions[currentQuestion].explanation}</p>
          </div>
        )}

        {showAnswer && (
          <button
            onClick={nextQuestion}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all"
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  )
}

export default CDNNetworkIndicator