import { Menu, Network, Github } from 'lucide-react'
import { CATEGORIES } from '../../utils/constants'

function Header({ onMenuClick, selectedCategory }) {
  const selectedCategoryData = CATEGORIES[selectedCategory]
  const IconComponent = selectedCategoryData?.icon

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
            <Network className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-white font-bold text-lg">Network Monitor</h1>
            <p className="text-white/60 text-xs">Educational Network Visualization</p>
          </div>
        </div>

        {/* Current Category (Mobile) */}
        <div className="lg:hidden flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg">
          {IconComponent && (
            <IconComponent className="w-5 h-5 text-white/80" />
          )}
          <span className="text-white text-sm font-medium">
            {selectedCategoryData?.name}
          </span>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 text-white/80">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm hidden lg:inline">Live Simulation</span>
            <span className="text-xs lg:hidden">Live</span>
          </div>
          
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            aria-label="View on GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  )
}

export default Header