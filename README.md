# 🏡 Panchayat Management System

A full-stack **MERN application** designed to digitize and streamline society management — including complaints, service bookings, announcements, notifications, and AI chatbot support.

🌐 **Live Demo**: https://panchayat-app-five.vercel.app
⚙️ **Backend API**: https://panchayat-app-djx9.onrender.com

---

## 🚀 🔥 Features

### 👤 User Features

- 🔐 Secure Authentication (JWT-based)
- 📝 Raise complaints with file upload
- 🎤 Voice-enabled complaint submission
- 📊 Track complaint status (Pending / Resolved)
- 🛠️ Book home services (Plumber, Electrician, etc.)
- 📩 Email notifications (Welcome, Booking, Status updates)
- 🔔 Real-time notifications panel
- 🤖 AI Chatbot for assistance

---

### 🧑‍💼 Admin Features

- 📊 Advanced Analytics Dashboard (Charts & Graphs)
- 📋 Manage all complaints
- 🔄 Update complaint status
- 🛠️ Manage services & bookings
- 📢 Post & schedule announcements
- 📚 Upload rulebook (PDF parsing)
- 📬 Email alerts to users

---

## 🧠 Tech Stack

### 💻 Frontend

- React.js (Vite)
- Tailwind CSS
- React Router
- Axios
- Chart.js

### ⚙️ Backend

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer (file uploads)
- Nodemailer (email system)

### 🤖 AI & Extras

- OpenRouter API (Chatbot)
- Speech-to-Text (Voice input)
- PDF parsing (Rulebook system)

---

## 📁 Project Structure

```bash
PANCHAYAT/
│
├── Backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   ├── uploads/
│   ├── config/
│   ├── app.js
│   └── server.js
│
├── Frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── routes/
│   │   ├── services/
│   │   └── context/
│
└── README.md
```

---

## ⚙️ 🔧 Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/panchayat-app.git
cd panchayat-app
```

---

### 2️⃣ Backend Setup

```bash
cd Backend
npm install
```

Create `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL="Panchayat Support <your_email@gmail.com>"
```

Run backend:

```bash
npm start
```

---

### 3️⃣ Frontend Setup

```bash
cd Frontend
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

---

## 🌐 Deployment

### 🚀 Frontend (Vercel)

- Connected via GitHub
- Environment variable:

```env
VITE_API_URL=https://panchayat-app-djx9.onrender.com/api
```

### ⚙️ Backend (Render)

- Node.js Web Service
- Build Command: `npm install`
- Start Command: `npm start`

---

## 🔐 Authentication & Security

- JWT-based authentication
- Role-based access control (Admin/User)
- Protected routes (frontend + backend)
- CORS configured for production

---

## 📊 Dashboard Analytics

- Total complaints
- Resolved & Pending %
- Service usage chart
- Complaint category distribution
- Monthly trends

---

## 📧 Email System

- Welcome email on registration
- Complaint status updates
- Booking confirmation emails

---

## 🧪 API Endpoints

```bash
POST /api/auth/register
POST /api/auth/login

POST /api/complaints
GET /api/complaints

GET /api/services
POST /api/bookings

POST /api/chat
GET /api/admin/dashboard
```

---

## 🔮 Future Enhancements

- 🔔 Real-time notifications (Socket.io)
- 📱 SMS integration
- 💳 Payment gateway (Razorpay/Stripe)
- 🌙 Dark mode UI
- 📈 Advanced analytics & reports

---

## 👨‍💻 Author

**Rohit Yadav**

- Full Stack Developer (MERN)
- Passionate about scalable web applications

---

## ⭐ Support

If you like this project:

- ⭐ Star the repository
- 🍴 Fork it
- 🤝 Contribute

---

## 📜 License

This project is licensed under the MIT License.
