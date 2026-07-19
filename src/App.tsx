import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { useEffect } from "react";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";
import { CommunityPage } from "./features/community/pages/CommunityPage";
import { StudentProfilePage } from "./features/students/pages/StudentProfilePage";
import { ClassesPage } from "./features/classes/pages/ClassesPage";
import { ClassDetailsPage } from "./features/classes/pages/ClassDetailsPage";
import { ReportsPage } from "./features/reports/pages/ReportsPage";
import { CalendarPage } from "./features/calendar/pages/CalendarPage";
import { ExamDetailsPage } from "./features/examinations/pages/ExamDetailsPage";
import { KnowYourStudentPage } from "./features/students/pages/KnowYourStudentPage";
import { AttendancePage } from "./features/classes/pages/AttendancePage";
import { CreateClassPage } from "./features/classes/pages/CreateClassPage";

import { AcademicHubPage } from "./features/academics/pages/AcademicHubPage";
import { DirectoryPage } from "./features/directory/pages/DirectoryPage";
import { EnrollStudentPage } from "./features/students/pages/EnrollStudentPage";
import { AddStaffPage } from "./features/directory/pages/AddStaffPage";
import { AddDriverPage } from "./features/directory/pages/AddDriverPage";
import { AddVehiclePage } from "./features/transportation/pages/AddVehiclePage";
import { CommunicationsHubPage } from "./features/communications/pages/CommunicationsHubPage";
import { AddNoticePage } from "./features/communications/pages/AddNoticePage";
import { TransportationHubPage } from "./features/transportation/pages/TransportationHubPage";
import { StaffProfilePage } from "./features/settings/pages/StaffProfilePage";
import { DriverProfilePage } from "./features/transportation/pages/DriverProfilePage";
import { FeesPage } from "./features/finance/pages/FeesPage";
import { CurriculumPage } from "./features/curriculum/pages/CurriculumPage";


import { AddExaminationPage } from "./features/examinations/pages/AddExaminationPage";
import { CreateQuizPage } from "./features/quizzes/pages/CreateQuizPage";
import { QuizViewPage } from "./features/quizzes/pages/QuizViewPage";
import { AddProgramPage } from "./features/programs/pages/AddProgramPage";
import { SettingsPage } from "./features/settings/pages/SettingsPage";
import { GradeConfigurationPage } from "./features/settings/pages/GradeConfigurationPage";
import { AcademicYearsPage } from "./features/settings/pages/AcademicYearsPage";
import { AppProvider } from "./lib/AppContext";
import { ToastProvider } from "./components/Toast";

const DashboardLayout = () => {
  return (
    <ProtectedRoute>
      <div className="bg-white text-foreground font-sans h-screen flex overflow-hidden w-full">
        <Sidebar />
        <main className="flex-1 flex overflow-hidden">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
};

function App() {
  useEffect(() => {
    // Initialize font size
    const savedFontSize = localStorage.getItem('pds-font-size') || 'theme-small';
    const themes = ['theme-small', 'theme-medium', 'theme-large', 'theme-xl'];
    themes.forEach(t => document.documentElement.classList.remove(t));
    document.documentElement.classList.add(savedFontSize);

    // Initialize dark mode
    if (localStorage.getItem('pds-dark-mode') === 'true') {
      document.documentElement.classList.add('dark');
    }

    // Initialize high contrast
    if (localStorage.getItem('pds-high-contrast') === 'true') {
      document.documentElement.classList.add('high-contrast');
    }

    // Initialize reduced motion
    if (localStorage.getItem('pds-reduced-motion') === 'true') {
      document.documentElement.classList.add('reduce-motion');
    }
  }, []);

  return (
    <AppProvider>
      <ToastProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/classes/create" element={<CreateClassPage />} />
          <Route path="/classes/:id" element={<ClassDetailsPage />} />
          <Route path="/attendance/:tab?" element={<AttendancePage />} />
          <Route path="/students/:id" element={<StudentProfilePage />} />
          
          {/* Specific Academic Routes (Higher Priority) */}
          <Route path="/academics/exams/add" element={<AddExaminationPage />} />
          <Route path="/academics/quizzes/add" element={<CreateQuizPage />} />
          <Route path="/academics/quizzes/:id/:tab?" element={<QuizViewPage />} />
          <Route path="/academics/programs/add" element={<AddProgramPage />} />
          <Route path="/academics/exams/:id" element={<ExamDetailsPage />} />
          
          {/* Hub and General Routes */}
          <Route path="/academics/:tab?/:sub?" element={<AcademicHubPage />} />
          <Route path="/directory/:tab?" element={<DirectoryPage />} />
          <Route path="/curriculum/:tab?" element={<CurriculumPage />} />
          <Route path="/directory/students/add" element={<EnrollStudentPage />} />
          <Route path="/directory/staff/add" element={<AddStaffPage />} />
          <Route path="/directory/drivers/add" element={<AddDriverPage />} />
          <Route path="/transportation/add-vehicle" element={<AddVehiclePage />} />
          <Route path="/communications/announcements/add" element={<AddNoticePage />} />
          <Route path="/communications/:tab?" element={<CommunicationsHubPage />} />
          <Route path="/transportation" element={<TransportationHubPage />} />
          <Route path="/finance" element={<FeesPage />} />
          <Route path="/staff/:id" element={<StaffProfilePage />} />
          <Route path="/drivers/:id" element={<DriverProfilePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/community/:tab?" element={<CommunityPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/grades" element={<GradeConfigurationPage />} />
          <Route path="/settings/academic-years" element={<AcademicYearsPage />} />
          <Route path="/know-your-student" element={<KnowYourStudentPage />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      </ToastProvider>
    </AppProvider>
  );
}

export default App;
