import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import About from '@/pages/About';
import ServicePage from '@/pages/ServicePage';
import Quiz from '@/pages/Quiz';
import ThankYou from '@/pages/ThankYou';
import ThankYouUnmatched from '@/pages/ThankYouUnmatched';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminLeads from '@/pages/admin/Leads';
import UsersAdmin from '@/pages/admin/UsersAdmin';
import QuizSettings from '@/pages/admin/QuizSettings';
import PagesAndSEO from '@/pages/admin/PagesAndSEO';
import Integrations from '@/pages/admin/Integrations';
import AdminAnalytics from '@/pages/admin/Analytics';
import AdminSettings from '@/pages/admin/AdminSettings';
import Distribution from '@/pages/admin/Distribution';
import { Privacy, Terms, TCPA } from '@/pages/Legal';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-secondary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Quiz — standalone chrome */}
      <Route path="/quiz" element={<Quiz />} />

      {/* Admin — standalone with own dark layout + auth guard */}
      <Route element={<AdminGuard />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/leads" element={<AdminLeads />} />
        <Route path="/admin/users" element={<UsersAdmin />} />
        <Route path="/admin/quiz" element={<QuizSettings />} />
        <Route path="/admin/pages" element={<PagesAndSEO />} />
        <Route path="/admin/integrations" element={<Integrations />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/distribution" element={<Distribution />} />
      </Route>

      {/* Public site — uses main Navbar + Footer Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services/:slug" element={<ServicePage />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/thank-you-unmatched" element={<ThankYouUnmatched />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/tcpa" element={<TCPA />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <Router>
          <AuthenticatedApp />
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App