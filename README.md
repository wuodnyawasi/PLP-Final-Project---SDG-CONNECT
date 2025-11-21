# 🌍 SDG Connect

**A Local Action & Resource Platform for the UN Sustainable Development Goals (SDGs)**

Built using the **MERN Stack (MongoDB, Express.js, React, Node.js)**

---

## 📖 Overview

**SDG Connect** is a web platform that empowers communities, NGOs, and businesses to collaborate on sustainable projects aligned with the **United Nations Sustainable Development Goals (SDGs)**. The platform facilitates **volunteer matching, project collaboration, resource sharing, and real-time impact tracking**.

---

## 🎯 Objectives

- Connect **Volunteers**, **Organizations**, and **Businesses** to local SDG initiatives.
- Enable **transparent resource and project management**.
- Track and visualize the **collective impact** of community actions.

---

## 🧱 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: bcryptjs for password hashing, express-rate-limit for rate limiting
- **File Uploads**: Multer with Cloudinary integration
- **Email**: Nodemailer with Resend service
- **Payments**: M-Pesa STK Push integration
- **Validation**: express-validator
- **Testing**: Jest with Supertest
- **Linting**: ESLint

### Frontend
- **Library**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **Icons**: React Icons
- **Testing**: Vitest with @testing-library/react
- **Linting**: ESLint

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

---

## 👥 User Roles

1. **Volunteer/Individual** – Discover projects, log volunteer hours, donate.
2. **Organization (NGO/School)** – Post projects, request resources, manage events.
3. **Business** – Offer surplus materials or services, sponsor projects.
4. **Admin** – Manage users, monitor SDG alignment, oversee platform metrics.

---

## 🌐 Core Features

### Implemented Functionalities

| Feature | Description | SDGs Covered |
|----------|--------------|--------------|
| **User Authentication** | Secure registration/login with JWT, profile management, password hashing | 16 |
| **Project/Event Creation** | Organizations can create SDG-tagged projects with details, images, and requirements | 4, 6, 11, 15 |
| **Volunteer Matching** | Users can join projects, track participation, and mark attendance | 8, 17 |
| **Resource Sharing** | Businesses offer resources/services, users can provide resources to projects | 2, 9, 12 |
| **Donation System** | M-Pesa integrated donations with anonymous options and transaction tracking | 1, 17 |
| **Admin Dashboard** | Comprehensive admin panel for user/project/donation management | 16 |
| **Contact Form** | Email-based contact system with database storage | - |
| **Impact Tracking** | User dashboards showing completed projects, donations, and contributions | 17 |
| **File Uploads** | Cloudinary integration for profile pictures and project images | - |
| **Email Notifications** | Automated emails for donations and contact responses | - |

### Testing Conducted
- **Backend Tests**: Unit tests for authentication, project creation, and API endpoints using Jest
- **Frontend Tests**: Component tests using Vitest and React Testing Library
- **Integration Tests**: API endpoint testing with Supertest

---

## 🚀 Future Features (Stretch Goals)

- **Geospatial Search** – Find nearby SDG projects using MongoDB GeoJSON.
- **Stripe Payment Integration** – Additional payment options for international donations.
- **Real-Time Notifications** – Live updates with Socket.IO for project updates.
- **Data Visualization** – Interactive impact charts using D3.js or Recharts.
- **Mobile App** – React Native companion app.
- **Multi-language Support** – Localization for different regions.
- **Advanced Analytics** – Detailed SDG impact reporting and forecasting.

---

## 🧩 Project Structure

```
SDG-Connect/
│
├── backend/                          # Node.js + Express backend
│   ├── middleware/                   # Auth, error handling, validation, rate limiting, sanitization
│   ├── models/                       # Mongoose models (User, Project, Offer, etc.)
│   ├── routes/                       # API routes (handled in server.js)
│   ├── tests/                        # Jest tests for auth and projects
│   ├── utils/                        # Email utility functions
│   ├── uploads/                      # File upload directory
│   ├── package.json                  # Backend dependencies and scripts
│   └── server.js                     # Main server file with all API endpoints
│
├── frontend/                         # React frontend
│   ├── components/                   # Reusable UI components
│   │   ├── modal/                    # Various modal components (Login, Donation, etc.)
│   │   ├── Navbar/                   # Navigation component
│   │   ├── footer/                   # Footer component
│   │   └── ExplorerImages/           # SDG visualization components
│   ├── pages/                        # Page components (Home, About, Projects, etc.)
│   ├── src/                          # Main source directory
│   │   ├── assets/                   # Images and icons
│   │   ├── test/                     # Test utilities
│   │   ├── App.jsx                   # Main app component with routing
│   │   ├── index.css                 # Global styles
│   │   └── main.jsx                  # App entry point
│   ├── package.json                  # Frontend dependencies and scripts
│   ├── vite.config.js                # Vite configuration
│   └── vercel.json                   # Vercel deployment config
│
├── .gitignore                        # Git ignore rules
└── README.md                         # This file
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Cloudinary account (for image uploads)
- Resend account (for emails)
- M-Pesa developer account (for payments)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SDG-Connect.git
   cd SDG-Connect/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret-key
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   EMAIL_USER=your-email@resend.dev
   MPESA_CONSUMER_KEY=your-mpesa-consumer-key
   MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
   MPESA_BUSINESS_SHORTCODE=your-business-shortcode
   MPESA_PASSKEY=your-mpesa-passkey
   MPESA_ENVIRONMENT=sandbox
   BACKEND_URL=https://your-backend-url.onrender.com
   PORT=5000
   ```

4. **Run the backend**
   ```bash
   npm run dev  # Development mode with nodemon
   # or
   npm start    # Production mode
   ```

5. **Run tests**
   ```bash
   npm test
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
   ```

4. **Run the frontend**
   ```bash
   npm run dev  # Development server
   # or
   npm run build && npm run preview  # Build and preview
   ```

5. **Run tests**
   ```bash
   npm run test
   ```

### Deployment

- **Frontend**: Deployed on Vercel at `https://plp-final-project-sdg-connect.vercel.app`
- **Backend**: Deployed on Render at `https://plp-final-project-sdg-connect.onrender.com`

---

## 📊 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Projects
- `POST /api/projects` - Create new project
- `GET /api/projects` - Get user's projects
- `GET /api/projects/public` - Get public projects
- `PUT /api/projects/:id/status` - Update project status
- `POST /api/projects/:id/join` - Join a project
- `POST /api/projects/:id/resources` - Offer resources to project

### Donations
- `POST /api/donations/initiate-stk-push` - Initiate M-Pesa payment
- `GET /api/donations/stats` - Get donation statistics
- `GET /api/donations/recent` - Get recent donations

### Admin
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Manage users
- `GET /api/admin/projects` - Manage projects
- `GET /api/admin/donations` - Manage donations

### Other
- `POST /api/contact` - Send contact message
- `POST /api/offer` - Submit resource/service offer
- `GET /api/contributors` - Get contribution data
- `GET /api/user/impact` - Get user impact dashboard

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 📞 Contact

For questions or support, please contact us through the platform's contact form or email saoke97@gmail.com.

---

**Made with ❤️ for a sustainable future**
