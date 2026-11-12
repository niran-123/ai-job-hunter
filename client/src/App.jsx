import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from './services/queryClient';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';

import Dashboard from './pages/Dashboard';
import AllJobs from './pages/AllJobs';
import JobDetails from './pages/JobDetails';
import Recommendations from './pages/Recommendations';
import Countries from './pages/Countries';
import Sources from './pages/Sources';
import SavedJobs from './pages/SavedJobs';
import Applications from './pages/Applications';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SystemLogs from './pages/SystemLogs';
import Login from './pages/Login';
import Register from './pages/Register';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="jobs" element={<AllJobs />} />
              <Route path="jobs/:id" element={<JobDetails />} />
              <Route path="recommendations" element={<Recommendations />} />
              <Route path="countries" element={<Countries />} />
              <Route path="sources" element={<Sources />} />
              <Route path="saved" element={<SavedJobs />} />
              <Route path="applications" element={<Applications />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="logs" element={<SystemLogs />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
