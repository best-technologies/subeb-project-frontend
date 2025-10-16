# ASUBEB School Management System

A comprehensive web-based student management system built with Next.js, designed for the Abia State Universal Basic Education Board (ASUBEB). This application provides administrators with powerful tools to manage schools, students, and educational data with a modern, responsive interface.

## 🚀 Features

### 📊 Dashboard Analytics

- **Real-time Statistics**: Total students, gender distribution, average scores
- **Performance Charts**: Subject performance, class performance, gender performance
- **Interactive Visualizations**: Collapsible charts with detailed analytics
- **Top Students Tracking**: Real-time ranking and performance metrics

### 👥 Student Management

- **Comprehensive Student Records**: Name, exam number, school, class, gender
- **Advanced Search & Filtering**: Search by name, exam number, school, or class
- **Sorting Capabilities**: Sort by any field (name, score, position, etc.)
- **Pagination**: Efficient handling of large datasets
- **Detailed Student Profiles**: Modal views with complete student information
- **Performance Analytics**: Total scores, averages, and class positions

### 🏫 School Management

- **School Directory**: Complete list of all schools in the system
- **School Statistics**: Student counts, performance metrics
- **LGA Integration**: Local Government Area organization
- **School Details**: Comprehensive school information and analytics

### 🎯 Key Functionalities

- **Responsive Design**: Mobile-first approach with modern UI
- **Real-time Data**: Live updates from backend API
- **Advanced Filtering**: Multi-criteria filtering system
- **Export Capabilities**: Data export functionality
- **User-friendly Interface**: Intuitive navigation and design

## 🛠️ Technology Stack

### Frontend

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React Hooks**: State management and side effects
- **Responsive Design**: Mobile-first approach

### Backend Integration

- **RESTful API**: Integration with backend services
- **Real-time Data**: Live dashboard updates
- **Error Handling**: Comprehensive error management
- **Loading States**: User-friendly loading indicators

### Development Tools

- **ESLint**: Code quality and consistency
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing
- **Git**: Version control

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Backend API server running

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd asubeb-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_API_VERSION=v1
   ```

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
asubeb-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── enter-grades/      # Grade entry functionality
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/
│   │   ├── dashboard/         # Dashboard components
│   │   │   ├── CollapsibleCharts.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   ├── SchoolsTab.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── StatsCards.tsx
│   │   │   ├── StudentsTab.tsx
│   │   │   └── StudentsTable.tsx
│   │   └── ui/               # Reusable UI components
│   ├── services/
│   │   ├── api.ts            # API client configuration
│   │   ├── hooks/
│   │   │   └── useAdminDashboard.ts
│   │   └── types/
│   │       └── adminDashboardResponse.ts
│   ├── types/
│   │   └── student.ts        # TypeScript type definitions
│   └── utils/
│       └── formatters.ts     # Text formatting utilities
├── public/                   # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration

### API Configuration

The application connects to a backend API for data management. Configure the API endpoints in `src/services/api.ts`:

```typescript
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "v1";
```

### Environment Variables

- `NEXT_PUBLIC_API_BASE_URL`: Backend API base URL
- `NEXT_PUBLIC_API_VERSION`: API version

## 📊 Data Models

### Student Data

```typescript
interface TopStudent {
  id: string;
  position: number;
  studentName: string;
  examNumber: string;
  gender: "MALE" | "FEMALE";
  totalScore: number;
  school: string;
  class: string;
}
```

### School Data

```typescript
interface School {
  id: string;
  name: string;
  code: string;
  level: string;
  totalStudents: number;
  totalTeachers: number;
}
```

### Dashboard Data

```typescript
interface AdminDashboardData {
  session: string;
  term: string;
  totalStudents: number;
  totalMale: number;
  totalFemale: number;
  schools: School[];
  classes: Class[];
  subjects: Subject[];
  topStudents: TopStudent[];
  lastUpdated: string;
}
```

## 🎨 UI/UX Features

### Design System

- **Modern Interface**: Clean, professional design
- **Responsive Layout**: Works on all device sizes
- **Dark Theme**: Easy on the eyes with proper contrast
- **Interactive Elements**: Hover effects and transitions
- **Accessibility**: WCAG compliant design

### Color Scheme

- **Primary**: Blue gradient (#3B82F6 to #8B5CF6)
- **Success**: Green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)
- **Background**: Dark gradient with glass morphism

### Typography

- **Font**: Geist Sans (optimized by Next.js)
- **Hierarchy**: Clear heading structure
- **Readability**: High contrast text

## 🔍 Usage Guide

### Dashboard Navigation

1. **Main Dashboard**: Overview of all statistics
2. **Students Tab**: Manage and view student records
3. **Schools Tab**: School management and analytics

### Student Management

1. **Search Students**: Use the search bar to find specific students
2. **Filter Options**: Filter by school, class, gender, or subject
3. **Sort Data**: Click column headers to sort data
4. **View Details**: Click "View Details" for comprehensive student information

### Data Export

- Export functionality for reports and analytics
- CSV format support
- Print-friendly layouts

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Setup

1. Set production environment variables
2. Configure API endpoints
3. Set up database connections
4. Configure SSL certificates

### Deployment Platforms

- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative deployment option
- **AWS**: Enterprise deployment
- **Docker**: Containerized deployment

## 🧪 Testing

### Running Tests

```bash
npm test
```

### Test Coverage

- Unit tests for components
- Integration tests for API calls
- E2E tests for user workflows

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards

- Follow TypeScript best practices
- Use ESLint for code quality
- Write meaningful commit messages
- Add documentation for new features

## 📝 API Documentation

### Endpoints

- `GET /api/v1/admin/dashboard`: Fetch dashboard data
- `GET /api/v1/students`: Get student records
- `GET /api/v1/schools`: Get school information

### Response Format

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    // Response data
  },
  "statusCode": 200
}
```

## 🔒 Security

### Authentication

- PIN-based access system
- Session management
- Role-based access control

### Data Protection

- HTTPS encryption
- Input validation
- XSS protection
- CSRF protection

## 📞 Support

### Getting Help

- Check the documentation
- Review existing issues
- Contact the development team

### Reporting Issues

- Use the issue tracker
- Provide detailed bug reports
- Include steps to reproduce

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **ASUBEB Team**: For requirements and feedback
- **Next.js Team**: For the excellent framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Open Source Community**: For various dependencies

---

**Built with ❤️ for ASUBEB School Management**
