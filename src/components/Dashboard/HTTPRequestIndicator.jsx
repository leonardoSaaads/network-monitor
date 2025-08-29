import { useState, useEffect, useRef } from 'react'

// HTTP Methods
const HTTP_METHODS = [
  { method: 'GET', color: 'bg-green-500', description: 'Retrieve data from server' },
  { method: 'POST', color: 'bg-blue-500', description: 'Send data to server' },
  { method: 'PUT', color: 'bg-yellow-500', description: 'Update entire resource' },
  { method: 'PATCH', color: 'bg-orange-500', description: 'Partial update' },
  { method: 'DELETE', color: 'bg-red-500', description: 'Remove resource' },
  { method: 'HEAD', color: 'bg-purple-500', description: 'Get headers only' },
  { method: 'OPTIONS', color: 'bg-pink-500', description: 'Get allowed methods' }
]

// Common Status Codes
const STATUS_CODES = {
  '1xx': [
    { code: 100, name: 'Continue', description: 'Request received, continue' },
    { code: 101, name: 'Switching Protocols', description: 'Switching to new protocol' }
  ],
  '2xx': [
    { code: 200, name: 'OK', description: 'Request succeeded' },
    { code: 201, name: 'Created', description: 'Resource created' },
    { code: 204, name: 'No Content', description: 'Success, no content to return' }
  ],
  '3xx': [
    { code: 301, name: 'Moved Permanently', description: 'Resource moved permanently' },
    { code: 302, name: 'Found', description: 'Resource temporarily moved' },
    { code: 304, name: 'Not Modified', description: 'Cached version is valid' }
  ],
  '4xx': [
    { code: 400, name: 'Bad Request', description: 'Invalid request syntax' },
    { code: 401, name: 'Unauthorized', description: 'Authentication required' },
    { code: 403, name: 'Forbidden', description: 'Access denied' },
    { code: 404, name: 'Not Found', description: 'Resource not found' },
    { code: 429, name: 'Too Many Requests', description: 'Rate limit exceeded' }
  ],
  '5xx': [
    { code: 500, name: 'Internal Server Error', description: 'Server error' },
    { code: 502, name: 'Bad Gateway', description: 'Invalid gateway response' },
    { code: 503, name: 'Service Unavailable', description: 'Server temporarily unavailable' }
  ]
}

// Request/Response Cycle Steps
const REQUEST_CYCLE = [
  {
    id: 1,
    phase: 'DNS Lookup',
    description: 'Resolve domain to IP address',
    duration: 50,
    details: {
      from: 'Browser DNS Cache',
      to: 'DNS Server',
      data: 'example.com → 93.184.216.34'
    }
  },
  {
    id: 2,
    phase: 'TCP Connection',
    description: 'Establish TCP connection (3-way handshake)',
    duration: 100,
    details: {
      from: 'Client',
      to: 'Server',
      data: 'SYN → SYN-ACK → ACK'
    }
  },
  {
    id: 3,
    phase: 'TLS Handshake',
    description: 'Establish secure connection (HTTPS)',
    duration: 150,
    details: {
      from: 'Client',
      to: 'Server',
      data: 'Certificate exchange & verification'
    }
  },
  {
    id: 4,
    phase: 'Send Request',
    description: 'Send HTTP request to server',
    duration: 50,
    details: {
      from: 'Client',
      to: 'Server',
      data: 'Headers + Body'
    }
  },
  {
    id: 5,
    phase: 'Server Processing',
    description: 'Server processes the request',
    duration: 200,
    details: {
      from: 'Server',
      to: 'Backend',
      data: 'Database queries, computations'
    }
  },
  {
    id: 6,
    phase: 'Send Response',
    description: 'Server sends response back',
    duration: 100,
    details: {
      from: 'Server',
      to: 'Client',
      data: 'Status + Headers + Body'
    }
  },
  {
    id: 7,
    phase: 'Client Processing',
    description: 'Browser renders the response',
    duration: 150,
    details: {
      from: 'Browser',
      to: 'DOM',
      data: 'Parse HTML, CSS, JavaScript'
    }
  }
]

