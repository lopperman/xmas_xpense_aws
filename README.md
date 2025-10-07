# 🎄 Xmas Xpenses

A simple holiday expense tracking app built with React and Python, designed to run on AWS.

## Architecture

- **Frontend**: React with Vite (deployable to AWS Amplify)
- **Backend**: Python Flask (local) / AWS Lambda (production)
- **Database**: In-memory (local) / DynamoDB (production)
- **API**: REST API via API Gateway (production)

## Local Development Setup

### Prerequisites

- Node.js (v18 or later)
- Python 3.11 or later
- pip (Python package manager)

### Running Locally

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cd ..
   ```

3. **Start the backend server:**
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python app.py
   ```
   Backend will run on http://localhost:5000

4. **In a new terminal, start the frontend:**
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:3000

5. **Open your browser:**
   Navigate to http://localhost:3000

## AWS Deployment

### Prerequisites

Before deploying to AWS, you need to install and configure:

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

2. **Configure AWS CLI with your credentials:**
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

   # Windows
   # Download from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

   # Linux
   # Follow instructions at the link above
   ```

### Deploy Backend to AWS

1. **Build the application:**
   ```bash
   sam build
   ```

2. **Deploy (first time - guided):**
   ```bash
   sam deploy --guided
   ```

   You'll be prompted for:
   - Stack Name: `xmas-xpenses`
   - AWS Region: Choose your preferred region (e.g., `us-east-1`)
   - Confirm changes before deploy: `Y`
   - Allow SAM CLI IAM role creation: `Y`
   - Disable rollback: `N`
   - Save arguments to configuration file: `Y`

3. **Deploy (subsequent deployments):**
   ```bash
   sam deploy
   ```

4. **Get your API endpoint:**
   After deployment, you'll see an output like:
   ```
   Outputs:
   ApiEndpoint: https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/Prod/
   ```
   Copy this URL!

### Deploy Frontend to AWS Amplify

1. **Update frontend to use AWS API:**

   Edit `src/App.jsx` and change the API_URL:
   ```javascript
   const API_URL = 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/Prod/api'
   ```

2. **Build the frontend:**
   ```bash
   npm run build
   ```

3. **Deploy to AWS Amplify:**

   Option A - Via AWS Console (easiest for beginners):
   - Go to AWS Amplify in the AWS Console
   - Click "New app" → "Host web app"
   - Choose "Deploy without Git provider"
   - Drag and drop your `dist` folder

   Option B - Via Git (recommended for production):
   - Push your code to GitHub
   - Go to AWS Amplify → "New app" → "Host web app"
   - Connect your GitHub repository
   - Build settings will be auto-detected
   - Add environment variable: `VITE_API_URL=your-api-endpoint`

### Cost Estimate

With AWS Free Tier:
- **DynamoDB**: 25 GB storage, 25 read/write capacity units (free)
- **Lambda**: 1M requests/month (free)
- **API Gateway**: 1M requests/month (free)
- **Amplify**: 1000 build minutes, 15 GB storage (free)

Expected cost after free tier: **$0-5/month** for light usage

## Features

- ✅ Add expenses with name, amount, category, and recipient
- ✅ View all expenses
- ✅ Delete expenses
- ✅ Calculate total spending
- ✅ Categories: Gifts, Decorations, Food & Drinks, Travel, Other

## Project Structure

```
xmas_xpense/
├── backend/
│   ├── app.py              # Flask app for local development
│   ├── lambda_handler.py   # Lambda handler for AWS
│   └── requirements.txt    # Python dependencies
├── src/
│   ├── App.jsx            # Main React component
│   ├── main.jsx           # React entry point
│   └── index.css          # Styles
├── template.yaml          # AWS SAM template
├── package.json           # Node dependencies
└── vite.config.js         # Vite configuration
```

## Troubleshooting

### Local Development

**Backend won't start:**
- Make sure Python virtual environment is activated
- Check that port 5000 isn't already in use

**Frontend can't connect to backend:**
- Verify backend is running on port 5000
- Check browser console for CORS errors

### AWS Deployment

**SAM deploy fails:**
- Verify AWS CLI is configured: `aws sts get-caller-identity`
- Check you have necessary IAM permissions
- Ensure you're in the project root directory

**API returns errors:**
- Check CloudWatch Logs in AWS Console
- Verify DynamoDB table was created
- Check Lambda function has correct IAM permissions

## Next Steps

Potential enhancements:
- Add user authentication (AWS Cognito)
- Add expense editing
- Add filtering and search
- Add budget limits and alerts
- Add data export (CSV, PDF)
- Add charts and analytics
- Support multiple users/families

## Support

For issues with this app, check the troubleshooting section above.

For AWS service issues, refer to [AWS Documentation](https://docs.aws.amazon.com/).
