// App.jsx - Update to this:
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Dashboard from "./pages/Dashboard";
import InstructorPanel from "./components/dashboard/InstructorPanel";
import ManageStudents from "./pages/instructor/ManageStudents";
import AdminPanel from "./components/dashboard/AdminPanel";
import AdminInstructors from "./components/dashboard/AdminInstructors";
import CourseManagement from "./pages/instructor/CourseManagement";

import CORSTest from "./pages/CORSTest";

import StudentPanel from "./components/dashboard/StudentPanel";
import StudentHome from "./pages/student/StudentHome";
import StudentCourses from "./pages/student/StudentCourses";
import StudentProfile from "./pages/student/StudentProfile";

import MockInterviews from "./pages/student/MockInterviews";
import MockInterviewLevels from "./pages/student/MockInterviewLevels";
import MockInterviewSession from "./pages/student/MockInterviewSession";
import MockInterviewResult from "./pages/student/MockInterviewResult";
import MockInterviewHistory from "./pages/student/MockInterviewHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add direct route to instructor dashboard */}
        <Route path="/instructor" element={<InstructorPanel />} />
        <Route path="/instructor/manage-students" element={<ManageStudents />} />
        <Route path="/admin/dashboard" element={<AdminPanel />} />
        <Route
          path="/instructor/course-management"
          element={<CourseManagement />}
        />

        {/* Student */}
        <Route path="/student" element={<StudentPanel />}>
          <Route index element={<StudentHome />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        <Route path="/cors-test" element={<CORSTest />} />

        {/* Fallback */}
        <Route path="*" element={<h2>404 Page Not Found</h2>} />
      
       
     <Route path="/admin/instructors" element={<AdminInstructors />} />
      
       <Route path="/student/mock-interviews" element={<MockInterviews />} />
        <Route path="/student/mock-interviews/:type" element={<MockInterviewLevels />} />
        <Route path="/student/mock-interviews/session" element={<MockInterviewSession />} />
        <Route path="/student/mock-interviews/result" element={<MockInterviewResult />} />
        <Route path="/student/mock-interviews/history" element={<MockInterviewHistory />} />
      
      </Routes>


    </BrowserRouter>
  );
}

export default App;