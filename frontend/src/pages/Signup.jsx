import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../components/ui/shared';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock } from 'lucide-react';

const signupSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const Signup = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await signup(data.email, data.password);
            navigate('/login');
        } catch (error) {
            // Error handled by AuthContext
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background decorations */}
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-500/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
                <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-pink-500/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <Card className="glass-card border-white/50 shadow-2xl backdrop-blur-2xl">
                    <CardHeader className="space-y-1 text-center pb-8">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 transform -rotate-3 hover:-rotate-6 transition-transform duration-300">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-4xl font-bold tracking-tight text-gradient">
                            Create Account
                        </CardTitle>
                        <p className="text-slate-500 font-medium">Join as a teacher to manage attendance</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        placeholder="Email address"
                                        type="email"
                                        className="!pl-12"
                                        {...register('email')}
                                        error={errors.email?.message}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        placeholder="Password"
                                        type="password"
                                        className="!pl-12"
                                        {...register('password')}
                                        error={errors.password?.message}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input
                                        placeholder="Confirm Password"
                                        type="password"
                                        className="!pl-12"
                                        {...register('confirmPassword')}
                                        error={errors.confirmPassword?.message}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" isLoading={isLoading}>
                                Create Account
                            </Button>

                            <div className="text-center text-sm">
                                <span className="text-gray-500">Already have an account? </span>
                                <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
                                    Sign in
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default Signup;
