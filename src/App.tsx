import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Clients from "./pages/Clients";
import { Toaster } from "@/components/ui/toaster";
import ClientDetails from './pages/ClientDetails';
import Library from './pages/Library';
import Planner from './pages/Tasks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Index from './pages/Index';
import Import from './pages/Import';
import Trips from './pages/Trips';
import TripDetails from './pages/TripDetails';
import Profile from './pages/Profile';
import Alerts from './pages/Alerts';
import Messages from './pages/Messages';
import PlannerTripDetails from './pages/PlannerTripDetails';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';
import Support from './pages/Support';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ProtectedRoute from "./components/ProtectedRoute";
import { IdleTimeoutProvider } from "./components/IdleTimeoutProvider";
import { syncService } from "./lib/syncService";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useEffect(() => {
    // Initialize the sync service for offline functionality
    syncService.init().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <IdleTimeoutProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/clients/:id" element={<ProtectedRoute><ClientDetails /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
            <Route path="/import" element={<ProtectedRoute><Import /></ProtectedRoute>} />
            <Route path="/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
            <Route path="/trips/:tripId" element={<ProtectedRoute><TripDetails /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/planner_trips/:id" element={<ProtectedRoute><PlannerTripDetails /></ProtectedRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth-callback" element={<AuthCallback />} />
            <Route path="/support" element={<Support />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </IdleTimeoutProvider>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
