import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import DonorRegistration from './pages/DonorRegistration';
import DonorList from './pages/DonorList';
import AgentDashboard from './pages/AgentDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DonorProvider } from './contexts/DonorContext';
import { OfflineProvider } from './contexts/OfflineContext';
import ErrorBoundary from './components/utils/ErrorBoundary';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <OfflineProvider>       
          <DonorProvider>
            <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-200 to-indigo-200">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/register" element={<DonorRegistration />} />
                    <Route path="/donors" element={<DonorList />} />
                    <Route path="/agent/:id" element={<AgentDashboard />} />
                  </Routes>
                </div>
              </div>
            </Router>
          </DonorProvider>
        </OfflineProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;