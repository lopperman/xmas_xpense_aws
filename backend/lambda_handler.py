"""
AWS Lambda handler for Xmas Xpenses API
This will be used when deployed to AWS Lambda
"""
import json
import uuid
from datetime import datetime
import boto3
from decimal import Decimal

# DynamoDB setup
dynamodb = boto3.resource('dynamodb')
table_name = 'XmasExpenses'

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
        'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS'
    }

    try:
        table = dynamodb.Table(table_name)

        # Handle OPTIONS for CORS preflight
        if http_method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': ''
            }

        # GET /api/expenses - List all expenses
        if http_method == 'GET' and path == '/api/expenses':
            response = table.scan()
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
                'name': body['name'],
                'amount': Decimal(str(body['amount'])),
                'category': body['category'],
                'recipient': body.get('recipient', ''),
                'created_at': datetime.utcnow().isoformat()
            }

            table.put_item(Item=expense)

            return {
                'statusCode': 201,
                'headers': headers,
                'body': json.dumps(expense, cls=DecimalEncoder)
            }

        # DELETE /api/expenses/{id} - Delete expense
        elif http_method == 'DELETE' and path.startswith('/api/expenses/'):
            expense_id = path.split('/')[-1]

            table.delete_item(Key={'id': expense_id})

            return {
                'statusCode': 204,
                'headers': headers,
                'body': ''
            }

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
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
