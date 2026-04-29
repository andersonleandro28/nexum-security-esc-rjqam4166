/* Main App Component - Handles routing (using react-router-dom), query client and other providers - use this file to add all routes */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Onboarding from './pages/Onboarding'
import Login from './pages/auth/Login'
import CustomerDashboard from './pages/customer/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProposals from './pages/admin/Proposals'
import AdminReports from './pages/admin/Reports'
import { PublicLayout } from './components/PublicLayout'
import { CustomerLayout } from './components/CustomerLayout'
import { AdminLayout } from './components/AdminLayout'
import { MainProvider } from './stores/main'
import { AuthProvider } from './hooks/use-auth'
import { ProtectedRoute } from './components/ProtectedRoute'

// ONLY IMPORT AND RENDER WORKING PAGES, NEVER ADD PLACEHOLDER COMPONENTS OR PAGES IN THIS FILE
// AVOID REMOVING ANY CONTEXT PROVIDERS FROM THIS FILE (e.g. TooltipProvider, Toaster, Sonner)

const App = () => (
  <MainProvider>
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/onboarding" element={<Onboarding />} />
            </Route>

            <Route path="/login" element={<Login />} />

            {/* Protected Customer routes */}
            <Route element={<ProtectedRoute allowedRoles={['client', 'admin']} />}>
              <Route path="/customer" element={<CustomerLayout />}>
                <Route path="dashboard" element={<CustomerDashboard />} />
              </Route>
            </Route>

            {/* Protected Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="proposals" element={<AdminProposals />} />
                <Route path="reports" element={<AdminReports />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  </MainProvider>
)

export default App
