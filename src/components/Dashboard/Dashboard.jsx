import { useState, useEffect } from 'react'
import { Info, X, Play, Maximize, Loader2 } from 'lucide-react'
import DNSIndicator from './DNSIndicator'
import LoadBalancerIndicator from './LoadBalancerIndicator'
import TCPVisualization from './TCPConnectionIndicator'
import CDNVisualization from './CDNNetworkIndicator'
import VPNVisualization from './VPNTunnelIndicator'
import HTTPVisualization from './HTTPRequestIndicator'
import { CATEGORIES } from '../../utils/constants'

function Dashboard({ selectedCategory }) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [simulationCount, setSimulationCount] = useState(0)
  const [showTutorial, setShowTutorial] = useState(true)

  const category = CATEGORIES[selectedCategory]
  const IconComponent = category?.icon

  useEffect(() => {
    // Reset tutorial quando mudar categoria
    setShowTutorial(true)
    setIsAnimating(false)
  }, [selectedCategory])

  const startAnimation = () => {
    setIsAnimating(true)
    setSimulationCount(prev => prev + 1)
    
    // Duração diferente por categoria
    const durations = {
      dns: 8000,
      loadbalancer: 10000,
      tcp: 60000,
      http: 12000,
      cdn: 60000,
      vpn: 60000
    }
    
    setTimeout(() => setIsAnimating(false), durations[selectedCategory] || 8000)
  }

  const renderVisualization = () => {
    switch (selectedCategory) {
      case 'dns':
        return <DNSIndicator isAnimating={isAnimating} />
      case 'loadbalancer':
        return <LoadBalancerIndicator isAnimating={isAnimating} />
      case 'tcp':
        return <TCPVisualization isAnimating={isAnimating} />
      case 'http':
        return <HTTPVisualization isAnimating={isAnimating} />
      case 'cdn':
        return <CDNVisualization isAnimating={isAnimating} />
      case 'vpn':
        return <VPNVisualization isAnimating={isAnimating} />
      default:
        return <DNSIndicator isAnimating={isAnimating} />
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Tutorial Banner */}
      {showTutorial && (
        <div className="mb-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-4 border border-white/10 animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <Info className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Interactive Learning Mode</h4>
                <p className="text-white/70 text-sm">
                  Click "Start Simulation" to see how {category?.name} works in real-time. 
                  Each step is interactive - hover or click for detailed explanations.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowTutorial(false)}
              className="text-white/60 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header Section - Redesigned */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Icon and Title */}
            <div className="flex items-center gap-4 flex-1">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${category?.color} flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform`}>
                {IconComponent && (
                  <IconComponent className="w-10 h-10 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">
                  {category?.name}
                </h2>
                <p className="text-white/80 text-base lg:text-lg leading-relaxed">
                  {category?.description}
                </p>
              </div>
            </div>

            {/* Action Button and Stats */}
            <div className="flex flex-col gap-3">
              <button
                onClick={startAnimation}
                disabled={isAnimating}
                className={`
                  relative overflow-hidden group
                  bg-gradient-to-r from-purple-600 to-pink-600 
                  hover:from-purple-700 hover:to-pink-700 
                  disabled:from-gray-600 disabled:to-gray-700
                  text-white px-8 py-4 rounded-2xl font-semibold 
                  transition-all transform hover:scale-105 disabled:hover:scale-100
                  shadow-lg hover:shadow-2xl disabled:shadow-md
                  ${isAnimating ? 'animate-pulse' : ''}
                `}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isAnimating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Running Simulation...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Simulation
                    </>
                  )}
                </span>
                {!isAnimating && (
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                )}
              </button>
              
              {/* Simulation Counter */}
              {simulationCount > 0 && (
                <div className="text-center text-white/60 text-sm">
                  Simulations run: {simulationCount}
                </div>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          {isAnimating && (
            <div className="mt-6">
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-progress" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Visualization Card - Enhanced */}
      <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-white/5 to-white/10 px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-white">Interactive Visualization</h3>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full">
                LIVE
              </span>
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isAnimating ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-white/70 hidden sm:inline">
                  {isAnimating ? 'Processing' : 'Ready'}
                </span>
              </div>
              
              {/* Fullscreen Button */}
              <button 
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                onClick={() => document.documentElement.requestFullscreen()}
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Visualization Content */}
        <div className="p-6 lg:p-8">
          {renderVisualization()}
        </div>

        {/* Card Footer with Tips */}
        <div className="bg-gradient-to-r from-white/5 to-white/10 px-6 py-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Info className="w-4 h-4" />
            <span>Pro tip: Click on any element in the visualization to learn more about that specific component</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard