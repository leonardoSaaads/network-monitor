import { useState, useEffect } from 'react'
import { Clock, RotateCcw, Package, Timer } from 'lucide-react'
import { DNS_STEPS } from '../../utils/constants'

function DNSIndicator({ isAnimating }) {
  const [currentStep, setCurrentStep] = useState(-1)
  const [steps, setSteps] = useState(DNS_STEPS)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [queryDomain, setQueryDomain] = useState('example.com')
  const [queryType, setQueryType] = useState('A')
  const [resolvedData, setResolvedData] = useState(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [packetView, setPacketView] = useState(false)
  
  // Métricas em tempo real
  const [metrics, setMetrics] = useState({
    totalTime: 0,
    hops: [],
    cacheStatus: [],
    packetSize: 0,
    ttl: 3600
  })

  // Simular resolução DNS
  useEffect(() => {
    if (isAnimating) {
      setCurrentStep(-1)
      setResolvedData(null)
      setSteps(DNS_STEPS.map(step => ({ ...step, status: 'pending', latency: 0 })))
      
      let stepIndex = 0
      let totalTime = 0
      let hopsData = []
      
      const processNextStep = () => {
        if (stepIndex < DNS_STEPS.length) {
          const currentStepData = DNS_STEPS[stepIndex]
          const latency = Math.floor(Math.random() * 50) + 10
          
          setCurrentStep(stepIndex)
          totalTime += latency
          
          // Adicionar dados de hop
          hopsData.push({
            server: currentStepData.name,
            latency: latency,
            cached: stepIndex < 3 && Math.random() > 0.5
          })
          
          setMetrics(prev => ({
            ...prev,
            totalTime: totalTime,
            hops: hopsData,
            packetSize: 512 + Math.floor(Math.random() * 512)
          }))
          
          setSteps(prevSteps => 
            prevSteps.map((step, index) => ({
              ...step,
              status: index < stepIndex ? 'completed' : index === stepIndex ? 'active' : 'pending',
              latency: index === stepIndex ? latency : step.latency
            }))
          )
          
          setTimeout(() => {
            setSteps(prevSteps => 
              prevSteps.map((step, index) => ({
                ...step,
                status: index <= stepIndex ? 'completed' : 'pending'
              }))
            )
            
            stepIndex++
            if (stepIndex < DNS_STEPS.length) {
              setTimeout(processNextStep, 500)
            } else {
              // Resolver com dados completos baseado no tipo
              setResolvedData(generateResolvedData(queryType))
            }
          }, 1500)
        }
      }
      
      setTimeout(processNextStep, 500)
    }
  }, [isAnimating, queryType])

  // Gerar dados resolvidos baseado no tipo de query
  const generateResolvedData = (type) => {
    const data = {
      'A': { 
        type: 'A', 
        value: '192.168.1.100', 
        ttl: 3600,
        class: 'IN',
        additionalInfo: 'IPv4 Address'
      },
      'AAAA': { 
        type: 'AAAA', 
        value: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        ttl: 3600,
        class: 'IN',
        additionalInfo: 'IPv6 Address'
      },
      'MX': { 
        type: 'MX', 
        value: '10 mail.example.com',
        ttl: 7200,
        class: 'IN',
        additionalInfo: 'Mail Exchange'
      },
      'CNAME': { 
        type: 'CNAME', 
        value: 'alias.example.com',
        ttl: 3600,
        class: 'IN',
        additionalInfo: 'Canonical Name'
      },
      'TXT': { 
        type: 'TXT', 
        value: 'v=spf1 include:_spf.google.com ~all',
        ttl: 300,
        class: 'IN',
        additionalInfo: 'Text Record'
      },
      'NS': { 
        type: 'NS', 
        value: 'ns1.example.com',
        ttl: 172800,
        class: 'IN',
        additionalInfo: 'Name Server'
      }
    }
    return data[type]
  }

  return (
    <div className="space-y-6">
      {/* Query Configuration Panel */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Domain Input */}
          <div className="lg:col-span-2">
            <label className="block text-white/80 text-sm font-medium mb-2">
              Domain Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={queryDomain}
                onChange={(e) => setQueryDomain(e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-400/60 focus:bg-black/40 transition-all font-mono"
                placeholder="Enter domain (e.g., google.com)"
                disabled={isAnimating}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Query Type Selector */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Record Type
            </label>
            <select
              value={queryType}
              onChange={(e) => setQueryType(e.target.value)}
              className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400/60 focus:bg-black/40 transition-all appearance-none cursor-pointer"
              disabled={isAnimating}
            >
              <option value="A">A (IPv4)</option>
              <option value="AAAA">AAAA (IPv6)</option>
              <option value="CNAME">CNAME</option>
              <option value="MX">MX (Mail)</option>
              <option value="TXT">TXT</option>
              <option value="NS">NS (Nameserver)</option>
            </select>
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Advanced Configuration
          </button>
          
          <button
            onClick={() => setPacketView(!packetView)}
            className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
          >
            {packetView ? 'Visual Mode' : 'Packet Mode'}
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3">
            <ConfigOption label="DNSSEC" value="Enabled" icon="🔒" />
            <ConfigOption label="EDNS" value="4096 bytes" icon="📦" />
            <ConfigOption label="Recursion" value="Yes" icon="🔄" />
            <ConfigOption label="TCP Fallback" value="Auto" icon="🔌" />
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['overview', 'hierarchy', 'packet', 'cache', 'security'].map((tab) => (
          <TabButton
            key={tab}
            label={tab.charAt(0).toUpperCase() + tab.slice(1)}
            active={selectedTab === tab}
            onClick={() => setSelectedTab(tab)}
          />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <OverviewTab 
            steps={steps}
            currentStep={currentStep}
            isAnimating={isAnimating}
            resolvedData={resolvedData}
            metrics={metrics}
          />
        )}
        
        {selectedTab === 'hierarchy' && (
          <HierarchyTab 
            currentStep={currentStep}
            isAnimating={isAnimating}
          />
        )}
        
        {selectedTab === 'packet' && (
          <PacketTab 
            queryDomain={queryDomain}
            queryType={queryType}
            currentStep={currentStep}
          />
        )}
        
        {selectedTab === 'cache' && (
          <CacheTab 
            steps={steps}
            metrics={metrics}
          />
        )}
        
        {selectedTab === 'security' && (
          <SecurityTab />
        )}
      </div>

      {/* Live Metrics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Response Time"
          value={`${metrics.totalTime}ms`}
          trend={metrics.totalTime < 100 ? 'good' : metrics.totalTime < 300 ? 'normal' : 'slow'}
          icon={<Clock size={24} />}
        />
        <MetricCard
          label="Hops"
          value={metrics.hops.length}
          trend="normal"
          icon={<RotateCcw size={24} />}
        />
        <MetricCard
          label="Packet Size"
          value={`${metrics.packetSize}B`}
          trend="normal"
          icon={<Package size={24} />}
        />
        <MetricCard
          label="TTL"
          value={`${metrics.ttl}s`}
          trend="normal"
          icon={<Timer size={24} />}
        />
      </div>

      {/* Educational Section */}
      <EducationalPanel currentStep={currentStep} />
    </div>
  )
}

// Tab Components
const OverviewTab = ({ steps, currentStep, resolvedData }) => (
  <div className="p-6 space-y-6">
    {/* DNS Resolution Flow */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {steps.map((step, index) => (
        <StepCard
          key={step.id}
          step={step}
          index={index}
          isActive={index === currentStep}
          isCompleted={index < currentStep}
        />
      ))}
    </div>

    {/* Result Display */}
    {resolvedData && (
      <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-green-300 font-semibold mb-2">Resolution Successful</h4>
            <div className="space-y-1 font-mono text-sm">
              <div className="text-white/80">Type: {resolvedData.type}</div>
              <div className="text-white/80">Value: {resolvedData.value}</div>
              <div className="text-white/80">TTL: {resolvedData.ttl} seconds</div>
              <div className="text-white/60 text-xs mt-2">{resolvedData.additionalInfo}</div>
            </div>
          </div>
          <div className="text-3xl">✅</div>
        </div>
      </div>
    )}
  </div>
)

const HierarchyTab = ({ currentStep }) => (
  <div className="p-6">
    <div className="flex flex-col items-center space-y-4">
      {/* Root Level */}
      <ServerNode 
        label="Root Servers (13)"
        detail="a.root-servers.net → m.root-servers.net"
        active={currentStep >= 4}
        icon="🌍"
      />
      
      <ConnectionLine active={currentStep >= 4} />
      
      {/* TLD Level */}
      <ServerNode 
        label="TLD Servers (.com)"
        detail="Managed by VeriSign"
        active={currentStep >= 5}
        icon="🏢"
      />
      
      <ConnectionLine active={currentStep >= 5} />
      
      {/* Authoritative Level */}
      <ServerNode 
        label="Authoritative NS"
        detail="ns1.example.com (BIND9)"
        active={currentStep >= 6}
        icon="🎯"
      />
    </div>
  </div>
)

const PacketTab = ({ queryDomain, queryType }) => (
  <div className="p-6 font-mono text-sm">
    <div className="bg-black/50 rounded-lg p-4 text-green-400">
      <div className="text-white/60 mb-2">;; DNS Query Packet</div>
      <div>;; QUESTION SECTION:</div>
      <div>{queryDomain}. IN {queryType}</div>
      <div className="mt-4 text-white/60">;; HEADER:</div>
      <div>ID: 0x{Math.floor(Math.random() * 65535).toString(16)}</div>
      <div>QR: 0 (Query)</div>
      <div>OPCODE: 0 (Standard)</div>
      <div>Flags: RD (Recursion Desired)</div>
      <div className="mt-4 text-white/60">;; MSG SIZE: 512</div>
    </div>
  </div>
)

const CacheTab = () => (
  <div className="p-6">
    <div className="space-y-4">
      <CacheEntry level="Browser" ttl="300" hits="42" status="hit" />
      <CacheEntry level="OS (systemd-resolved)" ttl="3600" hits="128" status="miss" />
      <CacheEntry level="Router" ttl="7200" hits="89" status="expired" />
      <CacheEntry level="ISP Resolver" ttl="86400" hits="10234" status="hit" />
    </div>
  </div>
)

const SecurityTab = () => (
  <div className="p-6 space-y-4">
    <SecurityFeature 
      name="DNSSEC" 
      status="enabled"
      description="Cryptographic signatures prevent DNS spoofing"
    />
    <SecurityFeature 
      name="DoH (DNS over HTTPS)" 
      status="available"
      description="Encrypted DNS queries over HTTPS protocol"
    />
    <SecurityFeature 
      name="DoT (DNS over TLS)" 
      status="disabled"
      description="Encrypted DNS queries over TLS protocol"
    />
    <SecurityFeature 
      name="DANE" 
      status="checking"
      description="DNS-based Authentication of Named Entities"
    />
  </div>
)

// Helper Components
const StepCard = ({ step, index, isActive, isCompleted }) => (
  <div className={`
    relative p-3 rounded-xl border transition-all duration-300
    ${isActive ? 'bg-blue-500/20 border-blue-400/50 scale-105' : ''}
    ${isCompleted ? 'bg-green-500/10 border-green-400/30' : ''}
    ${!isActive && !isCompleted ? 'bg-white/5 border-white/10' : ''}
  `}>
    <div className="flex items-center gap-2 mb-1">
      <div className={`
        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
        ${isActive ? 'bg-blue-500 text-white animate-pulse' : ''}
        ${isCompleted ? 'bg-green-500 text-white' : ''}
        ${!isActive && !isCompleted ? 'bg-white/20 text-white/60' : ''}
      `}>
        {isCompleted ? '✓' : index + 1}
      </div>
      <div className="text-xs text-white/80 font-medium">{step.name}</div>
    </div>
    {step.latency > 0 && (
      <div className="text-xs text-white/50">{step.latency}ms</div>
    )}
    {isActive && (
      <div className="absolute -top-1 -right-1">
        <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
      </div>
    )}
  </div>
)

const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
      ${active 
        ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' 
        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
      }
    `}
  >
    {label}
  </button>
)

const ConfigOption = ({ label, value, icon }) => (
  <div className="bg-black/20 rounded-lg p-3 border border-white/10">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-lg">{icon}</span>
      <span className="text-white/60 text-xs">{label}</span>
    </div>
    <div className="text-white text-sm font-medium">{value}</div>
  </div>
)

const MetricCard = ({ label, value, trend, icon }) => {
  const trendColors = {
    good: 'text-green-400',
    normal: 'text-blue-400',
    slow: 'text-yellow-400'
  }
  
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/60 text-sm">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${trendColors[trend] || 'text-white'}`}>
        {value}
      </div>
    </div>
  )
}

const ServerNode = ({ label, detail, active, icon }) => (
  <div className={`
    w-full max-w-sm p-4 rounded-xl transition-all duration-500
    ${active 
      ? 'bg-blue-500/20 border border-blue-400/50 scale-105' 
      : 'bg-white/5 border border-white/10'
    }
  `}>
    <div className="flex items-center gap-3">
      <div className="text-3xl">{icon}</div>
      <div>
        <div className="text-white font-semibold">{label}</div>
        <div className="text-white/60 text-sm">{detail}</div>
      </div>
    </div>
  </div>
)

const ConnectionLine = ({ active }) => (
  <div className={`w-0.5 h-8 ${active ? 'bg-blue-400' : 'bg-white/20'} transition-all duration-500`} />
)

const CacheEntry = ({ level, ttl, hits, status }) => {
  const statusColors = {
    hit: 'bg-green-500/20 text-green-300',
    miss: 'bg-red-500/20 text-red-300',
    expired: 'bg-yellow-500/20 text-yellow-300'
  }
  
  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-medium">{level}</div>
          <div className="text-white/60 text-sm">TTL: {ttl}s | Hits: {hits}</div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {status.toUpperCase()}
        </span>
      </div>
    </div>
  )
}

