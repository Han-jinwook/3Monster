import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Showroom } from './pages/Showroom';
import { Dashboard } from './pages/Dashboard';
import { LicenseGenerator } from './pages/LicenseGenerator';
import { LicenseList } from './pages/LicenseList';
import { CustomerSupport } from './pages/CustomerSupport';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { NotificationManager } from './pages/NotificationManager';
import { SupportWrapper } from './components/SupportWrapper';
import { UserList } from './pages/UserList';
import { MerlinTrial } from './pages/MerlinTrial';

function AppRoutes() {
    return (
        <Routes>
            {/* Public Showcase / Landing page */}
            <Route path="/" element={
                <PublicLayout>
                    <Showroom />
                </PublicLayout>
            } />

            {/* Publicly accessible Support page (Auth validation is done inline in SupportWrapper) */}
            <Route path="/support" element={
                <PublicLayout>
                    <SupportWrapper>
                        <CustomerSupport />
                    </SupportWrapper>
                </PublicLayout>
            } />

            {/* Profile Page */}
            <Route path="/profile" element={
                <PublicLayout>
                    <SupportWrapper>
                        <Profile />
                    </SupportWrapper>
                </PublicLayout>
            } />

            {/* Standalone Login page but with Showroom background */}
            <Route path="/login" element={
                <PublicLayout>
                    <Showroom />
                    <Login />
                </PublicLayout>
            } />

            <Route path="/admin" element={<PublicLayout><AdminLayout /></PublicLayout>}>
                <Route index element={<Dashboard />} />
                <Route path="generator" element={<LicenseGenerator />} />
                <Route path="licenses" element={<LicenseList />} />
                <Route path="users" element={<UserList />} />
                <Route path="notifications" element={<NotificationManager />} />
                <Route path="merlin-trial" element={<MerlinTrial />} />
            </Route>

            {/* Fallback Redirection */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
