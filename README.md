## PRJECT STRUCTURE

SDG-Connect/
│
├── backend/                          # Node.js + Express backend
│   ├── src/
│   │   ├── config/                   # DB connection, environment configs
│   │   │   └── db.js
│   │   ├── middleware/               # Auth, error handling, etc.
│   │   │   ├── authMiddleware.js
│   │   │   └── errorHandler.js
│   │   ├── models/                   # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   ├── Resource.js
│   │   │   ├── Event.js
│   │   │   └── Donation.js
│   │   ├── routes/                   # Express routes
│   │   │   ├── authRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── resourceRoutes.js
│   │   │   ├── donationRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   ├── controllers/              # Logic for routes
│   │   │   ├── authController.js
│   │   │   ├── projectController.js
│   │   │   ├── resourceController.js
│   │   │   ├── donationController.js
│   │   │   └── dashboardController.js
│   │   ├── utils/                    # Helper functions (e.g., email, JWT)
│   │   │   ├── jwtUtils.js
│   │   │   ├── emailService.js
│   │   │   └── geospatialUtils.js
│   │   └── app.js                    # Express app setup
│   ├── .env                          # Environment variables
│   ├── package.json
│   └── server.js                     # Entry point
│
├── frontend/                         # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/               # Reusable UI components
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   ├── ProjectCard.js
│   │   │   └── SDGTag.js
│   │   ├── pages/                    # Page components
│   │   │   ├── Home.js
│   │   │   ├── Projects.js
│   │   │   ├── Resources.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── AdminPanel.js
│   │   ├── context/                  # Context API or Redux setup
│   │   │   └── AuthContext.js
│   │   ├── services/                 # Axios API calls
│   │   │   ├── api.js
│   │   │   └── projectService.js
│   │   ├── hooks/                    # Custom hooks (e.g., useAuth)
│   │   ├── assets/                   # Images, logos, icons
│   │   ├── App.js
│   │   ├── index.js
│   │   └── styles/                   # Global and module CSS
│   │       └── main.css
│   ├── package.json
│   └── .env
│
├── docs/                             # Documentation (diagrams, API docs)
│   ├── architecture-diagram.png
│   ├── ER-diagram.png
│   └── API-spec.md
│
├── README.md                         # Main project documentation
└── package.json                      # Optional root-level config (for both)


## PROJECT DESCRIPTION

# 🌍 SDG Connect
**A Local Action & Resource Platform for the UN Sustainable Development Goals (SDGs)**  
Built using the **MERN Stack (MongoDB, Express.js, React, Node.js)**

---

## 📖 Overview
**SDG Connect** is a web platform that empowers communities, NGOs, and businesses to collaborate on sustainable projects aligned with the **United Nations Sustainable Development Goals (SDGs)**.  
The platform facilitates **volunteer matching, project collaboration, resource sharing, and real-time impact tracking**.

---

## 🎯 Objectives
- Connect **Volunteers**, **Organizations**, and **Businesses** to local SDG initiatives.
- Enable **transparent resource and project management**.
- Track and visualize the **collective impact** of community actions.

---

## 🧱 Tech Stack
| Layer | Technology | Purpose |
|--------|-------------|----------|
| **Frontend** | React.js | User interface, dashboards, SDG visualizations |
| **Backend** | Node.js + Express.js | API endpoints, authentication, business logic |
| **Database** | MongoDB | Store users, projects, resources, and donations |
| **Auth** | JWT (JSON Web Token) | Secure authentication & role-based access |
| **Optional** | Socket.IO, Stripe API, D3.js | Real-time updates, payments, and data visualization |

---

## 👥 User Roles
1. **Volunteer/Individual** – Discover projects, log volunteer hours, donate.
2. **Organization (NGO/School)** – Post projects, request resources, manage events.
3. **Business** – Offer surplus materials or services, sponsor projects.
4. **Admin** – Manage users, monitor SDG alignment, oversee platform metrics.

---

## 🌐 Core Features

| Feature | Description | SDGs Covered |
|----------|--------------|--------------|
| **Project/Need Postings** | Organizations can post SDG-tagged projects needing volunteers or funding. | 4, 6, 11, 15 |
| **Volunteer Matching** | Filter projects by location, skill, or SDG preference. | 8, 17 |
| **Resource & Asset Exchange** | Businesses offer resources or services to NGOs. | 2, 9, 12 |
| **Impact Dashboard** | Visualize community progress by SDG metrics. | 1, 17 |
| **Secure Authentication** | Role-based access using JWT and email verification. | 16 |

---

## 🚀 Advanced Features (Stretch Goals)
- **Geospatial Search** – Find nearby SDG projects using MongoDB GeoJSON.
- **Stripe Payment Integration** – Direct donations for projects.
- **Real-Time Notifications** – Live updates with Socket.IO.
- **Data Visualization** – Interactive impact charts using D3.js or Recharts.

---

## 🧩 Folder Structure
See [Project Structure](#) for full breakdown.  
- `/backend` → API & database  
- `/frontend` → React UI  
- `/docs` → Diagrams & documentation  

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository
```bash
git clone https://github.com/yourusername/SDG-Connect.git
cd SDG-Connect
