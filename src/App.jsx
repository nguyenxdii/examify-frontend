import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard Routes */}
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
        <Route path="/dashboard/user" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/teacher/my-quizzes" element={
          <ProtectedRoute>
            <MyExams />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/teacher/create-quiz" element={
          <ProtectedRoute>
            <CreateExam />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/teacher/rooms" element={
          <ProtectedRoute>
            <ExamRooms />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/teacher/questions" element={
          <ProtectedRoute>
            <QuestionBank />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/teacher/results" element={
          <ProtectedRoute>
            <Results />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/teacher/ai-assistant" element={
          <ProtectedRoute>
            <AIAssistant />
          </ProtectedRoute>
        } />
        
        {/* Settings & Profile */}
        <Route path="/dashboard/settings" element={<ProtectedRoute><div className="p-20 text-center"><h1>Settings Placeholder</h1></div></ProtectedRoute>} />
        <Route path="/dashboard/profile" element={<ProtectedRoute><div className="p-20 text-center"><h1>Profile Placeholder</h1></div></ProtectedRoute>} />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
