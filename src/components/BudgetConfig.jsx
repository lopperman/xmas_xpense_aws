import { useState, useEffect } from 'react'

const EXPENSE_TYPES = ['Gifts', 'Stocking', 'Decorations', 'Other']

function BudgetConfig({ apiUrl }) {
  const [budgets, setBudgets] = useState([])
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    name: '',
    expenseType: 'Gifts',
    budgetAmount: ''
  })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`${apiUrl}/budgets`)
      if (response.ok) {
        const data = await response.json()
        setBudgets(data.sort((a, b) => b.year - a.year || a.name.localeCompare(b.name)))
      }
    } catch (error) {
      console.error('Error fetching budgets:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const url = editingId
        ? `${apiUrl}/budgets/${editingId}`
        : `${apiUrl}/budgets`

      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          budgetAmount: parseFloat(formData.budgetAmount)
        })
      })

      if (response.ok) {
        setFormData({ year: new Date().getFullYear(), name: '', expenseType: 'Gifts', budgetAmount: '' })
        setEditingId(null)
        fetchBudgets()
      }
    } catch (error) {
      console.error('Error saving budget:', error)
    }
  }

  const handleEdit = (budget) => {
    setFormData({
      year: budget.year,
      name: budget.name,
      expenseType: budget.expenseType,
      budgetAmount: budget.budgetAmount.toString()
    })
    setEditingId(budget.id)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this budget item?')) return

    try {
      const response = await fetch(`${apiUrl}/budgets/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchBudgets()
      }
    } catch (error) {
      console.error('Error deleting budget:', error)
    }
  }

  const handleCancel = () => {
    setFormData({ year: new Date().getFullYear(), name: '', expenseType: 'Gifts', budgetAmount: '' })
    setEditingId(null)
  }

  const groupedBudgets = budgets.reduce((acc, budget) => {
    if (!acc[budget.year]) acc[budget.year] = []
    acc[budget.year].push(budget)
    return acc
  }, {})

  return (
    <div className="budget-config">
      <h2>Budget Configuration</h2>

      <form className="budget-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <input
            type="number"
            placeholder="Year"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Budget Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="form-row">
          <select
            value={formData.expenseType}
            onChange={(e) => setFormData({ ...formData, expenseType: e.target.value })}
          >
            {EXPENSE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Budget Amount"
            value={formData.budgetAmount}
            onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
            required
          />
          <button type="submit">{editingId ? 'Update' : 'Add'} Budget</button>
          {editingId && (
            <button type="button" onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="budgets-by-year">
        {Object.entries(groupedBudgets).map(([year, yearBudgets]) => (
          <div key={year} className="year-section">
            <h3>{year}</h3>
            <div className="budget-list">
              {yearBudgets.map((budget) => (
                <div key={budget.id} className="budget-item">
                  <div className="budget-info">
                    <div className="budget-name">{budget.name}</div>
                    <div className="budget-details">
                      {budget.expenseType} • ${budget.budgetAmount.toFixed(2)}
                    </div>
                  </div>
                  <div className="budget-actions">
                    <button onClick={() => handleEdit(budget)} className="edit-btn">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(budget.id)} className="delete-btn">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(groupedBudgets).length === 0 && (
          <div className="empty-state">
            No budgets configured yet. Add your first budget above!
          </div>
        )}
      </div>
    </div>
  )
}

export default BudgetConfig
