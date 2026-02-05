# MongoDB Setup Guide for Windows

This guide will help you install and configure MongoDB Community Edition on Windows for the One-Prompt Google Form Creator.

## Installation

### 1. Download MongoDB

1. Visit [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Select:
   - **Version**: Latest (e.g., 7.0.x)
   - **Platform**: Windows
   - **Package**: MSI
3. Click **Download**

### 2. Install MongoDB

1. Run the downloaded `.msi` installer
2. Choose **Complete** installation
3. **Important**: Check "Install MongoDB as a Service"
   - Service Name: `MongoDB`
   - Data Directory: `C:\Program Files\MongoDB\Server\7.0\data\`
   - Log Directory: `C:\Program Files\MongoDB\Server\7.0\log\`
4. **Optional**: Uncheck "Install MongoDB Compass" (GUI tool, not required)
5. Complete the installation

### 3. Verify Installation

Open PowerShell or Command Prompt and run:

```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# Should show:
# Status   Name               DisplayName
# ------   ----               -----------
# Running  MongoDB            MongoDB
```

### 4. Test Connection

```powershell
# Connect to MongoDB shell
mongosh

# You should see:
# Current Mongosh Log ID: ...
# Connecting to: mongodb://127.0.0.1:27017/
# Using MongoDB: 7.0.x
```

Type `exit` to quit the shell.

## Managing MongoDB Service

### Start MongoDB
```powershell
net start MongoDB
```

### Stop MongoDB
```powershell
net stop MongoDB
```

### Restart MongoDB
```powershell
net stop MongoDB
net start MongoDB
```

## Database Setup

The application will automatically create the database and collections on first run. However, you can verify manually:

```powershell
# Connect to MongoDB
mongosh

# Switch to the application database
use google_forms_creator

# List collections (will be empty initially)
show collections

# After running the app, you should see:
# - sessions
# - oauth_tokens
# - form_history
```

## MongoDB Compass (Optional GUI)

If you want a visual interface:

1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Install and open
3. Connect to: `mongodb://localhost:27017`
4. Browse your `google_forms_creator` database

## Troubleshooting

### Service Won't Start

**Error**: "The MongoDB service failed to start"

**Solution**:
1. Check data directory exists: `C:\Program Files\MongoDB\Server\7.0\data\`
2. Check log file: `C:\Program Files\MongoDB\Server\7.0\log\mongod.log`
3. Ensure no other MongoDB instance is running on port 27017

### Connection Refused

**Error**: "MongoServerError: connect ECONNREFUSED 127.0.0.1:27017"

**Solution**:
```powershell
# Verify service is running
Get-Service MongoDB

# If stopped, start it
net start MongoDB
```

### Port Already in Use

**Error**: "Address already in use"

**Solution**:
```powershell
# Find process using port 27017
netstat -ano | findstr :27017

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

## Uninstall MongoDB

If you need to remove MongoDB:

1. Stop the service: `net stop MongoDB`
2. Uninstall via Windows Settings → Apps
3. Manually delete data directory if needed

## Next Steps

Once MongoDB is installed and running, proceed to the main [README.md](README.md) to set up the backend and frontend.
