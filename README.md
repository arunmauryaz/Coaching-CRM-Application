# Coaching CRM - Complete Student Management System

A comprehensive Customer Relationship Management (CRM) application specifically designed for coaching institutes and educational organizations. Built with React, TypeScript, and Tailwind CSS, this application provides a complete solution for managing students, batches, attendance, billing, inquiries, and financial ledgers.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.x-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-4.x-blue.svg)

## 🚀 Features

### 📊 Dashboard
- **Real-time Analytics**: View key metrics including total students, active batches, attendance rates, and revenue
- **Quick Stats**: Instant overview of your coaching business performance
- **Recent Activities**: Track recent enrollments, payments, and attendance
- **Reminder System**: Built-in alerts for important dates and tasks

### 👥 Student Management
- **Comprehensive Student Profiles**: Store detailed information including:
  - Multiple phone numbers
  - Complete address
  - Roll number
  - Multiple batch enrollments
  - Student status (Active/Left)
- **Multi-Batch Enrollment**: Students can be enrolled in multiple batches simultaneously
- **Advanced Search**: Quick search functionality to find students instantly
- **Student Details View**: Dedicated page showing complete student information, attendance history, and fee records

### 📚 Batch Management
- **Batch Creation & Organization**: Create and manage multiple batches
- **Batch Details**: Track all students enrolled in each batch
- **Batch Descriptions**: Add detailed information about each batch
- **Student Count**: Real-time tracking of students per batch

### 📅 Attendance Management
- **Calendar-Based Interface**: Easy date selection for marking attendance
- **Batch-wise Tracking**: Mark attendance for entire batches at once
- **Individual Records**: Track present/absent status for each student
- **Attendance Investigation**: Advanced analytics tool to:
  - Filter by batch and date range
  - Calculate attendance percentages
  - View detailed attendance patterns
  - Export attendance reports

### 💰 Billing & Fee Management
- **Modern Receipt System**: Professional fee receipt generation
- **Customizable Templates**: Design receipts with your branding
  - Business logo upload
  - Contact information
  - Layout customization (Left-aligned/Centered)
- **Receipt Management**: 
  - Create, edit, and view receipts
  - Track payments and due amounts
  - Automatic receipt numbering
  - Print-ready format
- **Payment Tracking**: Monitor paid and due amounts per student
- **Receipt Template**: Customize receipt appearance with business details

### 🔍 Inquiry Management System
Comprehensive four-section inquiry management:

#### 1. **Basic Inquiries**
- Record new student inquiries
- Track contact information
- Manage inquiry status (Pending/Admitted/Rejected)
- Convert inquiries to students

#### 2. **Demo Class Management**
- Schedule demo classes for prospective students
- Two duration types:
  - **Fixed Days**: Set number of days (e.g., 7 days demo)
  - **Fixed Date**: Specific start and end dates
- Auto-calculate end dates
- Track demo status (Active/Admitted/Expired)
- Batch assignment for demo students

#### 3. **Holiday Management**
- Record student holidays/leaves
- Set start and end dates
- Add reason for leave
- Track holiday status (Active/Completed)
- Filter by student

#### 4. **Alerts & Reminders**
- Create custom reminders
- Urgency levels (Low/Moderate/High)
- Color-coded alerts
- Mark as read/unread
- Date and time tracking

### 📒 Ledger Management
- **Account Creation**: Create ledger accounts for people or entities (e.g., staff members, vendors)
- **Transaction Tracking**:
  - Credit entries (+) - Money given/received (Green)
  - Debit entries (-) - Money taken/paid (Red)
- **Balance Calculation**: Real-time balance tracking for each account
- **Transaction History**: Complete audit trail of all entries
- **CSV Export**: Export individual ledger accounts to CSV format
- **Summary Dashboard**: View total credits, debits, and balance at a glance

### 🔐 Authentication & User Management
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full access to all features
  - **Teacher**: Limited access with passcode-based login
- **Permission System**: Granular control over feature access
  - Dashboard, Students, Batches, Attendance, Billing, Inquiry, Management, Settings
- **Multiple Admin Support**: Create multiple admin accounts
- **Teacher Passcode**: 4-digit passcode for quick teacher login
- **User Management**: Add, edit, and manage users with custom permissions
- **Security**: Cannot delete yourself or the last admin

### 🗑️ Trash & Recovery
- **Safe Deletion**: Deleted items moved to trash instead of permanent deletion
- **Complete Data Preservation**: Related data (attendance, fees) stored with deleted items
- **One-Click Restore**: Restore students or batches with all their data intact
- **Permanent Deletion**: Option to permanently delete items from trash

### ⚙️ Settings & Customization
- **Dark/Light Mode**: Toggle between themes with persistence
- **Organization Settings**: Customize organization name
- **Data Export/Import**: 
  - Complete JSON backup of all data
  - Import previous backups
  - Disaster recovery support
- **User Management** (Admin only): Manage staff accounts and permissions

### 📱 Responsive Design
- **Mobile-Friendly**: Fully responsive design works on all devices
- **Hamburger Menu**: Mobile navigation for smaller screens
- **Touch-Optimized**: Easy to use on tablets and smartphones
- **Adaptive Layouts**: UI adjusts perfectly to different screen sizes

## 🛠️ Technology Stack

