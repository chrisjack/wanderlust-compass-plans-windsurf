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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetails />} />
          <Route path="/library" element={<Library />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/import" element={<Import />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/:tripId" element={<TripDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/planner_trips/:id" element={<PlannerTripDetails />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route path="/support" element={<Support />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
