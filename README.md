# Task Manager App - AWS EC2 Deployment Guide

This guide details the steps taken to deploy our MERN (MongoDB, Express, React, Node.js) Task Manager application onto a single AWS EC2 instance. 

Instead of using Nginx, this deployment configures the Node.js/Express backend to serve the compiled static files of the React frontend, running everything securely on port 5000.

## Prerequisites
- An AWS Account
- A MongoDB database (MongoDB Atlas recommended)
- Your project pushed to a GitHub repository

---

## Step 1: AWS EC2 Provisioning

1. **Launch an EC2 Instance:**
   - **OS:** Ubuntu 22.04 LTS or 24.04 LTS
   - **Instance Type:** `t2.micro` (Free Tier eligible)
   - **Key Pair:** Create and download a `.pem` file for SSH access.
2. **Configure Security Group (Network Settings):**
   - Allow **SSH** (Port 22) from anywhere.
   - Allow **HTTP/HTTPS** traffic.
   - **Crucial:** Add a **Custom TCP Rule** for **Port 5000** (Source: `0.0.0.0/0`) to allow web traffic to the application.

---

## Step 2: Server Configuration

Open your local terminal and SSH into your EC2 instance using the downloaded key pair:

# Update packages
sudo apt update && sudo apt upgrade -y

# Install Git
sudo apt install git -y

# Install Node.js using NVM (Node Version Manager)
curl -o- [https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh](https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh) | bash
source ~/.bashrc
nvm install --lts

# Clone the repository
git clone [https://github.com/your-username/task-manager-lp2.git](https://github.com/your-username/task-manager-lp2.git)
cd task-manager-lp2

# Build the Frontend
cd frontend
npm install
npm run build

cd ../backend
npm install

# Create a .env file to hold your port and database connection string:
nano .env

Add the following:
PORT=5000
MONGODB_URI=mongodb+srv://<your-username>:<your-password>@cluster.mongodb.net/taskmanager

## ⚠️ Important: The Express 5 Routing Fix
To allow Express to serve the React application, we added static file serving to backend/index.js.
Because this project uses Express v5, the traditional wildcard route app.get('*') causes a crash (PathError: Missing parameter name). We fixed this by updating the wildcard to a Regular Expression (/.*/).
Added to the bottom of backend/index.js (before app.listen):

JavaScript
const path = require('path');

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Express 5 Catch-all route using Regex (Fixes '*' PathError)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// Ensure app binds to 0.0.0.0 for external access
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

Or instead use Express-4 version instead of 5
1) In backend folder -
   npm uninstall express
   npm install express@4
   npm list express

## Step 5: Running the App with PM2

# Install PM2 globally using sudo
sudo npm install -g pm2

# Start the application
pm2 start index.js --name "task-manager-api"

# Configure PM2 to restart on server reboot
pm2 startup
# (Run the specific command PM2 outputs on the screen)

# Save the current list of processes
pm2 save


```bash
chmod 400 your-key.pem
ssh -i "your-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
