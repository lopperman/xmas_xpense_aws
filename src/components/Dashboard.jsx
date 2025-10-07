import { useState, useEffect } from 'react'

function Dashboard({ apiUrl, selectedYear, onYearChange }) {
  const [budgets, setBudgets] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (selectedYear) {
      fetchData()
    }
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

  // Calculate total spent for each budget item
  const getBudgetSummary = () => {
    return budgets.map(budget => {
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

  if (loading) {
    return <div className="dashboard loading">Loading...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div className="year-selector">
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
      </div>

      {budgetSummary.length === 0 ? (
        <div className="empty-state">
          No budgets for {selectedYear}. Go to Budget Config to add some!
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
