# Room Wala 🕹️

Room Wala is a **Node.js + Express + MongoDB** based application to host and join **BGMI game rooms**.  
It provides authentication, admin-protected room management, and email-based confirmations for players.

---

## 🚀 Features
- 🔐 **Authentication**
  - User signup & login with JWT (stored in cookies)
  - Secure password hashing with bcrypt
  - Forgot/Reset password via email (Nodemailer + Gmail)

- 🏠 **Room Management**
  - Create and manage BGMI rooms (Solo / Duo / Squad)
  - Track joined players automatically
  - Prevent over-capacity joins

- 🛡️ **Admin Access**
  - Protected admin panel to manage rooms
  - Middleware-based authorization

- 📩 **Email Integration**
  - Automatic email sent to users when they join a room
  - Password reset emails

- 🎨 **UI**
  - Simple static frontend using HTML, CSS, and vanilla JS

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose
- **Auth:** JWT, bcryptjs
- **Email:** Nodemailer (Gmail service)
- **Frontend:** HTML, CSS, JavaScript

---

## 📂 Project Structure
