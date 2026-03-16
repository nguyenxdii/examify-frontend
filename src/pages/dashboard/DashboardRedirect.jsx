import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      navigate("/login");
      return;
    }

    const user = JSON.parse(userString);
    if (user.role === "ROLE_ADMIN") {
      navigate("/dashboard/admin");
    } else {
      navigate("/dashboard/user");
    }
  }, [navigate]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