const SecurityFeature = ({ name, status, description }) => {
  const statusColors = {
    enabled: 'bg-green-500/20 text-green-300',
    disabled: 'bg-red-500/20 text-red-300',
    available: 'bg-blue-500/20 text-blue-300',
    checking: 'bg-yellow-500/20 text-yellow-300'
  }
  
  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-white font-medium">{name}</div>
          <div className="text-white/60 text-sm mt-1">{description}</div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {status.toUpperCase()}
        </span>
      </div>
    </div>
  )
}

const EducationalPanel = () => {
  const insights = [
    { title: "Root Servers", desc: "Only 13 root server addresses exist, but hundreds of physical servers use anycast routing." },
    { title: "BIND9", desc: "Berkeley Internet Name Domain is the most widely used DNS software on the Internet." },
    { title: "Cache Poisoning", desc: "DNSSEC prevents attackers from injecting false DNS records into resolver caches." },
    { title: "Query Time", desc: "First queries take longer. Cached responses can be served in <1ms." }
  ]
  
  return (
    <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl p-6 border border-white/10">
      <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
        <span className="text-xl">🎓</span>
        DNS Deep Dive
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="w-1 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full" />
            <div>
              <h5 className="text-white font-medium mb-1">{insight.title}</h5>
              <p className="text-white/70 text-sm">{insight.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DNSIndicator