// Sample Headers
const COMMON_HEADERS = {
  request: [
    { name: 'Host', value: 'example.com', description: 'Target host' },
    { name: 'User-Agent', value: 'Mozilla/5.0...', description: 'Browser identification' },
    { name: 'Accept', value: 'text/html,application/json', description: 'Accepted content types' },
    { name: 'Authorization', value: 'Bearer token...', description: 'Authentication credentials' },
    { name: 'Content-Type', value: 'application/json', description: 'Request body format' },
    { name: 'Cookie', value: 'session=abc123', description: 'Client cookies' }
  ],
  response: [
    { name: 'Content-Type', value: 'application/json', description: 'Response format' },
    { name: 'Content-Length', value: '1234', description: 'Response size in bytes' },
    { name: 'Cache-Control', value: 'max-age=3600', description: 'Caching directives' },
    { name: 'Set-Cookie', value: 'session=xyz789', description: 'Set client cookie' },
    { name: 'X-Rate-Limit', value: '100', description: 'API rate limit' },
    { name: 'Server', value: 'nginx/1.18.0', description: 'Server software' }
  ]
}

function HTTPRequestIndicator({ isAnimating }) {
  const [selectedMethod, setSelectedMethod] = useState('GET')
  const [currentStep, setCurrentStep] = useState(0)
  const [showHeaders, setShowHeaders] = useState(false)
  const [selectedStatusCategory, setSelectedStatusCategory] = useState('2xx')
  const [requestData, setRequestData] = useState({
    url: 'https://api.example.com/users/123',
    method: 'GET',
    headers: {},
    body: null
  })
  const [responseData, setResponseData] = useState(null)
  const [showTimeline, setShowTimeline] = useState(true)
  const [activeTab, setActiveTab] = useState('request')
  const animationRef = useRef(null)

  useEffect(() => {
    if (!isAnimating) {
      setCurrentStep(0)
      setResponseData(null)
      return
    }

    let stepIndex = 0
    animationRef.current = setInterval(() => {
      if (stepIndex < REQUEST_CYCLE.length) {
        setCurrentStep(stepIndex)
        
        // Simulate response when reaching server processing
        if (stepIndex === 5) {
          setTimeout(() => {
            setResponseData({
              status: 200,
              statusText: 'OK',
              headers: COMMON_HEADERS.response,
              body: {
                id: 123,
                name: 'John Doe',
                email: 'john@example.com'
              },
              time: REQUEST_CYCLE.reduce((acc, step, idx) => 
                idx <= stepIndex ? acc + step.duration : acc, 0
              )
            })
          }, 500)
        }
        
        stepIndex++
      } else {
        stepIndex = 0
        setResponseData(null)
      }
    }, 1500)

    return () => {
      if (animationRef.current) clearInterval(animationRef.current)
    }
  }, [isAnimating])

  const currentMethod = HTTP_METHODS.find(m => m.method === selectedMethod)

  return (
    <div className="space-y-6">
      {/* Header with Method Selector */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              HTTP Request/Response Cycle
            </h3>
            <p className="text-sm text-white/70">
              Understanding how HTTP requests work from client to server
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowHeaders(!showHeaders)}
              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {showHeaders ? 'Hide' : 'Show'} Headers
            </button>
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showTimeline ? 'Hide' : 'Show'} Timeline
            </button>
          </div>
        </div>

        {/* HTTP Method Selection */}
        <div className="mt-4">
          <h4 className="text-white font-semibold mb-3">HTTP Methods</h4>
          <div className="flex flex-wrap gap-2">
            {HTTP_METHODS.map((method) => (
              <button
                key={method.method}
                onClick={() => setSelectedMethod(method.method)}
                className={`
                  px-4 py-2 rounded-lg transition-all font-mono text-sm
                  ${selectedMethod === method.method
                    ? `${method.color} text-white shadow-lg scale-105`
                    : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                  }
                `}
              >
                {method.method}
              </button>
            ))}
          </div>
          {currentMethod && (
            <p className="mt-2 text-xs text-white/60">{currentMethod.description}</p>
          )}
        </div>
      </div>

      {/* Request Builder & Response Viewer */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('request')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === 'request'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
              }
            `}
          >
            Request
          </button>
          <button
            onClick={() => setActiveTab('response')}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeTab === 'response'
                ? 'bg-green-600 text-white'
                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
              }
            `}
          >
            Response
          </button>
        </div>

        {/* Request Tab */}
        {activeTab === 'request' && (
          <div className="space-y-4 animate-fadeIn">
            {/* URL Bar */}
            <div className="flex gap-2">
              <div className={`px-3 py-2 rounded-lg font-mono text-sm ${currentMethod?.color} text-white`}>
                {selectedMethod}
              </div>
              <div className="flex-1 bg-black/30 rounded-lg px-4 py-2">
                <input
                  type="text"
                  value={requestData.url}
                  onChange={(e) => setRequestData({ ...requestData, url: e.target.value })}
                  className="w-full bg-transparent text-white text-sm font-mono outline-none"
                  placeholder="Enter URL..."
                />
              </div>
            </div>

            {/* Headers */}
            {showHeaders && (
              <div className="bg-black/30 rounded-xl p-4">
                <h5 className="text-white font-semibold mb-3">Request Headers</h5>
                <div className="space-y-2">
                  {COMMON_HEADERS.request.map((header) => (
                    <div key={header.name} className="flex items-center gap-2 text-xs">
                      <span className="text-cyan-400 font-mono w-32">{header.name}:</span>
                      <span className="text-white/70 font-mono flex-1">{header.value}</span>
                      <span className="text-white/40 text-xs">{header.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Request Body (for POST/PUT) */}
            {['POST', 'PUT', 'PATCH'].includes(selectedMethod) && (
              <div className="bg-black/30 rounded-xl p-4">
                <h5 className="text-white font-semibold mb-3">Request Body</h5>
                <pre className="text-xs text-green-400 font-mono">
{JSON.stringify({
  name: "John Doe",
  email: "john@example.com",
  role: "admin"
}, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Response Tab */}
        {activeTab === 'response' && (
          <div className="space-y-4 animate-fadeIn">
            {responseData ? (
              <>
                {/* Status Line */}
                <div className="flex items-center gap-4">
                  <div className={`
                    px-3 py-2 rounded-lg font-mono text-sm
                    ${responseData.status < 300 ? 'bg-green-600' : 
                      responseData.status < 400 ? 'bg-yellow-600' :
                      responseData.status < 500 ? 'bg-orange-600' : 'bg-red-600'
                    } text-white
                  `}>
                    {responseData.status} {responseData.statusText}
                  </div>
                  <span className="text-white/60 text-sm">
                    Time: {responseData.time}ms
                  </span>
                </div>

                {/* Response Headers */}
                {showHeaders && (
                  <div className="bg-black/30 rounded-xl p-4">
                    <h5 className="text-white font-semibold mb-3">Response Headers</h5>
                    <div className="space-y-2">
                      {responseData.headers.map((header) => (
                        <div key={header.name} className="flex items-center gap-2 text-xs">
                          <span className="text-green-400 font-mono w-32">{header.name}:</span>
                          <span className="text-white/70 font-mono flex-1">{header.value}</span>
                          <span className="text-white/40 text-xs">{header.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Response Body */}
                <div className="bg-black/30 rounded-xl p-4">
                  <h5 className="text-white font-semibold mb-3">Response Body</h5>
                  <pre className="text-xs text-green-400 font-mono">
{JSON.stringify(responseData.body, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-white/40">
                <div className="text-4xl mb-4">📭</div>
                <p>No response yet. Start the simulation to see the response.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Request/Response Timeline */}
      {showTimeline && (
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
          <h4 className="text-lg font-semibold text-white mb-4">Request Timeline</h4>
          
          <div className="relative">
            <div className="absolute left-8 md:left-16 top-0 bottom-0 w-0.5 bg-white/10"></div>
            
            <div className="space-y-6">
              {REQUEST_CYCLE.map((step, index) => {
                const isActive = currentStep === index
                const isPast = currentStep > index
                
                return (
                  <div
                    key={step.id}
                    className={`
                      relative flex items-start gap-4 transition-all duration-500
                      ${isActive ? 'scale-105' : isPast ? 'opacity-70' : 'opacity-30'}
                    `}
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-8 md:left-16 w-4 h-4 -translate-x-1/2">
                      <div className={`
                        w-4 h-4 rounded-full border-2 transition-all
                        ${isActive ? 'bg-blue-500 border-blue-400 animate-pulse scale-150' :
                          isPast ? 'bg-green-500 border-green-400' :
                          'bg-gray-700 border-gray-600'}
                      `}></div>
                    </div>
                    
                    {/* Step Content */}
                    <div className="ml-16 md:ml-24 flex-1">
                      <div className={`
                        p-4 rounded-xl transition-all
                        ${isActive ? 'bg-blue-900/30 border-blue-500/50' :
                          isPast ? 'bg-green-900/20 border-green-500/30' :
                          'bg-white/5 border-white/10'}
                        border
                      `}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="text-white font-semibold">{step.phase}</h5>
                            <p className="text-xs text-white/60 mt-1">{step.description}</p>
                          </div>
                          <span className="text-xs text-white/40 font-mono">{step.duration}ms</span>
                        </div>
                        
                        {isActive && step.details && (
                          <div className="mt-3 pt-3 border-t border-white/10 text-xs animate-fadeIn">
                            <div className="grid grid-cols-3 gap-2 text-white/70">
                              <div>
                                <span className="text-white/40">From:</span> {step.details.from}
                              </div>
                              <div>
                                <span className="text-white/40">To:</span> {step.details.to}
                              </div>
                              <div>
                                <span className="text-white/40">Data:</span> {step.details.data}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Total Time */}
            {currentStep > 0 && (
              <div className="mt-6 ml-16 md:ml-24">
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 border border-blue-500/30">
                  <span className="text-white/60 text-sm">Total Time: </span>
                  <span className="text-white font-mono font-semibold">
                    {REQUEST_CYCLE.slice(0, currentStep + 1).reduce((acc, step) => acc + step.duration, 0)}ms
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Codes Reference */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">HTTP Status Codes</h4>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(STATUS_CODES).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedStatusCategory(category)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${selectedStatusCategory === category
                  ? category === '2xx' ? 'bg-green-600 text-white' :
                    category === '3xx' ? 'bg-blue-600 text-white' :
                    category === '4xx' ? 'bg-yellow-600 text-white' :
                    category === '5xx' ? 'bg-red-600 text-white' :
                    'bg-gray-600 text-white'
                  : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                }
              `}
            >
              {category} {
                category === '1xx' ? 'Info' :
                category === '2xx' ? 'Success' :
                category === '3xx' ? 'Redirect' :
                category === '4xx' ? 'Client Error' :
                'Server Error'
              }
            </button>
          ))}
        </div>

        {/* Status Code List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {STATUS_CODES[selectedStatusCategory].map((status) => (
            <div
              key={status.code}
              className="bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`
                  text-lg font-bold font-mono
                  ${selectedStatusCategory === '2xx' ? 'text-green-400' :
                    selectedStatusCategory === '3xx' ? 'text-blue-400' :
                    selectedStatusCategory === '4xx' ? 'text-yellow-400' :
                    selectedStatusCategory === '5xx' ? 'text-red-400' :
                    'text-gray-400'}
                `}>
                  {status.code}
                </span>
                <span className="text-white font-medium">{status.name}</span>
              </div>
              <p className="text-xs text-white/60">{status.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-indigo-500/30">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          HTTP Best Practices
        </h4>
        
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="bg-black/30 rounded-xl p-4">
            <h5 className="text-white font-semibold mb-2">Performance Tips</h5>
            <ul className="space-y-1 text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Use HTTP/2 or HTTP/3 for multiplexing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Enable compression (gzip/brotli)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Implement proper caching headers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Use CDN for static assets</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-black/30 rounded-xl p-4">
            <h5 className="text-white font-semibold mb-2">Security Guidelines</h5>
            <ul className="space-y-1 text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Always use HTTPS in production</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Implement CORS properly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Validate and sanitize inputs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Use security headers (CSP, HSTS)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HTTPRequestIndicator