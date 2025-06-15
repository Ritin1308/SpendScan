# 💰 SpendScan – Smart Expense Tracker with Receipt Scanner

SpendScan is a smart expense tracking web app that uses **Azure Form Recognizer** to extract information from receipt images and visualize spending.

## 🔧 Features
- Upload a receipt image to extract **Merchant Name**, **Date**, and **Total Amount**
- View all past expenses in a searchable, sortable table
- Filter by date and reset filters easily
- View total spending and interactive monthly chart

## 🛠️ Tech Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **AI Integration**: Azure Form Recognizer API
- **Other Tools**: Chart.js, Multer, dotenv, Git

## 🚀 How to Run
1. Clone the repo and run `npm install` in the `backend/` folder
2. Set up `.env` with Azure credentials and MongoDB URI
3. Run the server using `node server.js`
4. Open `frontend/index.html` in your browser

