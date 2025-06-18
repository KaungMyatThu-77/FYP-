import React from "react";
import { Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import MainLayout from "./components/common/MainLayout";
import ExercisePage from "./pages/ExercisePage";
import LearnPage from "./pages/LearnPage";
import AuthenticatedRedirect from "./components/common/AuthenticatedRedirect";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-100">
      <Routes>
        <Route path="/" element={<AuthenticatedRedirect><Landing /></AuthenticatedRedirect>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
            {/* Add other protected routes here e.g. /profile, /settings */}
          </Route>
          {/* ExercisePage uses a different layout (no header/footer) */}
          <Route path="/courses/:courseId/exercises" element={<ExercisePage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
