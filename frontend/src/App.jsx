import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ScrollToTop from './components/ScrollToTop.jsx'; 
import Home from './pages/Home.jsx';
import JobList from './pages/JobList.jsx';
import JobDetail from './pages/JobDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import CandidateDashboard from './pages/CandidateDashboard.jsx';
import EmployerDashboard from './pages/employer/EmployerDashboard.jsx';
import EmployerProfile from './pages/employer/EmployerProfile.jsx';
import AnalyticsDashboard from './pages/employer/AnalyticsDashboard.jsx';
import CreateJob from './pages/employer/CreateJob.jsx';
import EditJob from './pages/employer/EditJob.jsx';
import ApplicationsManagement from './pages/employer/ApplicationsManagement.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import Experience from './pages/Experience.jsx';
import Education from './pages/Education.jsx';
import Skills from './pages/Skills.jsx';
import Notifications from './pages/Notifications.jsx';
import Messages from './pages/Messages.jsx';
import AllApplications from './pages/employer/AllApplications.jsx';
import Candidates from './pages/employer/Candidates.jsx';
import CandidateDetails from './pages/employer/CandidateDetails.jsx'; 
import AnalyticsDashboardCandidate from './pages/AnalyticsDashboardCandidate.jsx';
import SavedJobs from './pages/SavedJobs.jsx';
import SavedProfiles from './pages/SavedProfiles.jsx';
import EmployerPublicProfile from './pages/EmployerPublicProfile.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
          <ScrollToTop /> 
          <Header />
          <main className="pt-20">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="/jobs/:id" element={<JobDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/employer/:employerId/profile" element={<EmployerPublicProfile />} />
              
              {/* Candidate Routes */}
              <Route path="/candidate/dashboard" element={
                <ProtectedRoute>
                  <CandidateDashboard />
                </ProtectedRoute>
              } />
              <Route path="/candidate/analytics" element={
                <ProtectedRoute>
                  <AnalyticsDashboardCandidate />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/experience" element={
                <ProtectedRoute>
                  <Experience />
                </ProtectedRoute>
              } />
              <Route path="/education" element={
                <ProtectedRoute>
                  <Education />
                </ProtectedRoute>
              } />
              <Route path="/skills" element={
                <ProtectedRoute>
                  <Skills />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              <Route path="/saved-jobs" element={
                <ProtectedRoute>
                  <SavedJobs />
                </ProtectedRoute>
              } />

              {/* Employer Routes */}
              <Route path="/employer/dashboard" element={
                <ProtectedRoute>
                  <EmployerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/employer/profile" element={
                <ProtectedRoute>
                  <EmployerProfile />
                </ProtectedRoute>
              } />
              <Route path="/employer/analytics" element={
                <ProtectedRoute>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              } />
              <Route path="/employer/jobs/new" element={
                <ProtectedRoute>
                  <CreateJob />
                </ProtectedRoute>
              } />
              <Route path="/employer/jobs/edit/:jobId" element={
                <ProtectedRoute>
                  <EditJob />
                </ProtectedRoute>
              } />
              <Route path="/employer/applications" element={
                <ProtectedRoute>
                  <ApplicationsManagement />
                </ProtectedRoute>
              } />
              <Route path="/employer/all-applications" element={
                <ProtectedRoute>
                  <AllApplications />
                </ProtectedRoute>
              } />
              <Route path="/employer/candidates" element={
                <ProtectedRoute>
                  <Candidates />
                </ProtectedRoute>
              } />
              <Route path="/employer/candidates/:candidateId" element={
                <ProtectedRoute>
                  <CandidateDetails />
                </ProtectedRoute>
              } />
              <Route path="/saved-profiles" element={
                <ProtectedRoute>
                  <SavedProfiles />
                </ProtectedRoute>
              } />

              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;