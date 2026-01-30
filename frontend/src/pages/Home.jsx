import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/attendance';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/shared';
import {
    Users,
    Calendar,
    PlusCircle,
    Camera,
    TrendingUp,
    Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const Home = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalSessions: 0,
        totalStudents: 0,
        avgClassSize: 0,
        recentSessions: [],
        chartData: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user?.id) return;
            try {
                // Fetch history and students in parallel
                const [history, students] = await Promise.all([
                    attendanceService.getHistory(user.id),
                    attendanceService.getAllStudents()
                ]);

                // Calculate Total Students
                const totalStudentsCount = students.length;

                // Process data for charts & stats
                let totalAttendance = 0;

                // Group by date
                const grouped = history.reduce((acc, curr) => {
                    const date = format(new Date(curr.created_at), 'MMM dd');
                    if (!acc[date]) acc[date] = 0;

                    const count = curr.attendance_records?.[0]?.count || 0;
                    totalAttendance += count;

                    acc[date] += count;
                    return acc;
                }, {});

                const chartData = Object.keys(grouped).map(key => ({
                    name: key,
                    students: grouped[key]
                })).slice(-5); // Last 5 days

                // Calculate Avg Class Size
                const avgSize = history.length > 0 ? Math.round(totalAttendance / history.length) : 0;

                setStats({
                    totalSessions: history.length,
                    totalStudents: totalStudentsCount,
                    avgClassSize: avgSize,
                    recentSessions: history.slice(0, 3),
                    chartData
                });
            } catch (error) {
                console.error("Failed to load stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            <motion.div variants={item} className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500">Welcome back, {user?.email}</p>
                </div>
                <div className="flex space-x-3">
                    <Link to="/students/new" className="hidden sm:inline-block">
                        <button className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium">
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Add Student
                        </button>
                    </Link>
                    <Link to="/attendance/new">
                        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-600/20">
                            <Camera className="w-5 h-5 mr-2" />
                            Take Attendance
                        </button>
                    </Link>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/history" className="block transform transition-transform hover:-translate-y-1">
                    <Card hoverEffect className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none shadow-lg shadow-indigo-500/30 h-full cursor-pointer relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Calendar className="w-24 h-24" />
                        </div>
                        <CardContent className="flex items-center p-6 relative z-10">
                            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm mr-5">
                                <Calendar className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <p className="text-indigo-100 font-medium text-sm uppercase tracking-wider">Total Sessions</p>
                                <h3 className="text-4xl font-bold mt-1">{loading ? '-' : stats.totalSessions}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/students" className="block transform transition-transform hover:-translate-y-1">
                    <Card hoverEffect className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-lg shadow-purple-500/30 h-full cursor-pointer relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users className="w-24 h-24" />
                        </div>
                        <CardContent className="flex items-center p-6 relative z-10">
                            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm mr-5">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <p className="text-purple-100 font-medium text-sm uppercase tracking-wider">Total Students</p>
                                <h3 className="text-4xl font-bold mt-1">{loading ? '-' : stats.totalStudents}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/history" className="block transform transition-transform hover:-translate-y-1">
                    <Card hoverEffect className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-none shadow-lg shadow-pink-500/30 h-full cursor-pointer relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="w-24 h-24" />
                        </div>
                        <CardContent className="flex items-center p-6 relative z-10">
                            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm mr-5">
                                <TrendingUp className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <p className="text-pink-100 font-medium text-sm uppercase tracking-wider">Avg Class Size</p>
                                <h3 className="text-4xl font-bold mt-1">{loading ? '-' : stats.avgClassSize}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <motion.div variants={item} className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Attendance Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                {stats.chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats.chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="students"
                                                stroke="#6366f1"
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                                                activeDot={{ r: 6, fill: '#6366f1' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        No data available
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Activity */}
                <motion.div variants={item} className="lg:col-span-1">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Recent Sessions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {loading ? (
                                    <div className="animate-pulse space-y-3">
                                        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
                                    </div>
                                ) : stats.recentSessions.length > 0 ? (
                                    stats.recentSessions.map((session) => (
                                        <Link key={session.id} to={`/history/${session.id}`}>
                                            <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 mb-3">
                                                <div className="p-2 bg-indigo-50 rounded-md mr-3">
                                                    <Clock className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {session.subject}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {format(new Date(session.created_at), 'PPP p')}
                                                    </p>
                                                </div>
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {session.attendance_records?.[0]?.count || 0}
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 py-8">No recent sessions</p>
                                )}

                                {stats.recentSessions.length > 0 && (
                                    <Link to="/history" className="block text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-4">
                                        View all history
                                    </Link>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Home;
