import { useState, useEffect, useRef } from 'react'

// VPN Protocols
const VPN_PROTOCOLS = [
  {
    id: 'openvpn',
    name: 'OpenVPN',
    port: '1194',
    security: 'High',
    speed: 'Moderate',
    description: 'Open-source, highly configurable, uses SSL/TLS',
    encryption: 'AES-256',
    color: 'bg-green-500'
  },
  {
    id: 'wireguard',
    name: 'WireGuard',
    port: '51820',
    security: 'Very High',
    speed: 'Fast',
    description: 'Modern, lightweight, uses ChaCha20',
    encryption: 'ChaCha20-Poly1305',
    color: 'bg-blue-500'
  },
  {
    id: 'ikev2',
    name: 'IKEv2/IPSec',
    port: '500/4500',
    security: 'High',
    speed: 'Fast',
    description: 'Stable, good for mobile, automatic reconnection',
    encryption: 'AES-256',
    color: 'bg-purple-500'
  },
  {
    id: 'l2tp',
    name: 'L2TP/IPSec',
    port: '1701',
    security: 'Moderate',
    speed: 'Slow',
    description: 'Widely supported, double encapsulation',
    encryption: 'AES-256',
    color: 'bg-orange-500'
  }
]

// Encryption Process Steps
const ENCRYPTION_STEPS = [
  {
    id: 1,
    phase: 'Original Data',
    description: 'Your unencrypted data packet',
    icon: '📄',
    data: {
      content: 'GET /page HTTP/1.1',
      ip: '192.168.1.100',
      destination: 'example.com'
    }
  },
  {
    id: 2,
    phase: 'Encryption',
    description: 'Data is encrypted using protocol cipher',
    icon: '🔐',
    data: {
      content: 'Xy#9@kL$mN...',
      encrypted: true
    }
  },
  {
    id: 3,
    phase: 'Encapsulation',
    description: 'Encrypted data wrapped in VPN packet',
    icon: '📦',
    data: {
      vpnHeader: 'VPN Protocol Header',
      payload: 'Encrypted Data',
      vpnIp: '10.8.0.2'
    }
  },
  {
    id: 4,
    phase: 'Tunnel Transit',
    description: 'Packet travels through secure tunnel',
    icon: '🚇',
    data: {
      source: 'Your Device',
      destination: 'VPN Server',
      protection: 'ISP cannot read'
    }
  },
  {
    id: 5,
    phase: 'Decryption',
    description: 'VPN server decrypts the data',
    icon: '🔓',
    data: {
      content: 'GET /page HTTP/1.1',
      decrypted: true
    }
  },
  {
    id: 6,
    phase: 'Forward to Destination',
    description: 'Data sent to final destination',
    icon: '🎯',
    data: {
      from: 'VPN Server IP',
      to: 'example.com',
      original: 'Your IP hidden'
    }
  }
]

// Common VPN Use Cases
const USE_CASES = [
  { id: 'privacy', name: 'Privacy Protection', icon: '🔒', description: 'Hide your IP and browsing activity' },
  { id: 'geo', name: 'Bypass Geo-blocks', icon: '🌍', description: 'Access region-locked content' },
  { id: 'public', name: 'Public WiFi Security', icon: '📶', description: 'Secure connection on untrusted networks' },
  { id: 'remote', name: 'Remote Work', icon: '💼', description: 'Secure access to company resources' },
  { id: 'censorship', name: 'Bypass Censorship', icon: '🛡️', description: 'Access blocked websites and services' }
]

