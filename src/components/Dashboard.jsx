import { useState, useEffect } from 'react'

function Dashboard({ apiUrl, selectedYear, onYearChange }) {
  const [budgets, setBudgets] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBudgetName, setSelectedBudgetName] = useState('')
  const [selectedBudgetType, setSelectedBudgetType] = useState('')

  useEffect(() => {
    if (selectedYear) {
      fetchData()
    }
  }, [selectedYear])

  // Reset filters when year changes
  useEffect(() => {
    setSelectedBudgetName('')
    setSelectedBudgetType('')
  }, [selectedYear])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch budgets for the selected year
      const budgetsResponse = await fetch(`${apiUrl}/budgets/year/${selectedYear}`)
      const budgetsData = budgetsResponse.ok ? await budgetsResponse.json() : []

      // Fetch all expenses
      const expensesResponse = await fetch(`${apiUrl}/expenses`)
      const expensesData = expensesResponse.ok ? await expensesResponse.json() : []

      setBudgets(budgetsData)
      setExpenses(expensesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get available years from budgets
  const [availableYears, setAvailableYears] = useState([])

  useEffect(() => {
    const fetchAllBudgets = async () => {
      try {
        const response = await fetch(`${apiUrl}/budgets`)
        if (response.ok) {
          const data = await response.json()
          const years = [...new Set(data.map(b => b.year))].sort((a, b) => b - a)
          setAvailableYears(years)

          // Set current year as default if not already set
          if (!selectedYear && years.length > 0) {
            onYearChange(years[0])
          }
        }
      } catch (error) {
        console.error('Error fetching years:', error)
      }
    }

    fetchAllBudgets()
  }, [])

  // Filter budgets based on selected filters
  const getFilteredBudgets = () => {
    let filtered = [...budgets]

    if (selectedBudgetName) {
      filtered = filtered.filter(b => b.name === selectedBudgetName)
    }

    if (selectedBudgetType) {
      filtered = filtered.filter(b => b.expenseType === selectedBudgetType)
    }

    return filtered
  }

  // Get budget name options (filtered by type if selected)
  const getBudgetNameOptions = () => {
    let options = budgets
    if (selectedBudgetType) {
      options = options.filter(b => b.expenseType === selectedBudgetType)
    }
    return [...new Set(options.map(b => b.name))].sort()
  }

  // Get budget type options (filtered by name if selected)
  const getBudgetTypeOptions = () => {
    let options = budgets
    if (selectedBudgetName) {
      options = options.filter(b => b.name === selectedBudgetName)
    }
    return [...new Set(options.map(b => b.expenseType))].sort()
  }

  // Calculate total spent for each budget item
  const getBudgetSummary = () => {
    const filtered = getFilteredBudgets()
    return filtered.map(budget => {
      const budgetExpenses = expenses.filter(exp => exp.budgetItemId === budget.id)
      const totalSpent = budgetExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      const remaining = budget.budgetAmount - totalSpent
      const percentUsed = (totalSpent / budget.budgetAmount) * 100

      return {
        ...budget,
        totalSpent,
        remaining,
        percentUsed,
        expenseCount: budgetExpenses.length
      }
    })
  }

  const budgetSummary = getBudgetSummary()
  const totalBudget = budgetSummary.reduce((sum, b) => sum + b.budgetAmount, 0)
  const totalSpent = budgetSummary.reduce((sum, b) => sum + b.totalSpent, 0)
  const totalRemaining = totalBudget - totalSpent

  const budgetNameOptions = getBudgetNameOptions()
  const budgetTypeOptions = getBudgetTypeOptions()

  if (loading) {
    return <div className="dashboard loading">Loading...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div className="filters">
          <div className="filter-group">
            <label>Year:</label>
            <select
              value={selectedYear || ''}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
            >
              {availableYears.length === 0 && <option value="">No budgets yet</option>}
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {budgets.length > 0 && (
            <>
              <div className="filter-group">
                <label>Budget Name:</label>
                <select
                  value={selectedBudgetName}
                  onChange={(e) => setSelectedBudgetName(e.target.value)}
                >
                  <option value="">All</option>
                  {budgetNameOptions.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Budget Type:</label>
                <select
                  value={selectedBudgetType}
                  onChange={(e) => setSelectedBudgetType(e.target.value)}
                >
                  <option value="">All</option>
                  {budgetTypeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {budgetSummary.length === 0 ? (
        <div className="empty-state">
          {budgets.length === 0
            ? `No budgets for ${selectedYear}. Go to Budget Config to add some!`
            : 'No budgets match the selected filters.'}
        </div>
      ) : (
        <>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-label">Total Budget</div>
              <div className="summary-value">${totalBudget.toFixed(2)}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Spent</div>
              <div className="summary-value spent">${totalSpent.toFixed(2)}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Remaining</div>
              <div className="summary-value remaining">
                ${totalRemaining.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="budget-summary-list">
            <h3>Budget Details</h3>
            {budgetSummary.map(budget => (
              <div key={budget.id} className="budget-summary-item">
                <div className="budget-summary-header">
                  <div className="budget-summary-name">
                    <strong>{budget.name}</strong>
                    <span className="budget-type">{budget.expenseType}</span>
                  </div>
                  <div className="budget-summary-amounts">
                    <span className="spent">${budget.totalSpent.toFixed(2)}</span>
                    <span className="divider">/</span>
                    <span className="budgeted">${budget.budgetAmount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="budget-progress">
                  <div
                    className={`budget-progress-bar ${budget.percentUsed > 100 ? 'over-budget' : ''}`}
                    style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                  ></div>
                </div>
                <div className="budget-summary-footer">
                  <span className="expense-count">{budget.expenseCount} expense{budget.expenseCount !== 1 ? 's' : ''}</span>
                  <span className={`remaining ${budget.remaining < 0 ? 'over' : ''}`}>
                    ${Math.abs(budget.remaining).toFixed(2)} {budget.remaining < 0 ? 'over' : 'remaining'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
