import { useState, useEffect } from 'react'

function Expenses({ apiUrl, selectedYear }) {
  const [expenses, setExpenses] = useState([])
  const [budgets, setBudgets] = useState([])
  const [selectedBudgetName, setSelectedBudgetName] = useState('')
  const [selectedBudgetType, setSelectedBudgetType] = useState('')
  const [formData, setFormData] = useState({
    budgetItemId: '',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
    amount: ''
  })

  useEffect(() => {
    if (selectedYear) {
      fetchBudgetsAndExpenses()
    }
  }, [selectedYear])

  // Reset filters when year changes
  useEffect(() => {
    setSelectedBudgetName('')
    setSelectedBudgetType('')
  }, [selectedYear])

  const fetchBudgetsAndExpenses = async () => {
    try {
      // Fetch budgets for the selected year
      const budgetsResponse = await fetch(`${apiUrl}/budgets/year/${selectedYear}`)
      const budgetsData = budgetsResponse.ok ? await budgetsResponse.json() : []
      setBudgets(budgetsData)

      // Fetch all expenses
      const expensesResponse = await fetch(`${apiUrl}/expenses`)
      const expensesData = expensesResponse.ok ? await expensesResponse.json() : []

      // Filter expenses for current year's budgets
      const budgetIds = budgetsData.map(b => b.id)
      const filteredExpenses = expensesData.filter(exp =>
        budgetIds.includes(exp.budgetItemId)
      )

      setExpenses(filteredExpenses)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`${apiUrl}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })

      if (response.ok) {
        setFormData({
          budgetItemId: '',
          expenseDate: new Date().toISOString().split('T')[0],
          description: '',
          amount: ''
        })
        fetchBudgetsAndExpenses()
      }
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return

    try {
      const response = await fetch(`${apiUrl}/expenses/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchBudgetsAndExpenses()
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  // Get budget info for display
  const getBudgetInfo = (budgetItemId) => {
    const budget = budgets.find(b => b.id === budgetItemId)
    if (!budget) return { name: 'Unknown', type: '', budgetAmount: 0, totalSpent: 0 }

    const budgetExpenses = expenses.filter(exp => exp.budgetItemId === budgetItemId)
    const totalSpent = budgetExpenses.reduce((sum, exp) => sum + exp.amount, 0)

    return {
      name: budget.name,
      type: budget.expenseType,
      budgetAmount: budget.budgetAmount,
      totalSpent
    }
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

  // Filter expenses based on selected filters
  const getFilteredExpenses = () => {
    let filtered = [...expenses]

    if (selectedBudgetName || selectedBudgetType) {
      // Get budget IDs that match the filters
      let filteredBudgets = budgets

      if (selectedBudgetName) {
        filteredBudgets = filteredBudgets.filter(b => b.name === selectedBudgetName)
      }

      if (selectedBudgetType) {
        filteredBudgets = filteredBudgets.filter(b => b.expenseType === selectedBudgetType)
      }

      const budgetIds = filteredBudgets.map(b => b.id)
      filtered = filtered.filter(exp => budgetIds.includes(exp.budgetItemId))
    }

    return filtered
  }

  const selectedBudgetInfo = formData.budgetItemId ? getBudgetInfo(formData.budgetItemId) : null
  const filteredExpenses = getFilteredExpenses()
  const budgetNameOptions = getBudgetNameOptions()
  const budgetTypeOptions = getBudgetTypeOptions()

  return (
    <div className="expenses">
      <div className="expenses-header">
        <h2>Expenses for {selectedYear}</h2>
        {budgets.length > 0 && (
          <div className="filters">
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
          </div>
        )}
      </div>

      {budgets.length === 0 ? (
        <div className="empty-state">
          No budgets for {selectedYear}. Go to Budget Config to add some!
        </div>
      ) : (
        <>
          <form className="expense-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <select
                value={formData.budgetItemId}
                onChange={(e) => setFormData({ ...formData, budgetItemId: e.target.value })}
                required
              >
                <option value="">Select Budget Item...</option>
                {budgets.map(budget => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name} ({budget.expenseType})
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                required
              />
            </div>

            {selectedBudgetInfo && (
              <div className="budget-info-display">
                <div className="info-item">
                  <span className="info-label">Budget:</span>
                  <span className="info-value">${selectedBudgetInfo.budgetAmount.toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Spent:</span>
                  <span className="info-value">${selectedBudgetInfo.totalSpent.toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Remaining:</span>
                  <span className={`info-value ${selectedBudgetInfo.budgetAmount - selectedBudgetInfo.totalSpent < 0 ? 'over' : ''}`}>
                    ${(selectedBudgetInfo.budgetAmount - selectedBudgetInfo.totalSpent).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="form-row">
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
              <button type="submit">Add Expense</button>
            </div>
          </form>

          <div className="expenses-list">
            {filteredExpenses.length === 0 ? (
              <div className="empty-state">
                {expenses.length === 0
                  ? `No expenses yet for ${selectedYear}. Add your first expense above!`
                  : 'No expenses match the selected filters.'}
              </div>
            ) : (
              filteredExpenses
                .sort((a, b) => {
                  const budgetA = getBudgetInfo(a.budgetItemId)
                  const budgetB = getBudgetInfo(b.budgetItemId)

                  // Sort by budget name asc, then type asc
                  if (budgetA.name !== budgetB.name) {
                    return budgetA.name.localeCompare(budgetB.name)
                  }
                  return budgetA.type.localeCompare(budgetB.type)
                })
                .map((expense) => {
                  const budgetInfo = getBudgetInfo(expense.budgetItemId)
                  return (
                    <div key={expense.id} className="expense-item">
                      <div className="expense-info">
                        <div className="expense-main">
                          <div className="expense-description">{expense.description}</div>
                          <div className="expense-date">
                            {new Date(expense.expenseDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="expense-budget">
                          {budgetInfo.name} • {budgetInfo.type}
                        </div>
                      </div>
                      <div className="expense-amount">${expense.amount.toFixed(2)}</div>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(expense.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )
                })
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Expenses
