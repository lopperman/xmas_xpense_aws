import { useState } from 'react'
import Dashboard from './components/Dashboard'
import BudgetConfig from './components/BudgetConfig'
import Expenses from './components/Expenses'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎄 Xmas Xpenses</h1>
        <nav className="app-nav">
          <button
            className={currentView === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={currentView === 'expenses' ? 'active' : ''}
            onClick={() => setCurrentView('expenses')}
          >
            Expenses
          </button>
          <button
            className={currentView === 'config' ? 'active' : ''}
            onClick={() => setCurrentView('config')}
          >
            Budget Config
          </button>
        </nav>
      </header>

      <main className="app-main">
        {currentView === 'dashboard' && (
          <Dashboard
            apiUrl={API_URL}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        )}

        {currentView === 'expenses' && (
          <Expenses
            apiUrl={API_URL}
            selectedYear={selectedYear}
          />
        )}

        {currentView === 'config' && (
          <BudgetConfig apiUrl={API_URL} />
        )}
      </main>
    </div>
  )
}

export default App
