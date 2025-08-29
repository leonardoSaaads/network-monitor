import { useState } from 'react'
import Header from './components/Layout/Header'
import MobileNav from './components/Layout/MobileNav'
import Dashboard from './components/Dashboard/Dashboard'
import { CATEGORIES } from './utils/constants'

function App() {
  const [selectedCategory, setSelectedCategory] = useState('dns')
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header 
        onMenuClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
        selectedCategory={selectedCategory}
      />
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white/10 backdrop-blur-md border-r border-white/20 h-screen sticky top-0 pt-16">
          <nav className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Network Concepts</h2>
            <ul className="space-y-3">
              {Object.entries(CATEGORIES).map(([key, category]) => {
                const IconComponent = category.icon
                
                return (
                  <li key={key}>
                    <button
                      onClick={() => setSelectedCategory(key)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                        selectedCategory === key
                          ? 'bg-purple-500/30 text-white border border-purple-400/50'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-white/80" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Mobile Navigation */}
        <MobileNav 
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        {/* Main Content */}
        <main className="flex-1 pt-16">
          <Dashboard selectedCategory={selectedCategory} />
        </main>
      </div>
    </div>
  )
}

export default App