- **Frontend Framework**: React 18.x
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4.0
- **UI Components**: Custom component library with shadcn/ui patterns
- **Icons**: Lucide React
- **Charts**: Recharts (for analytics)
- **Notifications**: Sonner
- **Data Storage**: localStorage (with Supabase migration support)
- **Build Tool**: Vite
- **Routing**: React Router (Data mode)

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/arunmauryaz/Coaching-CRM-Application.git
   cd coaching-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   Navigate to http://localhost:5173
   ```

## 🔑 Default Login Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`

> ⚠️ **Important**: Change the default admin password immediately after first login for security.

## 📖 Usage Guide

### Getting Started

1. **Login**: Use the default admin credentials to log in
2. **Create Batches**: Navigate to Batches and create your first batch
3. **Add Students**: Go to Students and add student information
4. **Enroll Students**: Assign students to batches during creation or edit
5. **Mark Attendance**: Use the Attendance section to track daily attendance
6. **Generate Receipts**: Create fee receipts in the Billing section
7. **Manage Inquiries**: Track prospective students in the Inquiry section

### Creating a Student

1. Click **Students** in the sidebar
2. Click **Add Student** button
3. Fill in the required information:
   - Name
   - Roll Number
   - Phone Numbers (can add multiple)
   - Address
   - Select Batches (can select multiple)
4. Click **Add Student**

### Marking Attendance

1. Navigate to **Attendance**
2. Select a batch from the dropdown
3. Choose a date using the calendar
4. Mark each student as Present/Absent
5. Click **Save Attendance**

### Generating Fee Receipts

1. Go to **Billing** section
2. Click **Create Receipt**
3. Select student and batch
4. Enter amount paid and due amount
5. Add optional notes
6. Click **Generate Receipt**
7. View, print, or download the receipt

### Managing Ledger Accounts

1. Navigate to **Management → Ledger**
2. Click **Add Account** to create a new ledger
3. Enter account name (e.g., "Mohan", "Petty Cash")
4. Click **Add Entry** to record transactions
5. Select transaction type (Credit/Debit)
6. Enter amount, date, and description
7. Export ledger to CSV for external use

### Creating Teachers with Limited Access

1. Go to **Settings → Users** (Admin only)
2. Click **Add User**
3. Enter username and 4-digit passcode
4. Select role: **Teacher**
5. Configure permissions (default is Attendance only)
6. Teachers can login using their passcode on the main login screen

### Data Backup & Restore

#### Export Data
1. Navigate to **Settings**
2. Scroll to **Data Management**
3. Click **Export All Data**
4. Save the JSON file securely

#### Import Data
1. Navigate to **Settings**
2. Click **Import Data**
3. Select your backup JSON file
4. Confirm the import (this will replace current data)

## 💾 Data Structure

All data is stored in localStorage with the following keys:

- `crm_batches` - Batch information
- `crm_students` - Student profiles
- `crm_attendance` - Attendance records
- `crm_fees` - Fee payment records
- `crm_receipts` - Generated receipts
- `crm_receipt_template` - Receipt customization
- `crm_trash` - Deleted items
- `crm_reminders` - Alerts and reminders
- `crm_users` - User accounts
- `crm_auth_state` - Authentication state
- `crm_inquiries` - Basic inquiries
- `crm_demo_students` - Demo class records
- `crm_holidays` - Student holiday records
- `crm_ledger_accounts` - Ledger accounts
- `crm_ledger_entries` - Ledger transactions
- `crm_theme` - Theme preference
- `crm_org_name` - Organization name

## 🎨 Customization

### Changing Organization Name
1. Go to **Settings**
2. Update **Organization Name** field
3. Click **Save**

### Customizing Receipt Template
1. Navigate to **Billing → Receipt Template**
2. Upload your business logo
3. Enter business details (name, address, phone, email)
4. Select layout preference
5. Save changes

### Theme Customization
- Toggle between Light/Dark mode in **Settings**
- Theme preference is saved automatically
- Customize colors in `/styles/globals.css`

## 🔒 Security Features

- Role-based access control
- Password-protected admin accounts
- Passcode-protected teacher accounts
- Cannot delete the last admin
- Cannot delete your own account while logged in
- Session persistence
- Data validation and sanitization

## 🚧 Future Enhancements

- [ ] Supabase backend integration
- [ ] Real-time data synchronization
- [ ] SMS/Email notifications
- [ ] Advanced reporting and analytics
- [ ] Student performance tracking
- [ ] Exam and assignment management
- [ ] Parent portal
- [ ] Online payment integration
- [ ] Automated attendance via QR codes
- [ ] Mobile app (React Native)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports

If you discover any bugs, please create an issue on GitHub with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)
- Browser and OS information

## 💬 Support

For support and questions:
- Create an issue on GitHub
- Check existing issues for solutions
- Review the documentation

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Charts by [Recharts](https://recharts.org/)

## 📸 Screenshots

![Screenshot](https://raw.githubusercontent.com/arunmauryaz/Coaching-CRM-Application/main/images/Screenshot%202026-03-14%20220643.png)

**Made with ❤️ for coaching institutes**

**Note**: This application uses localStorage for data persistence. For production use with multiple users or cloud backup, consider integrating with a backend service like Supabase.
