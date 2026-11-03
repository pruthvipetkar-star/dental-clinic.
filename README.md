# 🦷 Dental Clinic Website

A modern, responsive and customizable dental clinic website template designed to help dental clinics manage their online presence and patient appointments.

## ✨ Features

- Premium and responsive website design
- Online appointment booking system
- Backend appointment management
- Email notifications
- Admin login and session management
- Admin dashboard
- Appointment status updates
- Search and filter appointments
- CSV appointment export
- Mobile-friendly interface

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript
- Node.js
- Nodemailer
- JSON file storage

## 📁 Project Structure

```text
dental-clinic/
├── data/
├── lib/
├── public/
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone <YOUR-REPOSITORY-SSH-URL>
```

### 2. Open the project folder

```bash
cd dental-clinic
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file using `.env.example` as a reference.

Add your own email and admin configuration.

### 5. Start the server

```bash
node server.js
```

### 6. Open the website

Visit:

`http://localhost:3000`

## 🔐 Security

- Environment variables keep private configuration separate.
- Appointment data is excluded from Git.
- Admin routes require authentication.
- Admin sessions are managed by the server.

## 🎯 Project Goal

To create a reusable and customizable dental clinic website template that can be adapted for multiple dental clinics.

## 👨‍💻 Developer

Developed as a web development project using frontend and backend technologies.

---

**Note:** Configure your own environment variables before running the application. Never upload `.env` or private credentials to GitHub.