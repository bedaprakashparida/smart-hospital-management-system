# 🏥 HealthConnect: Smart Patient Triage & Appointment System

A modern, fast, and responsive React SPA (Single Page Application) designed to simplify patient triage, health query submission, and appointment booking. Featuring a sophisticated context-based smart auto-assignment engine and an Enterprise Admin/Doctor dashboard.

## ✨ Key Features

### 🧑‍⚕️ Patient Hub
- **Smart Triage Engine**: Patients can submit health queries by describing their symptoms. The system uses a rule-based engine to determine urgency (e.g., flagging "chest pain" as High Urgency).
- **Auto-Assignment**: The Smart Engine automatically identifies the correct medical department based on symptoms (e.g., "rash" -> Dermatologist) and suggests the next available doctor and time slot.
- **Easy Booking**: Patients can manually request specific appointment dates and time slots.
- **Real-Time Status Tracking**: Dynamic dashboard to track Pending, Approved, and Rejected application statuses. Displays the assigned doctor upon approval.

### ⚕️ Doctor Portal
- **Dedicated Role Access**: Doctors can create accounts and manage their own profiles.
- **Availability Management**: Doctors can set their active Department, Working Days (Mon-Sun), and Time Slots (Morning, Afternoon, Evening). Changes instantly reflect in the global booking engine.
- **Appointment Review**: A streamlined view for doctors to see exactly which patients have been assigned to them.

### 🏢 Admin Control Tower
- **Global Overview**: Real-time metrics for Total Queries, Appointments Today, Emergency Cases, and Doctors On Duty.
- **Request Moderation**: Approve, reject, or re-route patient queries and appointments.
- **Manual Assignment**: Override auto-assignments by manually selecting active doctors from a refined dropdown list.
- **Enteprise Doctor Matrix**: A dynamic timetable allowing Admins to search for Doctor availability based on specific Departments and Days, computing real-time staff presence.

## 🛠️ Technology Stack
- **Frontend Framework**: React 18 + Vite
- **Routing**: React Router DOM (Protected Routes & Role-Based Access Control)
- **State Management**: React Context API (`AppContext`, `AuthContext`)
- **Persistence**: Browser `LocalStorage` (Simulating a backend DB)
- **Styling**: Vanilla CSS (Modern Variables, Glassmorphism, CSS Grid)
- **Icons**: SVG embedded components

## 🚀 Installation & Setup

1. **Clone the repository** (or download the source code):
   ```bash
   git clone [repository-url]
   cd HealthConnect
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   Open `http://localhost:5173` in your web browser.

### 🔑 Default Test Accounts
For testing the Role-Based Access Control (RBAC), you can use the following mock accounts or register new ones:
- **Admin Access**: 
  - Email: `admin@hospital.com`
  - Password: `admin`
- **Doctor Access**: Register a new account and select "Doctor" from the role dropdown.
- **Patient Access**: Register a new account and select "Patient" from the role dropdown.

---

## 🏗️ Total Database Structure (Professional Architecture)

*Note: While the frontend currently uses LocalStorage Context API for rapid prototyping and demonstration, this is the intended strictly relational schema architecture designed for a scalable, real-world deployment.*

