import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import StudentPanel from "../components/dashboard/StudentPanel";
import InstructorPanel from "../components/dashboard/InstructorPanel";
import RecruiterPanel from "../components/dashboard/RecruiterPanel";
import AdminPanel from "../components/dashboard/AdminPanel";

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const role = location.state?.role;

  // protect route
  useEffect(() => {
    if (!role) {
      navigate("/");
    }
  }, [role, navigate]);

  if (!role) return null;

  switch (role) {
    case "student":
      return <StudentPanel />;

    case "instructor":
      return <InstructorPanel />;

    case "recruiter":
      return <RecruiterPanel />;

    case "admin":
      return <AdminPanel />;

    default:
      return null;
  }
}

export default Dashboard;
