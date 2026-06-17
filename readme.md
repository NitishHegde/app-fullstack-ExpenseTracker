├── client/                # Frontend React application
├── server/                # Backend Node.js API
│   ├── controllers/       # Logic for handling requests
│   ├── models/            # Database schemas
│   ├── routes/            # API endpoints
│   └── middleware/        # Auth and error handling
└── README.md
```

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/app-expenseTracker.git
   ```

2. **Install Dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

4. **Run the Application**
   ```bash
   # Run backend (from server folder)
   npm run dev

   # Run frontend (from client folder)
   npm start
   
## 📸 Screenshots

You can find visual previews of the application in the `screenshots/` directory:
- `dashboard.png` - Overview of expenses and charts
- `login.png` - User authentication page
- `add-expense.png` - Form for logging new transactions
