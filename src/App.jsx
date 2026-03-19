import React from "react";
import { 
  createBrowserRouter, 
  RouterProvider, 
  Navigate,
  Outlet
} from "react-router-dom";
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
import AiCreateExam from "./pages/dashboard/teacher/AiCreateExam";
import CreateExam from "./pages/dashboard/teacher/CreateExam";
import ManualCreateExam from "./pages/dashboard/teacher/ManualCreateExam";
import ExamDetail from "./pages/dashboard/teacher/ExamDetail";
import ExamRooms from "./pages/dashboard/teacher/ExamRooms";
import RoomDetail from "./pages/dashboard/teacher/RoomDetail";
import QuestionBank from "./pages/dashboard/teacher/QuestionBank";
import Results from "./pages/dashboard/teacher/Results";
import AIAssistant from "./pages/dashboard/teacher/AIAssistant";
import Settings from "./pages/dashboard/Settings";
import Profile from "./pages/dashboard/Profile";
import { Toaster } from "react-hot-toast";

import ProtectedRoute from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "50px", textAlign: "center", background: "#fff", height: "100vh" }}>
          <h1 style={{ color: "#7e45f1", fontSize: "40px" }}>Something went wrong.</h1>
          <p style={{ color: "#666", fontSize: "18px" }}>Error: {this.state.error?.message || "Unknown error"}</p>
          <button onClick={() => window.location.reload()} style={{ padding: "12px 24px", background: "#7e45f1", color: "white", borderRadius: "12px", border: "none", cursor: "pointer", fontWeight: "bold" }}>Reload Page</button>
          <pre style={{ marginTop: "30px", padding: "20px", background: "#f5f5f5", borderRadius: "8px", textAlign: "left", overflow: "auto", maxWidth: "800px", margin: "30px auto" }}>
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Function to get current user for the layout
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch (e) {
    console.error("Failed to parse user from localStorage", e);
    return {};
  }
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout user={getCurrentUser()} />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/dashboard",
        element: <DashboardRedirect />,
      },
      // Admin Routes
      {
        path: "/dashboard/admin",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/admin/users",
        element: (
          <ProtectedRoute requiredRole="admin">
            <UserManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/admin/all-quizzes",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AllExams />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/admin/analytics",
        element: (
          <ProtectedRoute requiredRole="admin">
            <SystemStats />
          </ProtectedRoute>
        ),
      },
      // Teacher/User Routes
      {
        path: "/dashboard/user",
        element: <UserDashboard />,
      },
      {
        path: "/dashboard/teacher/my-quizzes",
        element: <MyExams />,
      },
      {
        path: "/dashboard/teacher/my-quizzes/:examId",
        element: <ExamDetail />,
      },
      {
        path: "/dashboard/teacher/create-quiz",
        element: <CreateExam />,
      },
      {
        path: "/dashboard/teacher/create-quiz/manual",
        element: <ManualCreateExam />,
      },
      {
        path: "/dashboard/teacher/create-quiz/ai",
        element: <AiCreateExam />,
      },
      {
        path: "/dashboard/teacher/rooms",
        element: <ExamRooms />,
      },
      {
        path: "/dashboard/teacher/rooms/:roomId",
        element: <RoomDetail />,
      },
      {
        path: "/dashboard/teacher/questions",
        element: <QuestionBank />,
      },
      {
        path: "/dashboard/teacher/results",
        element: <Results />,
      },
      {
        path: "/dashboard/teacher/ai-assistant",
        element: <AIAssistant />,
      },
      // Settings & Profile
      {
        path: "/dashboard/settings",
        element: <Settings />,
      },
      {
        path: "/dashboard/profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </>
  );
}

export default App;
