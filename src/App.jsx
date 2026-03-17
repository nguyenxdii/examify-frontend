import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import UserDashboard from "./pages/dashboard/UserDashboard";
import DashboardRedirect from "./pages/dashboard/DashboardRedirect";

// Admin Pages
import UserManagement from "./pages/dashboard/admin/UserManagement";
import AllExams from "./pages/dashboard/admin/AllExams";
import SystemStats from "./pages/dashboard/admin/SystemStats";

// Teacher Pages
import MyExams from "./pages/dashboard/teacher/MyExams";
import CreateExam from "./pages/dashboard/teacher/CreateExam";
import ExamRooms from "./pages/dashboard/teacher/ExamRooms";
import QuestionBank from "./pages/dashboard/teacher/QuestionBank";
import Results from "./pages/dashboard/teacher/Results";
import AIAssistant from "./pages/dashboard/teacher/AIAssistant";

import ProtectedRoute from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";

function App() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard Routes with Shared Layout */}
        <Route element={<ProtectedRoute><DashboardLayout user={user} /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          
          {/* Admin Routes */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/admin/users" element={
            <ProtectedRoute requiredRole="admin">
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/admin/all-quizzes" element={
            <ProtectedRoute requiredRole="admin">
              <AllExams />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/admin/analytics" element={
            <ProtectedRoute requiredRole="admin">
              <SystemStats />
            </ProtectedRoute>
          } />

          {/* Teacher/User Routes */}
          <Route path="/dashboard/user" element={<UserDashboard />} />
          <Route path="/dashboard/teacher/my-quizzes" element={<MyExams />} />
          <Route path="/dashboard/teacher/create-quiz" element={<CreateExam />} />
          <Route path="/dashboard/teacher/rooms" element={<ExamRooms />} />
          <Route path="/dashboard/teacher/questions" element={<QuestionBank />} />
          <Route path="/dashboard/teacher/results" element={<Results />} />
          <Route path="/dashboard/teacher/ai-assistant" element={<AIAssistant />} />
          
          {/* Settings & Profile */}
          <Route path="/dashboard/settings" element={<div className="p-20 text-center"><h1>Settings Placeholder</h1></div>} />
          <Route path="/dashboard/profile" element={<div className="p-20 text-center"><h1>Profile Placeholder</h1></div>} />
        </Route>

        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
