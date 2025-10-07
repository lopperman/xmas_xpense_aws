from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

# In-memory storage (will be replaced with DynamoDB in AWS)
expenses = []

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    return jsonify(expenses)

@app.route('/api/expenses', methods=['POST'])
def create_expense():
    data = request.json
    expense = {
        'id': str(uuid.uuid4()),
        'name': data['name'],
        'amount': float(data['amount']),
        'category': data['category'],
        'recipient': data.get('recipient', ''),
        'created_at': datetime.utcnow().isoformat()
    }
    expenses.append(expense)
    return jsonify(expense), 201

@app.route('/api/expenses/<expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    global expenses
    expenses = [e for e in expenses if e['id'] != expense_id]
    return '', 204

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
