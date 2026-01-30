import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/shared';
import { MessageCircle, LogOut, User } from 'lucide-react';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <MessageCircle className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                AttendoAI
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <div className="hidden md:flex items-center space-x-2 text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                                    <User className="h-4 w-4" />
                                    <span>{user.email}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleLogout}>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <div className="space-x-2">
                                <Link to="/login">
                                    <Button variant="ghost">Login</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button>Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
