import { createBrowserRouter } from "react-router-dom";
import HRDashboard from "../pages/adminSide/HRDashboard";
import LoginHR from "../pages/adminSide/LoginHR";
import NotFound from "../pages/adminSide/NotFound";
import PasswordChange from "../pages/adminSide/PasswordChange";
import CandidateDashboard from "@/pages/candidateSide/CandidateDashboard";
import VerificationPage from "@/pages/candidateSide/VerificationPage";
import AssessmentPage from "@/pages/candidateSide/Assessment/AssessmentPage";
import ProctorRoom from "@/pages/adminSide/ProctorRoom";
import TestAttemptsPage from "@/pages/adminSide/Response/TestAttemptsPage";
//import { ProtectedRoute, PublicRoute } from "./ProtectedRoutes";
const RouterComponent = createBrowserRouter([
  {
    path: "/hr-dashboard",
    element: (
     // <ProtectedRoute>
        <HRDashboard />
     // </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: (
    //  <PublicRoute>
        <LoginHR />
    //  </PublicRoute>
    ),
  },
  {
    path: "/change-password",
    element: (
    //  <ProtectedRoute>
        <PasswordChange />
     // </ProtectedRoute>
    ),
  },
  {
    path: "/candidate-dashboard",
    element: ( 
      <CandidateDashboard /> 
    ),
  },
  {
    path: "/proctor/room/:roomId",
    element: (
     // <ProtectedRoute>
        <ProctorRoom />
      //</ProtectedRoute>
    ),
  },
  {
    path: "/verify/:token",
    element: <VerificationPage />,
  },
  {
    path: "/assessment/:assessmentId",
    element: ( 
      <AssessmentPage /> 
    ),
  },
  {
    path: "/response/:candidateId",
    element: (
     // <ProtectedRoute>
        <TestAttemptsPage />
      //</ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
export default RouterComponent;
