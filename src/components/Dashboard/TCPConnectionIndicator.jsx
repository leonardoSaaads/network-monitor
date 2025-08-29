import { useState, useEffect, useRef } from 'react'

// TCP States based on RFC 793
const TCP_STATES = {
  CLOSED: 'CLOSED',
  LISTEN: 'LISTEN',
  SYN_SENT: 'SYN-SENT',
  SYN_RECEIVED: 'SYN-RECEIVED',
  ESTABLISHED: 'ESTABLISHED',
  FIN_WAIT_1: 'FIN-WAIT-1',
  FIN_WAIT_2: 'FIN-WAIT-2',
  CLOSE_WAIT: 'CLOSE-WAIT',
  CLOSING: 'CLOSING',
  LAST_ACK: 'LAST-ACK',
  TIME_WAIT: 'TIME-WAIT'
}

// Handshake steps with detailed information
const HANDSHAKE_STEPS = [
  {
    id: 1,
    phase: 'Initial State',
    client: { state: TCP_STATES.CLOSED, action: 'Application requests connection' },
    server: { state: TCP_STATES.LISTEN, action: 'Waiting for connections' },
    packet: null,
    description: 'Server is listening on a specific port, waiting for client connections. Client is initially closed.',
    details: {
      title: 'Initial State',
      content: 'Before any connection attempt, the server must be in LISTEN state (passive open) while the client starts in CLOSED state. The server binds to a specific port and waits for incoming connections.',
      flags: [],
      important: 'The server must be listening before the client attempts to connect.'
    }
  },
  {
    id: 2,
    phase: 'SYN',
    client: { state: TCP_STATES.SYN_SENT, action: 'Sends SYN packet' },
    server: { state: TCP_STATES.LISTEN, action: 'Receives SYN' },
    packet: { 
      type: 'SYN', 
      seq: 1000, 
      ack: 0, 
      flags: ['SYN'],
      window: 65535,
      options: ['MSS=1460', 'SACK_PERM', 'WS=7']
    },
    description: 'Client initiates connection by sending SYN (synchronize) packet with initial sequence number.',
    details: {
      title: 'SYN Packet - Connection Initiation',
      content: 'The client sends a SYN packet to initiate the connection. This packet contains the Initial Sequence Number (ISN), window size, and TCP options like Maximum Segment Size (MSS).',
      flags: ['SYN'],
      important: 'The ISN is randomly generated for security reasons to prevent sequence number prediction attacks.'
    }
  },
  {
    id: 3,
    phase: 'SYN-ACK',
    client: { state: TCP_STATES.SYN_SENT, action: 'Receives SYN-ACK' },
    server: { state: TCP_STATES.SYN_RECEIVED, action: 'Sends SYN-ACK' },
    packet: { 
      type: 'SYN-ACK', 
      seq: 3000, 
      ack: 1001, 
      flags: ['SYN', 'ACK'],
      window: 65535,
      options: ['MSS=1460', 'SACK_PERM', 'WS=8']
    },
    description: 'Server acknowledges client SYN and sends its own SYN with sequence number.',
    details: {
      title: 'SYN-ACK Packet - Server Response',
      content: 'Server responds with SYN-ACK packet. The ACK number is client\'s ISN + 1, confirming receipt. Server also sends its own ISN and TCP options.',
      flags: ['SYN', 'ACK'],
      important: 'The server allocates resources for this half-open connection, making it vulnerable to SYN flood attacks.'
    }
  },
  {
    id: 4,
    phase: 'ACK',
    client: { state: TCP_STATES.ESTABLISHED, action: 'Sends ACK' },
    server: { state: TCP_STATES.SYN_RECEIVED, action: 'Receives ACK' },
    packet: { 
      type: 'ACK', 
      seq: 1001, 
      ack: 3001, 
      flags: ['ACK'],
      window: 65535,
      options: []
    },
    description: 'Client acknowledges server SYN, completing the three-way handshake.',
    details: {
      title: 'ACK Packet - Connection Established',
      content: 'Client sends final ACK to complete the handshake. The connection is now ESTABLISHED on both ends. Both sides can now send data.',
      flags: ['ACK'],
      important: 'After this step, the connection is fully established and bidirectional data transfer can begin.'
    }
  },
  {
    id: 5,
    phase: 'Established',
    client: { state: TCP_STATES.ESTABLISHED, action: 'Ready for data transfer' },
    server: { state: TCP_STATES.ESTABLISHED, action: 'Ready for data transfer' },
    packet: null,
    description: 'Connection established! Both sides can now exchange data bidirectionally.',
    details: {
      title: 'Connection Established',
      content: 'The TCP connection is now fully established. Both client and server can send and receive data. Each data packet will be acknowledged, ensuring reliable delivery.',
      flags: [],
      important: 'TCP provides reliable, ordered, and error-checked delivery of data between applications.'
    }
  }
]

