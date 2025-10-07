"""
AWS Lambda handler for Xmas Xpenses API
This will be used when deployed to AWS Lambda
"""
import json
import uuid
import os
from datetime import datetime
import boto3
from decimal import Decimal

# DynamoDB setup
dynamodb = boto3.resource('dynamodb')
expenses_table_name = os.environ.get('EXPENSES_TABLE', 'XmasExpenses')
budgets_table_name = os.environ.get('BUDGETS_TABLE', 'XmasBudgets')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    """
    Main Lambda handler that routes requests based on HTTP method and path
    """
    http_method = event['httpMethod']
    path = event['path']

    # CORS headers
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }

    try:
        # Handle OPTIONS for CORS preflight
        if http_method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': ''
            }

        # Budget endpoints
        if path.startswith('/api/budgets'):
            return handle_budget_request(http_method, path, event, headers)

        # Expense endpoints
        elif path.startswith('/api/expenses'):
            return handle_expense_request(http_method, path, event, headers)

        # Health check
        elif http_method == 'GET' and path == '/api/health':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'status': 'healthy'})
            }

        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Not found'})
            }

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }


def handle_budget_request(http_method, path, event, headers):
    """Handle budget-related requests"""
    budgets_table = dynamodb.Table(budgets_table_name)

    # GET /api/budgets - List all budgets
    if http_method == 'GET' and path == '/api/budgets':
        response = budgets_table.scan()
        budgets = response.get('Items', [])

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(budgets, cls=DecimalEncoder)
        }

    # GET /api/budgets/year/{year} - Get budgets for a specific year
    elif http_method == 'GET' and '/year/' in path:
        year = int(path.split('/')[-1])

        response = budgets_table.query(
            IndexName='YearIndex',
            KeyConditionExpression='#year = :year',
            ExpressionAttributeNames={'#year': 'year'},
            ExpressionAttributeValues={':year': year}
        )
        budgets = response.get('Items', [])

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(budgets, cls=DecimalEncoder)
        }

    # POST /api/budgets - Create new budget
    elif http_method == 'POST' and path == '/api/budgets':
        body = json.loads(event['body'])

        budget = {
            'id': str(uuid.uuid4()),
            'year': int(body['year']),
            'name': body['name'],
            'expenseType': body['expenseType'],
            'budgetAmount': Decimal(str(body['budgetAmount'])),
            'created_at': datetime.utcnow().isoformat()
        }

        budgets_table.put_item(Item=budget)

        return {
            'statusCode': 201,
            'headers': headers,
            'body': json.dumps(budget, cls=DecimalEncoder)
        }

    # GET /api/budgets/{id} - Get specific budget
    elif http_method == 'GET' and path.startswith('/api/budgets/') and '/year/' not in path:
        budget_id = path.split('/')[-1]

        response = budgets_table.get_item(Key={'id': budget_id})
        budget = response.get('Item')

        if not budget:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Budget not found'})
            }

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(budget, cls=DecimalEncoder)
        }

    # PUT /api/budgets/{id} - Update budget
    elif http_method == 'PUT' and path.startswith('/api/budgets/'):
        budget_id = path.split('/')[-1]
        body = json.loads(event['body'])

        budgets_table.update_item(
            Key={'id': budget_id},
            UpdateExpression='SET #name = :name, #year = :year, expenseType = :type, budgetAmount = :amount',
            ExpressionAttributeNames={
                '#name': 'name',
                '#year': 'year'
            },
            ExpressionAttributeValues={
                ':name': body['name'],
                ':year': int(body['year']),
                ':type': body['expenseType'],
                ':amount': Decimal(str(body['budgetAmount']))
            }
        )

        # Get updated item
        response = budgets_table.get_item(Key={'id': budget_id})
        budget = response.get('Item')

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(budget, cls=DecimalEncoder)
        }

    # DELETE /api/budgets/{id} - Delete budget
    elif http_method == 'DELETE' and path.startswith('/api/budgets/'):
        budget_id = path.split('/')[-1]

        budgets_table.delete_item(Key={'id': budget_id})

        return {
            'statusCode': 204,
            'headers': headers,
            'body': ''
        }

    else:
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Not found'})
        }


def handle_expense_request(http_method, path, event, headers):
    """Handle expense-related requests"""
    expenses_table = dynamodb.Table(expenses_table_name)

    # GET /api/expenses - List all expenses (optionally filter by budgetItemId)
    if http_method == 'GET' and path == '/api/expenses':
        query_params = event.get('queryStringParameters') or {}
        budget_item_id = query_params.get('budgetItemId')

        if budget_item_id:
            # Query by budget item
            response = expenses_table.query(
                IndexName='BudgetItemIndex',
                KeyConditionExpression='budgetItemId = :budgetItemId',
                ExpressionAttributeValues={':budgetItemId': budget_item_id}
            )
        else:
            # Get all expenses
            response = expenses_table.scan()

        expenses = response.get('Items', [])

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(expenses, cls=DecimalEncoder)
        }

    # POST /api/expenses - Create new expense
    elif http_method == 'POST' and path == '/api/expenses':
        body = json.loads(event['body'])

        expense = {
            'id': str(uuid.uuid4()),
            'budgetItemId': body['budgetItemId'],
            'expenseDate': body['expenseDate'],
            'description': body['description'],
            'amount': Decimal(str(body['amount'])),
            'created_at': datetime.utcnow().isoformat()
        }

        expenses_table.put_item(Item=expense)

        return {
            'statusCode': 201,
            'headers': headers,
            'body': json.dumps(expense, cls=DecimalEncoder)
        }

    # DELETE /api/expenses/{id} - Delete expense
    elif http_method == 'DELETE' and path.startswith('/api/expenses/'):
        expense_id = path.split('/')[-1]

        expenses_table.delete_item(Key={'id': expense_id})

        return {
            'statusCode': 204,
            'headers': headers,
            'body': ''
        }

    else:
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Not found'})
        }
