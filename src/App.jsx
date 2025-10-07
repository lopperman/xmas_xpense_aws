import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [expenses, setExpenses] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'gifts',
    recipient: ''
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_URL}/expenses`)
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })

      if (response.ok) {
        setFormData({ name: '', amount: '', category: 'gifts', recipient: '' })
        fetchExpenses()
      }
    } catch (error) {
      console.error('Error adding expense:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchExpenses()
      }
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="app">
      <h1>🎄 Xmas Xpenses</h1>
      <p className="subtitle">Track your holiday spending</p>

      <form className="expense-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <input
            type="text"
            placeholder="Expense name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
        </div>
        <div className="form-row">
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="gifts">Gifts</option>
            <option value="decorations">Decorations</option>
            <option value="food">Food & Drinks</option>
            <option value="travel">Travel</option>
            <option value="other">Other</option>
          </select>
          <input
            type="text"
            placeholder="Recipient (optional)"
            value={formData.recipient}
            onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
          />
          <button type="submit">Add Expense</button>
        </div>
      </form>

      <div className="expenses-list">
        {expenses.length === 0 ? (
          <div className="empty-state">
            No expenses yet. Start tracking your holiday spending!
          </div>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="expense-item">
              <div className="expense-info">
                <div className="expense-name">{expense.name}</div>
                <div className="expense-details">
                  {expense.category}
                  {expense.recipient && ` • For ${expense.recipient}`}
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
          ))
        )}
      </div>

      {expenses.length > 0 && (
        <div className="total">
          Total Spent: ${total.toFixed(2)}
        </div>
      )}
    </div>
  )
}

export default App
