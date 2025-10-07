# 🎄 Xmas Xpenses

A comprehensive holiday budget management and expense tracking app built with React and Python, designed to run on AWS.

## Architecture

- **Frontend**: React with Vite (deployed to AWS Amplify)
- **Backend**: AWS Lambda with Python 3.12
- **Database**: DynamoDB (two tables: Budgets and Expenses)
- **API**: REST API via API Gateway
- **Deployment**: Serverless architecture with AWS SAM

## Features

### Budget Management
- ✅ Create budgets by year with name, type, and amount
- ✅ Budget types: Gifts, Stocking, Decorations, Other
- ✅ Multi-year budget support
- ✅ Edit and delete budgets
- ✅ Automatic budget grouping by year

### Expense Tracking
- ✅ Link expenses to specific budget items
- ✅ Track expense date, description, and amount
- ✅ Real-time budget vs. spending calculations
- ✅ Visual progress bars with overspending alerts
- ✅ Delete expenses

### Dashboard
- ✅ Year selector for viewing different years
- ✅ Filter by budget name and type (cross-filtering)
- ✅ Total budget, spent, and remaining summary cards
- ✅ Detailed budget breakdown with progress tracking
- ✅ Expense count per budget
- ✅ Overspending indicators

### Smart Filtering & Sorting
- ✅ Filter by year, budget name, and budget type
- ✅ Dynamic filter options based on selections
- ✅ All lists sorted by budget name, then type
- ✅ Filters reset when year changes

## Project Structure

```
xmas_xpense_aws/
├── backend/
│   ├── lambda_handler.py      # Lambda handler for AWS
│   └── requirements.txt       # Python dependencies
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx      # Dashboard with year selector and filters
│   │   ├── BudgetConfig.jsx   # Budget management screen
│   │   └── Expenses.jsx       # Expense tracking screen
│   ├── App.jsx                # Main app with navigation
│   ├── main.jsx               # React entry point
│   └── index.css              # Styles
├── template.yaml              # AWS SAM template
├── samconfig.toml             # SAM deployment config
├── .env.example               # Environment variable template
├── package.json               # Node dependencies
└── vite.config.js             # Vite configuration
```

## AWS Deployment

### Prerequisites

1. **AWS CLI**
   ```bash
   # macOS
   brew install awscli

   # Windows
   # Download from: https://aws.amazon.com/cli/

   # Linux
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   ```

2. **Configure AWS CLI:**
   ```bash
   aws configure
   ```
   You'll need:
   - AWS Access Key ID (from AWS Console → IAM → Users → Security credentials)
   - AWS Secret Access Key
   - Default region (e.g., `us-east-1`)
   - Default output format (use `json`)

3. **Install AWS SAM CLI**
   ```bash
   # macOS
   brew install aws-sam-cli

   # Windows/Linux
   # Follow: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
   ```

### Deploy Backend to AWS

1. **Build the application:**
   ```bash
   sam build
   ```

2. **Deploy:**
   ```bash
   sam deploy --resolve-s3
   ```

   Or for first-time deployment:
   ```bash
   sam deploy --guided
   ```

   Use these settings:
   - Stack Name: `xmas-xpenses`
   - AWS Region: `us-east-1` (or your preferred region)
   - Confirm changes: `Y`
   - Allow IAM role creation: `Y`
   - Disable rollback: `N`
   - Save to config: `Y`

3. **Get your API endpoint:**
   ```
   Outputs:
   ApiEndpoint: https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/Prod/
   ```

### Deploy Frontend to AWS Amplify

1. **Set up environment variable:**

   Create `.env` file (not committed to git):
   ```bash
   VITE_API_URL=https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/Prod/api
   ```

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push
   ```

3. **Connect to AWS Amplify:**
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
   - Click "New app" → "Host web app"
   - Connect your GitHub repository
   - Build settings auto-detected
   - Add environment variable:
     - Key: `VITE_API_URL`
     - Value: `https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/Prod/api`
   - Deploy!

### Subsequent Updates

After initial deployment:
```bash
# Backend changes
sam build && sam deploy

# Frontend changes (automatic via Amplify)
git add .
git commit -m "Your changes"
git push
```

## AWS Resources Created

- **DynamoDB Tables**:
  - `XmasBudgets` - Stores budget items with year index
  - `XmasExpenses` - Stores expenses with budget item foreign key
- **Lambda Function**: Handles all API requests
- **API Gateway**: REST API with CORS enabled
- **IAM Roles**: Automatic role creation for Lambda
- **S3 Bucket**: SAM deployment artifacts
- **Amplify App**: Frontend hosting with CI/CD

## Cost Estimate

With AWS Free Tier:
- **DynamoDB**: 25 GB storage, 25 RCU/WCU (free)
- **Lambda**: 1M requests/month (free)
- **API Gateway**: 1M requests/month (free)
- **Amplify**: 1000 build minutes, 15 GB served (free)

**Expected cost after free tier:** $0-5/month for family usage

## API Endpoints

### Budgets
- `GET /api/budgets` - List all budgets
- `GET /api/budgets/year/{year}` - Get budgets for specific year
- `POST /api/budgets` - Create budget
- `GET /api/budgets/{id}` - Get specific budget
- `PUT /api/budgets/{id}` - Update budget
- `DELETE /api/budgets/{id}` - Delete budget

### Expenses
- `GET /api/expenses` - List all expenses
- `GET /api/expenses?budgetItemId={id}` - Get expenses for budget item
- `POST /api/expenses` - Create expense
- `DELETE /api/expenses/{id}` - Delete expense

## Troubleshooting

### AWS Deployment

**SAM build/deploy fails:**
- Verify AWS CLI configured: `aws sts get-caller-identity`
- Check IAM permissions (need Lambda, DynamoDB, API Gateway, CloudFormation, S3)
- Use `sam deploy --resolve-s3` to auto-create S3 bucket

**API returns 500 errors:**
- Check CloudWatch Logs: AWS Console → CloudWatch → Log groups → `/aws/lambda/xmas-xpenses-*`
- Verify DynamoDB tables exist: AWS Console → DynamoDB → Tables
- Check Lambda IAM permissions include DynamoDB access

**Frontend can't connect to API:**
- Verify `VITE_API_URL` environment variable in Amplify
- Check CORS headers in Lambda response
- Test API directly: `curl https://YOUR-API.execute-api.us-east-1.amazonaws.com/Prod/api/health`

### Amplify Deployment

**Build fails:**
- Check build logs in Amplify Console
- Verify `VITE_API_URL` environment variable is set
- Ensure `npm install` completes successfully

**App loads but no data:**
- Open browser DevTools → Network tab
- Check API calls are going to correct endpoint
- Verify CORS headers in responses

## Security Notes

- API currently has no authentication (public)
- Consider adding AWS Cognito for family-only access
- API URL is stored in environment variables (not in code)
- `.env` files are gitignored to prevent secret exposure

## Next Steps

Potential enhancements:
- ✅ Budget management by year
- ✅ Expense tracking with budget linking
- ✅ Dashboard with filtering
- 🔲 User authentication (AWS Cognito)
- 🔲 Expense editing capability
- 🔲 Data export (CSV, PDF)
- 🔲 Charts and analytics
- 🔲 Budget templates
- 🔲 Receipt photo upload (S3)
- 🔲 Email notifications for budget alerts

## Support

- **Application Issues**: Check troubleshooting section above
- **AWS Service Issues**: [AWS Documentation](https://docs.aws.amazon.com/)
- **GitHub Issues**: Report bugs or request features in repository issues

---

Built with ❤️ and ☁️ (AWS)