// TCP Flags explanation
const TCP_FLAGS = [
  { flag: 'SYN', name: 'Synchronize', color: 'bg-blue-500', description: 'Initiates connection and synchronizes sequence numbers' },
  { flag: 'ACK', name: 'Acknowledge', color: 'bg-green-500', description: 'Acknowledges received data or packets' },
  { flag: 'FIN', name: 'Finish', color: 'bg-red-500', description: 'Indicates no more data from sender' },
  { flag: 'RST', name: 'Reset', color: 'bg-orange-500', description: 'Resets the connection' },
  { flag: 'PSH', name: 'Push', color: 'bg-purple-500', description: 'Push data to receiving application immediately' },
  { flag: 'URG', name: 'Urgent', color: 'bg-yellow-500', description: 'Indicates urgent data' }
]

// Connection termination steps
const TERMINATION_STEPS = [
  {
    id: 1,
    phase: 'Active Close',
    initiator: { state: TCP_STATES.ESTABLISHED, action: 'Sends FIN' },
    receiver: { state: TCP_STATES.ESTABLISHED, action: 'Receives FIN' },
    packet: { type: 'FIN', flags: ['FIN', 'ACK'] },
    description: 'Initiator sends FIN to close connection'
  },
  {
    id: 2,
    phase: 'ACK of FIN',
    initiator: { state: TCP_STATES.FIN_WAIT_1, action: 'Waits for ACK' },
    receiver: { state: TCP_STATES.CLOSE_WAIT, action: 'Sends ACK' },
    packet: { type: 'ACK', flags: ['ACK'] },
    description: 'Receiver acknowledges the FIN'
  },
  {
    id: 3,
    phase: 'Passive Close',
    initiator: { state: TCP_STATES.FIN_WAIT_2, action: 'Waits for FIN' },
    receiver: { state: TCP_STATES.CLOSE_WAIT, action: 'Sends FIN' },
    packet: { type: 'FIN', flags: ['FIN', 'ACK'] },
    description: 'Receiver sends its own FIN'
  },
  {
    id: 4,
    phase: 'Final ACK',
    initiator: { state: TCP_STATES.TIME_WAIT, action: 'Sends ACK' },
    receiver: { state: TCP_STATES.LAST_ACK, action: 'Receives ACK' },
    packet: { type: 'ACK', flags: ['ACK'] },
    description: 'Initiator acknowledges the FIN'
  }
]

