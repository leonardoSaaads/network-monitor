import { useEffect } from 'react'
import { X, Network, Github } from 'lucide-react'
import { CATEGORIES } from '../../utils/constants'

function MobileNav({ isOpen, onClose, selectedCategory, onCategorySelect }) {
  // Close nav on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleCategorySelect = (category) => {
    onCategorySelect(category)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Navigation Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-slate-900/95 backdrop-blur-md border-r border-white/10 transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold">Network Monitor</h2>
              <p className="text-white/60 text-xs">Choose a concept to explore</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4">
          <div className="space-y-2">
            {Object.entries(CATEGORIES).map(([key, category]) => {
              const IconComponent = category.icon
              
              return (
                <button
                  key={key}
                  onClick={() => handleCategorySelect(key)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                    selectedCategory === key
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-white/80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                      <p className="text-xs text-white/50 leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                    {selectedCategory === key && (
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center justify-between text-white/60 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Simulation Active</span>
            </div>
            
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileNav