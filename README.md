# Team Flow

A lightweight Trello/Notion hybrid for real-time team collaboration. Build boards, organize tasks, and see updates instantly across all team members.

![Architecture](https://img.shields.io/badge/React-TypeScript-blue?logo=react)
![Backend](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![Database](https://img.shields.io/badge/MongoDB-Ready-brightgreen?logo=mongodb)
![WebSocket](https://img.shields.io/badge/WebSocket-Socket.io-blue)

## Problem Statement

Teams need a lightweight, real-time collaboration tool to:
- Organize tasks on visual boards with lists and cards
- Collaborate synchronously with real-time updates
- Track activity and maintain audit logs
- Assign team members and discuss tasks

**Solution:** Team Flow delivers a modern task collaboration platform with full real-time synchronization, drag-and-drop task management, and team activity tracking.

## Key Features

### User & Authentication
- User signup and login with JWT tokens
- Secure password hashing with bcryptjs
- Protected routes and API endpoints
- User profile management

### Board Management
- Create, read, update, delete boards
- Multiple lists per board
- Complete CRUD operations

### Task Organization
- Create, update, delete tasks within lists
- **Drag-and-drop** tasks across lists (real-time sync)
- Task descriptions, labels, and due dates
- Task status tracking

### Collaboration Features
- Assign users to tasks
- Task comments and discussions
- Real-time updates via WebSockets
- Activity history tracking with complete audit trail
- Pagination and search functionality

### Technical Excellence
- Responsive API (28 endpoints)
- Proper error handling and validation
- CORS-enabled for local development
- Production-ready structure

## Technology Stack

### Frontend
- **React** - Modern UI framework
- **TypeScript** - Type-safe development
- **Redux Toolkit** - Predictable state management
- **ShadCN UI** - Premium component library
- **TailwindCSS** - Utility-first styling
- **Socket.io Client** - Real-time WebSocket communication
- **Axios** - HTTP client with interceptors
- **React Router** - Client-side navigation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - WebSocket server for real-time sync
- **JWT** - Secure token-based authentication
- **bcryptjs** - Password hashing

### Database
- **MongoDB** - Document-based storage
- **Collections:** Users, Boards, Lists, Tasks, Comments, Activities

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│               Frontend (React + TypeScript)                 │
│  • SPA with React Router navigation                         │
│  • Redux Toolkit for global state management                │
│  • Real-time sync via Socket.io Client                      │
│  • ShadCN UI components + TailwindCSS styling               │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP + WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────┐
│            Backend (Node.js + Express + Socket.io)          │
│  • RESTful API endpoints                                    │
│  • WebSocket server for real-time events                    │
│  • JWT + bcryptjs for authentication                        │
│  • Business logic controllers                               │
│  • Middleware for auth, error handling                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ MongoDB Driver
                       ▼
           ┌───────────────────────────┐
           │    MongoDB Database       │
           │  • Collections:           │
           │  • Indexes                │
           │  • Cloud or Local         │
           └───────────────────────────┘
```

## Quick Start (5 Minutes)

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or cloud like MongoDB Atlas)
- Git

### 1. Clone & Setup Backend

```bash
cd backend
npm install
# Copy and Edit .env.sample with your details
npm run dev
```

**Expected Output:**
```
Connected to MongoDB
Server running on http://localhost:3000
CORS enabled for http://localhost:5173
```

### 2. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Copy and Edit .env.sample with your details
npm run dev
```

**Expected Output:**
```
➜  Local:   http://localhost:5173/
```

### 3. Open in Browser

```
http://localhost:5173
```

## Developer Details

- Name: Abhishek Sharma