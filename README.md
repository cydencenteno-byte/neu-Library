# NEU Library Visitor Log System

A web-based library visitor tracking system for New Era University.

## 🔗 Live Application
https://neu-library-rho.vercel.app

## 🔗 GitHub Repository
https://github.com/cydencenteno-byte/neu-Library

---

## 📋 Features

### For Visitors (Students/Faculty/Staff)
- Register with NEU institutional email (@neu.edu.ph)
- Log in and select reason for visit
- View personal visit history with time in/out
- Exit library to record time out

### For Admin
- View visitor statistics (daily/weekly/monthly/total)
- Filter statistics by:
  - Reason for visiting
  - College
  - Visitor type (student/faculty/staff)
- Search visitors by name, role, or reason
- Filter by date range or custom dates
- Block/unblock users
- Export visitor report to PDF
- View who is currently inside the library
- Manage all registered users
- Change admin email and password

---

## 🛠️ Technologies Used
- HTML, CSS, JavaScript
- Supabase (PostgreSQL Database)
- Vercel (Web Hosting)
- GitHub (Version Control)

---

## 📁 Project Structure
InfoMa2/
├── adminLogin/     → Admin login page
├── adminPage/      → Admin dashboard
├── dboard/         → User dashboard (inside library)
├── Login/          → User login page
├── Registration/   → User registration page
├── WelcomPage/     → Welcome + reason for visit
└── supabase.js     → Supabase database connection

---

## 🗄️ Database Tables

### users
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| email | text | NEU institutional email |
| password | text | User password |
| first_name | text | First name |
| last_name | text | Last name |
| role | text | student/faculty/staff/admin |
| college | text | College (for students) |
| department | text | Department (for faculty) |
| position | text | Position (for staff) |
| is_blocked | boolean | Block status (default: false) |
| created_at | timestamp | Registration date |

### visits
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Reference to users table |
| reason | text | Reason for visiting |
| time_in | timestamp | Entry time |
| time_out | timestamp | Exit time |
| date | date | Visit date |

---

## 👤 Test Accounts

### Admin Accounts
- Email: admin@neu.edu.ph
- Password: admin1234
- Access: Admin Dashboard

-Email: jcesperanza@neu.edu.ph
-Password: admin123
Access: Admin Dashboard


### Regular User Account
- Email: admin@neu.edu.ph
- Password: faculty123

- Register at: /Registration/register.html
- Use any @neu.edu.ph email

---

## 🚀 How to Run Locally
1. Clone the repository:
   git clone https://github.com/cydencenteno-byte/neu-Library.git
2. Open with VS Code
3. Install Live Server extension
4. Right click Login/login.html → Open with Live Server

---

## 📱 How to Use

### As a Visitor
1. Go to the live URL
2. Register with your NEU email
3. Log in with your credentials
4. Select your reason for visiting
5. Click "Enter Library"
6. Click "Exit Library" when leaving

### As Admin
1. Click "Admin" button on login page
2. Log in with admin credentials
3. View dashboard statistics
4. Use filters to analyze visitor data
5. Export reports as PDF

---

## 👨‍💻 Developer
**Cyden Centeno**
New Era University - 2026
