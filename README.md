# 💊 Omnichannel Pharmacy Operations Platform

**PharmaSync | All-in-One Operations & BI Hub for High-Performance Pharmacy Chains**

[![Next.js](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)](https://www.postgresql.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange)](https://deepmind.google/technologies/gemini/)

---

## 🚀 The Vision
Regional pharmacy chains often struggle with manual inventory management, disconnected sales data, and slow replenishment cycles. **PharmaSync** bridges the gap between digital efficiency and physical store operations. It's a modular, AI-powered platform designed to provide store managers, pharmacists, and supervisors with real-time insights and automated workflows.

## ✨ Core Features
- **🏪 Smart Store Management**: Real-time inventory tracking across multiple branches.
- **🤖 AI-Driven Replenishment**: Automated stock suggestions using **Google Gemini AI** to predict needs based on sales volume and local demand.
- **📊 BI Dashboards**: Interactive visualizations for sales trends, stock health, and revenue hotspots.
- **💊 Clinical Service Hub**: Secure digital prescription validation and pharmacist consultation tracking.
- **📦 Omnichannel Sales**: A unified interface for billing walk-in customers and managing online stock reserves.
- **🔐 Role-Based Access Control**: Granular permissions for Admin, Supervisor, Pharmacist, and Associate roles.

---

## 🏗️ Architecture

```mermaid
graph TD
    A[React + Vite Frontend] -->|Auth & API| B[FastAPI Backend]
    B -->|SQLAlchemy| C[(PostgreSQL/SQLite)]
    B -->|Generative AI| D[Google Gemini API]
    B -->|Real-time Analytics| E[BI Intelligence Engine]
    A -->|State Management| F[Zustand Store]
```

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, TailwindCSS, Axios, Chart.js (Lucide icons).
- **Backend**: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy.
- **Database**: PostgreSQL (Production) / SQLite (Development).
- **AI Integration**: Google Generative AI (Gemini Pro).
- **Deployment**: Vercel (Frontend), Render (Backend).

---

## 🏗️ Getting Started

### 1. Backend Setup
1. `cd backend`
2. Create a `.env` file from the example:
   ```env
   DATABASE_URL=postgresql://user:pass@host/db
   JWT_SECRET=your_secret_key
   GEMINI_API_KEY=your_gemini_key
   CORS_ORIGINS=["http://localhost:5173"]
   ```
3. `pip install -r requirements.txt`
4. `uvicorn app.main:app --reload`

### 2. Frontend Setup
1. `cd frontend`
2. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:8000/api/v1
   ```
3. `npm install`
4. `npm run dev`

---

## 🧪 Hackathon Demo Access
Use the following credentials to explore the different portals of the platform:

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin` | `admi123` | Full control, user management, store creation |
| **Store Supervisor** | `supervisor01` | `supervisor123` | BI dashboards, replenish history, analytics |
| **Pharmacist** | `pharmacist01` | `pharmacist123` | Prescription validation, clinical status |
| **Store Associate** | `associate01` | `associate123` | Billing, walk-in sales, stock search |

---

## 🏆 Key Innovation Highlights (For Judges)
- **Zero-Waste Inventory**: The Gemini AI integration suggests "Inter-Branch Transfers" instead of new purchases, reducing deadstock.
- **High-Density UI**: Optimized for pharmacists who need to see stock levels and shelf locations in seconds.
- **Scalability**: Sub-second API response times and robust data modeling for thousands of SKUs.

---
*Created for the Pharmacy Operations Hackathon 2024.*
