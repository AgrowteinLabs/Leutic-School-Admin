import { Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
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
import { AddVehiclePage } from "./features/directory/pages/AddVehiclePage";
import { CommunicationsHubPage } from "./features/communications/pages/CommunicationsHubPage";
import { TransportationHubPage } from "./features/transportation/pages/TransportationHubPage";
import { StaffProfilePage } from "./features/settings/pages/StaffProfilePage";
import { DriverProfilePage } from "./features/transportation/pages/DriverProfilePage";
import { FeesPage } from "./features/finance/pages/FeesPage";
import { CurriculumPage } from "./features/curriculum/pages/CurriculumPage";

function App() {
  return (
    <div className="bg-white text-foreground font-sans h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex overflow-hidden">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/classes/create" element={<CreateClassPage />} />
          <Route path="/classes/:id" element={<ClassDetailsPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/students/:id" element={<StudentProfilePage />} />
          <Route path="/academics" element={<AcademicHubPage />} />
          <Route path="/directory/:tab?" element={<DirectoryPage />} />
          <Route path="/curriculum/:tab?" element={<CurriculumPage />} />
          <Route path="/directory/students/add" element={<EnrollStudentPage />} />
          <Route path="/directory/staff/add" element={<AddStaffPage />} />
          <Route path="/directory/drivers/add" element={<AddDriverPage />} />
          <Route path="/transportation/add-vehicle" element={<AddVehiclePage />} />
          <Route path="/communications" element={<CommunicationsHubPage />} />
          <Route path="/transportation" element={<TransportationHubPage />} />
          <Route path="/finance" element={<FeesPage />} />
          <Route path="/staff/:id" element={<StaffProfilePage />} />
          <Route path="/drivers/:id" element={<DriverProfilePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/know-your-student" element={<KnowYourStudentPage />} />
          <Route path="/examinations/:id" element={<ExamDetailsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