function VPNTunnelIndicator({ isAnimating }) {
  const [selectedProtocol, setSelectedProtocol] = useState('wireguard')
  const [currentStep, setCurrentStep] = useState(0)
  const [dataPackets, setDataPackets] = useState([])
  const [showThreatSimulation, setShowThreatSimulation] = useState(false)
  const [tunnelActive, setTunnelActive] = useState(false)
  const [selectedUseCase, setSelectedUseCase] = useState(null)
  const [showComparison, setShowComparison] = useState(false)
  const animationRef = useRef(null)

  useEffect(() => {
    if (!isAnimating) {
      setCurrentStep(0)
      setDataPackets([])
      setTunnelActive(false)
      return
    }

    setTunnelActive(true)
    let stepIndex = 0

    animationRef.current = setInterval(() => {
      if (stepIndex < ENCRYPTION_STEPS.length) {
        setCurrentStep(stepIndex)
        
        // Simulate data packets
        if (stepIndex % 2 === 0) {
          const packet = {
            id: Date.now(),
            encrypted: stepIndex >= 2 && stepIndex < 5,
            position: stepIndex,
            content: stepIndex < 2 ? 'Plain Text' : 'Encrypted'
          }
          setDataPackets(prev => [...prev.slice(-3), packet])
        }
        
        stepIndex++
      } else {
        stepIndex = 0
      }
    }, 2000)

    return () => {
      if (animationRef.current) clearInterval(animationRef.current)
    }
  }, [isAnimating])

  const currentProtocol = VPN_PROTOCOLS.find(p => p.id === selectedProtocol)

  return (
    <div className="space-y-6">
      {/* Header with Protocol Selector */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">VPN Tunnel Visualization</h3>
            <p className="text-sm text-white/70">
              Understanding how VPN creates secure, encrypted connections
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowThreatSimulation(!showThreatSimulation)}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <span>👁️</span>
              {showThreatSimulation ? 'Hide' : 'Show'} Threats
            </button>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <span>📊</span>
              Compare VPN vs No VPN
            </button>
          </div>
        </div>

        {/* Protocol Selection */}
        <div className="mt-4">
          <h4 className="text-white font-semibold mb-3">Select VPN Protocol</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {VPN_PROTOCOLS.map((protocol) => (
              <button
                key={protocol.id}
                onClick={() => setSelectedProtocol(protocol.id)}
                className={`
                  p-3 rounded-xl transition-all
                  ${selectedProtocol === protocol.id
                    ? 'bg-gradient-to-br from-cyan-600/30 to-blue-600/30 border-cyan-500/50 scale-105'
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                  } border
                `}
              >
                <div className="text-white font-medium text-sm">{protocol.name}</div>
                <div className="text-xs text-white/60 mt-1">Port: {protocol.port}</div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-green-400">🔒 {protocol.security}</span>
                  <span className="text-xs text-blue-400">⚡ {protocol.speed}</span>
                </div>
              </button>
            ))}
          </div>

          {currentProtocol && (
            <div className="mt-4 p-4 bg-white/5 rounded-xl animate-fadeIn">
              <h5 className="text-white font-semibold mb-2">{currentProtocol.name} Details</h5>
              <p className="text-sm text-white/70 mb-2">{currentProtocol.description}</p>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-white/60">Encryption:</span>
                <span className="text-cyan-400 font-mono">{currentProtocol.encryption}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Tunnel Visualization */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">Secure Tunnel Connection</h4>
        
        <div className="relative bg-black/30 rounded-xl p-6 md:p-8 min-h-[300px]">
          {/* Connection Flow */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Your Device */}
            <div className="text-center">
              <div className={`
                w-24 h-24 mx-auto mb-3 rounded-2xl flex items-center justify-center
                ${tunnelActive ? 'bg-gradient-to-br from-green-600 to-emerald-600 animate-pulse' : 'bg-gray-700'}
                transition-all duration-500
              `}>
                <span className="text-4xl">💻</span>
              </div>
              <div className="text-white font-medium">Your Device</div>
              <div className="text-xs text-white/60 mt-1">Real IP: 192.168.1.100</div>
              {tunnelActive && (
                <div className="text-xs text-green-400 mt-1 animate-fadeIn">Protected ✓</div>
              )}
            </div>

            {/* Tunnel Visualization */}
            <div className="flex-1 relative">
              <div className="relative h-20 md:h-24">
                {/* Tunnel Background */}
                <div className={`
                  absolute inset-0 rounded-full
                  ${tunnelActive 
                    ? 'bg-gradient-to-r from-cyan-600/20 via-blue-600/30 to-purple-600/20 animate-pulse' 
                    : 'bg-gray-800/50'
                  }
                `}>
                  <div className="absolute inset-2 rounded-full bg-black/50 flex items-center justify-center">
                    <span className="text-white/60 text-sm font-medium">
                      {tunnelActive ? 'Encrypted Tunnel' : 'No Protection'}
                    </span>
                  </div>
                </div>

                {/* Data Packets Animation */}
                {tunnelActive && dataPackets.map((packet) => (
                  <div
                    key={packet.id}
                    className="absolute top-1/2 -translate-y-1/2 animate-slide"
                    style={{
                      left: `${packet.position * 21}%`,
                      animation: 'slide 3s linear'
                    }}
                  >
                    <div className={`
                      px-2 py-1 rounded text-xs font-mono
                      ${packet.encrypted 
                        ? 'bg-green-500/30 text-green-400 border border-green-500/50' 
                        : 'bg-red-500/30 text-red-400 border border-red-500/50'
                      }
                    `}>
                      {packet.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Threat Indicators */}
              {showThreatSimulation && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-fadeIn">
                  <div className="bg-red-900/30 border border-red-500/50 rounded-lg px-3 py-1 text-xs text-red-400">
                    <span className="mr-2">👁️</span>
                    {tunnelActive ? 'ISP/Hackers see: Encrypted Traffic' : 'ISP/Hackers see: ALL Your Data!'}
                  </div>
                </div>
              )}
            </div>

            {/* VPN Server */}
            <div className="text-center">
              <div className={`
                w-24 h-24 mx-auto mb-3 rounded-2xl flex items-center justify-center
                ${tunnelActive ? 'bg-gradient-to-br from-blue-600 to-purple-600 animate-pulse' : 'bg-gray-700'}
                transition-all duration-500
              `}>
                <span className="text-4xl">🖥️</span>
              </div>
              <div className="text-white font-medium">VPN Server</div>
              <div className="text-xs text-white/60 mt-1">VPN IP: 45.67.89.123</div>
              {tunnelActive && (
                <div className="text-xs text-blue-400 mt-1 animate-fadeIn">Active ✓</div>
              )}
            </div>

            {/* Internet */}
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <span className="text-4xl">🌐</span>
              </div>
              <div className="text-white font-medium">Internet</div>
              <div className="text-xs text-white/60 mt-1">Destination Server</div>
            </div>
          </div>
        </div>
      </div>

      {/* Encryption Process Steps */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">How VPN Encryption Works</h4>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ENCRYPTION_STEPS.map((step, index) => {
            const isActive = currentStep === index
            const isPast = currentStep > index
            
            return (
              <div
                key={step.id}
                className={`
                  p-4 rounded-xl transition-all duration-500
                  ${isActive 
                    ? 'bg-gradient-to-br from-cyan-600/30 to-blue-600/30 border-cyan-500/50 scale-105 shadow-lg' 
                    : isPast
                    ? 'bg-green-900/20 border-green-500/30 opacity-70'
                    : 'bg-white/5 border-white/10 opacity-50'
                  } border
                `}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{step.icon}</span>
                  <div>
                    <div className="text-white font-medium text-sm">{step.phase}</div>
                    <div className="text-xs text-white/60">{step.description}</div>
                  </div>
                </div>
                
                {isActive && step.data && (
                  <div className="bg-black/30 rounded-lg p-3 text-xs font-mono animate-fadeIn">
                    {Object.entries(step.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between mb-1">
                        <span className="text-white/60">{key}:</span>
                        <span className={typeof value === 'boolean' && value ? 'text-green-400' : 'text-cyan-400'}>
                          {typeof value === 'boolean' ? (value ? '✓' : '✗') : value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* VPN vs No VPN Comparison */}
      {showComparison && (
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10 animate-fadeIn">
          <h4 className="text-lg font-semibold text-white mb-4">With vs Without VPN</h4>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Without VPN */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
              <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-red-400">❌</span>
                Without VPN
              </h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-white/70">ISP can see all your browsing activity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-white/70">Websites see your real IP address</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-white/70">Vulnerable on public WiFi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-white/70">Geo-restrictions apply</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-white/70">Data can be intercepted</span>
                </li>
              </ul>
            </div>

            {/* With VPN */}
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
              <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span className="text-green-400">✅</span>
                With VPN
              </h5>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span className="text-white/70">ISP only sees encrypted traffic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span className="text-white/70">Websites see VPN server IP</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span className="text-white/70">Secure on any network</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span className="text-white/70">Access geo-blocked content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span className="text-white/70">Military-grade encryption</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Common Use Cases */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">Common VPN Use Cases</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {USE_CASES.map((useCase) => (
            <button
              key={useCase.id}
              onClick={() => setSelectedUseCase(useCase)}
              className={`
                p-4 rounded-xl transition-all
                ${selectedUseCase?.id === useCase.id
                  ? 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-500/50 scale-105'
                  : 'bg-white/5 hover:bg-white/10 border-white/10'
                } border
              `}
            >
              <div className="text-3xl mb-2">{useCase.icon}</div>
              <div className="text-white font-medium text-sm">{useCase.name}</div>
              <div className="text-xs text-white/60 mt-1">{useCase.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Educational Tips */}
      <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-indigo-500/30">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          VPN Security Tips
        </h4>
        
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="bg-black/30 rounded-xl p-4">
            <h5 className="text-white font-semibold mb-2">Best Practices</h5>
            <ul className="space-y-1 text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Always use VPN on public WiFi</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Choose servers close to your location for speed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Enable kill switch to prevent data leaks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Use split tunneling for local services</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-black/30 rounded-xl p-4">
            <h5 className="text-white font-semibold mb-2">Things to Avoid</h5>
            <ul className="space-y-1 text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Free VPNs (may sell your data)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Outdated protocols (PPTP)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>VPNs without no-logs policy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Ignoring DNS leak protection</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VPNTunnelIndicator