function TCPConnectionIndicator({ isAnimating }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [connectionPhase, setConnectionPhase] = useState('handshake') // handshake, established, termination
  const [selectedPacket, setSelectedPacket] = useState(null)
  const [showFlagsGuide, setShowFlagsGuide] = useState(false)
  const [dataPackets, setDataPackets] = useState([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [packetLoss, setPacketLoss] = useState(false)
  const [retransmission, setRetransmission] = useState(false)
  const animationRef = useRef(null)

  useEffect(() => {
    if (!isAnimating) {
      setCurrentStep(0)
      setDataPackets([])
      return
    }

    const steps = connectionPhase === 'termination' ? TERMINATION_STEPS : HANDSHAKE_STEPS
    let stepIndex = 0

    animationRef.current = setInterval(() => {
      if (stepIndex < steps.length) {
        setCurrentStep(stepIndex)
        
        // Simulate data transfer when established
        if (connectionPhase === 'handshake' && stepIndex === steps.length - 1) {
          setTimeout(() => {
            setConnectionPhase('established')
            simulateDataTransfer()
          }, 2000)
        }
        
        stepIndex++
      } else {
        if (connectionPhase === 'established') {
          setTimeout(() => {
            setConnectionPhase('termination')
            setCurrentStep(0)
          }, 3000)
        } else {
          clearInterval(animationRef.current)
        }
      }
    }, 2500)

    return () => {
      if (animationRef.current) clearInterval(animationRef.current)
    }
  }, [isAnimating, connectionPhase])

  const simulateDataTransfer = () => {
    const packets = [
      { id: 1, type: 'DATA', size: 1460, seq: 1001, ack: 3001, status: 'sent' },
      { id: 2, type: 'DATA', size: 1460, seq: 2461, ack: 3001, status: 'sent' },
      { id: 3, type: 'ACK', size: 0, seq: 3001, ack: 3921, status: 'received' },
      { id: 4, type: 'DATA', size: 1460, seq: 3921, ack: 3001, status: 'sent' }
    ]
    
    packets.forEach((packet, index) => {
      setTimeout(() => {
        setDataPackets(prev => [...prev, packet])
      }, index * 500)
    })
  }

  const getCurrentSteps = () => {
    if (connectionPhase === 'termination') return TERMINATION_STEPS
    return HANDSHAKE_STEPS
  }

  return (
    <div className="space-y-6">
      {/* Phase Selector and Controls */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">TCP Connection Lifecycle</h3>
            <p className="text-sm text-white/70">Understanding the three-way handshake and connection termination</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowFlagsGuide(!showFlagsGuide)}
              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              TCP Flags Guide
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Advanced Options
            </button>
          </div>
        </div>

        {/* TCP Flags Guide */}
        {showFlagsGuide && (
          <div className="mt-4 p-4 bg-black/30 rounded-xl animate-fadeIn">
            <h4 className="text-white font-semibold mb-3">TCP Control Flags</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {TCP_FLAGS.map((flag) => (
                <div key={flag.flag} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${flag.color}`} />
                    <span className="text-white font-mono text-sm">{flag.flag}</span>
                  </div>
                  <div className="text-xs text-white/60">{flag.name}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/50 mt-3">
              These flags control TCP behavior and state transitions during connection lifecycle.
            </p>
          </div>
        )}

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="mt-4 p-4 bg-black/30 rounded-xl animate-fadeIn">
            <h4 className="text-white font-semibold mb-3">Advanced TCP Features</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={packetLoss}
                  onChange={(e) => setPacketLoss(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-white text-sm">Simulate Packet Loss</span>
                  <p className="text-xs text-white/50">Shows how TCP handles lost packets</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={retransmission}
                  onChange={(e) => setRetransmission(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-white text-sm">Show Retransmission</span>
                  <p className="text-xs text-white/50">Visualize TCP retransmission mechanism</p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Connection State Progress */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Connection Progress</h4>
          <span className="px-3 py-1 bg-purple-600/20 text-purple-400 text-xs font-medium rounded-full">
            {connectionPhase.toUpperCase()}
          </span>
        </div>

        {/* Progress Steps */}
        <div className="relative">
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-white/10 md:-translate-x-1/2" />
          
          <div className="space-y-8">
            {getCurrentSteps().map((step, index) => {
              const isActive = index === currentStep
              const isPast = index < currentStep
              
              return (
                <div
                  key={step.id}
                  className={`relative transition-all duration-500 ${
                    isActive ? 'scale-105' : isPast ? 'opacity-70' : 'opacity-30'
                  }`}
                >
                  {/* Step Indicator */}
                  <div className="absolute left-8 md:left-1/2 md:-translate-x-1/2 -translate-y-1/2 top-1/2">
                    <div className={`
                      w-4 h-4 rounded-full border-2 transition-all duration-500
                      ${isActive ? 'bg-blue-500 border-blue-400 animate-pulse scale-150' : 
                        isPast ? 'bg-green-500 border-green-400' : 
                        'bg-gray-700 border-gray-600'}
                    `} />
                  </div>

                  {/* Content */}
                  <div className={`
                    ml-16 md:ml-0 md:grid md:grid-cols-2 md:gap-8
                    ${index % 2 === 0 ? '' : 'md:direction-rtl'}
                  `}>
                    {/* Client Side */}
                    <div className={`
                      ${index % 2 === 0 ? 'md:text-right' : 'md:order-2 md:text-left'}
                    `}>
                      <div className="bg-blue-900/30 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-2xl">💻</div>
                          <div>
                            <div className="text-white font-semibold">Client</div>
                            <div className="text-xs text-blue-400 font-mono">
                              {connectionPhase === 'termination' ? step.initiator?.state : step.client?.state}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-white/70">
                          {connectionPhase === 'termination' ? step.initiator?.action : step.client?.action}
                        </div>
                      </div>
                    </div>

                    {/* Server Side */}
                    <div className={`
                      mt-4 md:mt-0
                      ${index % 2 === 0 ? 'md:order-2' : 'md:text-right'}
                    `}>
                      <div className="bg-green-900/30 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-2xl">🖥️</div>
                          <div>
                            <div className="text-white font-semibold">Server</div>
                            <div className="text-xs text-green-400 font-mono">
                              {connectionPhase === 'termination' ? step.receiver?.state : step.server?.state}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-white/70">
                          {connectionPhase === 'termination' ? step.receiver?.action : step.server?.action}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Packet Animation */}
                  {isActive && step.packet && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                      <div
                        onClick={() => setSelectedPacket(step.packet)}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg font-mono text-sm animate-bounce cursor-pointer hover:scale-110 transition-transform"
                      >
                        {step.packet.type}
                        {step.packet.flags && (
                          <div className="flex gap-1 mt-1">
                            {step.packet.flags.map(flag => (
                              <span key={flag} className="text-xs bg-black/30 px-1 rounded">
                                {flag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step Description */}
                  {isActive && (
                    <div className="mt-4 ml-16 md:ml-0 md:col-span-2">
                      <div className="bg-white/5 rounded-lg p-3 animate-fadeIn">
                        <p className="text-sm text-white/80">{step.description}</p>
                        {step.details && (
                          <button
                            onClick={() => setSelectedPacket(step.details)}
                            className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Learn more
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Data Transfer Visualization (when established) */}
      {connectionPhase === 'established' && dataPackets.length > 0 && (
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10 animate-fadeIn">
          <h4 className="text-lg font-semibold text-white mb-4">Data Transfer</h4>
          
          <div className="space-y-2">
            {dataPackets.map((packet, index) => (
              <div
                key={packet.id}
                className={`
                  flex items-center gap-4 p-3 rounded-lg transition-all duration-500
                  ${packet.type === 'DATA' ? 'bg-blue-900/30 border border-blue-500/30' : 'bg-green-900/30 border border-green-500/30'}
                  animate-slideIn
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`text-2xl ${packet.type === 'DATA' ? '→' : '←'}`}>
                  {packet.type === 'DATA' ? '📤' : '📥'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-mono text-sm">{packet.type}</span>
                    {packet.size > 0 && (
                      <span className="text-xs text-white/50">{packet.size} bytes</span>
                    )}
                  </div>
                  <div className="text-xs text-white/50 font-mono mt-1">
                    SEQ: {packet.seq} | ACK: {packet.ack}
                  </div>
                </div>
                <div className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${packet.status === 'sent' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}
                `}>
                  {packet.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">
              ℹ️ During ESTABLISHED state, data flows bidirectionally with acknowledgments ensuring reliable delivery.
            </p>
          </div>
        </div>
      )}

      {/* Packet Details Modal */}
      {selectedPacket && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPacket(null)}
        >
          <div 
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-white">
                {selectedPacket.title || `${selectedPacket.type} Packet Details`}
              </h3>
              <button
                onClick={() => setSelectedPacket(null)}
                className="text-white/60 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedPacket.content && (
                <div className="text-white/80 text-sm leading-relaxed">
                  {selectedPacket.content}
                </div>
              )}

              {selectedPacket.flags && selectedPacket.flags.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Active Flags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPacket.flags.map(flag => {
                      const flagInfo = TCP_FLAGS.find(f => f.flag === flag)
                      return flagInfo ? (
                        <div key={flag} className="bg-white/10 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-3 h-3 rounded-full ${flagInfo.color}`} />
                            <span className="text-white font-mono">{flag}</span>
                          </div>
                          <p className="text-xs text-white/60">{flagInfo.description}</p>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {selectedPacket.seq !== undefined && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-white/60 mb-1">Sequence Number</div>
                    <div className="text-white font-mono">{selectedPacket.seq}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-white/60 mb-1">Acknowledgment Number</div>
                    <div className="text-white font-mono">{selectedPacket.ack}</div>
                  </div>
                  {selectedPacket.window && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-white/60 mb-1">Window Size</div>
                      <div className="text-white font-mono">{selectedPacket.window}</div>
                    </div>
                  )}
                  {selectedPacket.options && selectedPacket.options.length > 0 && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-xs text-white/60 mb-1">TCP Options</div>
                      <div className="text-white font-mono text-xs">{selectedPacket.options.join(', ')}</div>
                    </div>
                  )}
                </div>
              )}
              {selectedPacket.important && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400">⚠️</span>
                    <p className="text-sm text-amber-400">{selectedPacket.important}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Educational Resources Section */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">Key Concepts</h4>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Reliability */}
          <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h5 className="text-white font-semibold">Reliability</h5>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              TCP ensures all data arrives correctly through acknowledgments, sequence numbers, and retransmission of lost packets.
            </p>
          </div>

          {/* Ordering */}
          <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <h5 className="text-white font-semibold">Ordering</h5>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Sequence numbers ensure data is reassembled in the correct order, even if packets arrive out of sequence.
            </p>
          </div>

          {/* Flow Control */}
          <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h5 className="text-white font-semibold">Flow Control</h5>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Window size prevents sender from overwhelming receiver by controlling how much unacknowledged data can be in transit.
            </p>
          </div>

          {/* Congestion Control */}
          <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <h5 className="text-white font-semibold">Congestion Control</h5>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Algorithms like Slow Start and Congestion Avoidance prevent network overload by adjusting transmission rate.
            </p>
          </div>

          {/* Error Detection */}
          <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h5 className="text-white font-semibold">Error Detection</h5>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Checksum validation ensures data integrity. Corrupted segments are detected and retransmitted.
            </p>
          </div>

          {/* Connection-Oriented */}
          <div className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h5 className="text-white font-semibold">Connection-Oriented</h5>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Establishes dedicated connection before data transfer, maintaining state throughout communication.
            </p>
          </div>
        </div>
      </div>

      {/* Common Issues and Solutions */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">Common TCP Issues & Solutions</h4>
        
        <div className="space-y-3">
          {/* SYN Flood Attack */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🚨</div>
              <div className="flex-1">
                <h5 className="text-white font-semibold mb-1">SYN Flood Attack</h5>
                <p className="text-sm text-white/70 mb-2">
                  Attacker sends many SYN packets without completing handshake, exhausting server resources.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Solution</span>
                  <span className="text-xs text-white/60">SYN cookies, rate limiting, connection timeouts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Head-of-Line Blocking */}
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⏸️</div>
              <div className="flex-1">
                <h5 className="text-white font-semibold mb-1">Head-of-Line Blocking</h5>
                <p className="text-sm text-white/70 mb-2">
                  Lost packet blocks delivery of subsequent packets even if they arrived.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Solution</span>
                  <span className="text-xs text-white/60">HTTP/3 with QUIC, multiple TCP connections</span>
                </div>
              </div>
            </div>
          </div>

          {/* TIME-WAIT State */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⏰</div>
              <div className="flex-1">
                <h5 className="text-white font-semibold mb-1">TIME-WAIT State Accumulation</h5>
                <p className="text-sm text-white/70 mb-2">
                  Connections remain in TIME-WAIT for 2*MSL, potentially exhausting ports.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Solution</span>
                  <span className="text-xs text-white/60">Connection pooling, SO_REUSEADDR, adjust TIME-WAIT duration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quiz Section */}
      <TCPQuiz />
    </div>
  )
}

// Interactive Quiz Component
function TCPQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState(0)

  const questions = [
    {
      question: "What is the minimum number of packets required for TCP three-way handshake?",
      options: ["2", "3", "4", "5"],
      correct: 1,
      explanation: "Three packets: SYN, SYN-ACK, and ACK"
    },
    {
      question: "Which TCP flag indicates the sender has no more data to send?",
      options: ["RST", "ACK", "FIN", "PSH"],
      correct: 2,
      explanation: "FIN (Finish) flag indicates the sender has finished sending data"
    },
    {
      question: "What does the window size in TCP control?",
      options: ["Packet size", "Connection timeout", "Flow control", "Port number"],
      correct: 2,
      explanation: "Window size controls flow by limiting unacknowledged data in transit"
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
        <h4 className="text-lg font-semibold text-white">Test Your Knowledge</h4>
        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-sm rounded-full">
          Score: {score}/{questions.length}
        </span>
      </div>

      <div className="bg-black/30 rounded-xl p-4">
        <p className="text-white mb-4">{questions[currentQuestion].question}</p>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showAnswer}
              className={`
                p-3 rounded-lg text-sm font-medium transition-all
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

export default TCPConnectionIndicator