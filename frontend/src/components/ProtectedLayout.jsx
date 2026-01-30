import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from './Navbar';
import { Loader2 } from 'lucide-react';

const ProtectedLayout = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-pink-200/40 rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ProtectedLayout;
