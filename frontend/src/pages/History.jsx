import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/attendance';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui/shared';
import { Loader2, Calendar, ChevronRight, UserCheck, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

const History = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                const data = await attendanceService.getHistory(user.id);
                setSessions(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-white/50">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                    Attendance History
                </h1>
            </div>

            {sessions.length === 0 ? (
                <Card className="text-center py-16 bg-white/50 backdrop-blur-sm border-dashed">
                    <CardContent>
                        <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="h-8 w-8 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900">No sessions yet</h3>
                        <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                            Start your first class attendance session to see the history and analytics here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {sessions.map((session, index) => (
                        <motion.div
                            key={session.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link to={`/history/${session.id}`} className="block group">
                                <Card hoverEffect className="glass-card border-none bg-white/60 hover:bg-white/80 transition-all duration-300">
                                    <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                                                <span className="text-lg font-bold">{session.subject.substring(0, 2).toUpperCase()}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {session.subject}
                                                </span>
                                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                                    <span>{format(new Date(session.created_at), 'PPP')}</span>
                                                    <span className="mx-2">•</span>
                                                    <span>{format(new Date(session.created_at), 'p')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-4 sm:mt-0 pl-16 sm:pl-0">
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center">
                                                    <span className="text-3xl font-bold text-indigo-600 mr-2">
                                                        {session.attendance_records?.[0]?.count || 0}
                                                    </span>
                                                    <UserCheck className="w-5 h-5 text-indigo-400" />
                                                </div>
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Present</span>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;
