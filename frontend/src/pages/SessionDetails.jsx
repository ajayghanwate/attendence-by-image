import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attendanceService } from '../services/attendance';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '../components/ui/shared';
import { Loader2, ArrowLeft, Download, UserCheck, UserX, Search, User } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const SessionDetails = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [details, setDetails] = useState([]);
    const [absentStudents, setAbsentStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('present'); // 'present' | 'absent'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const [sessionData, allStudents] = await Promise.all([
                    attendanceService.getSessionDetails(sessionId),
                    attendanceService.getAllStudents()
                ]);

                setDetails(sessionData);

                const presentStudentIds = new Set(sessionData.map(record => record.student_id));
                const absent = allStudents.filter(student => !presentStudentIds.has(student.id));
                setAbsentStudents(absent);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [sessionId]);

    const handleExport = () => {
        if (!details.length) return;
        const headers = ['Student Name', 'Roll Number', 'Status', 'Time'];
        const rows = details.map(record => [
            record.students?.name || 'Unknown',
            record.students?.roll_number || 'N/A',
            record.status,
            format(new Date(record.created_at), 'PPP p')
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendance_${sessionId}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2) || '??';
    };

    const getRandomColor = (name) => {
        const colors = [
            'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-emerald-500',
            'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
            'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    const filteredList = (activeTab === 'present' ? details : absentStudents).filter(item => {
        const name = (activeTab === 'present' ? item.students?.name : item.name) || '';
        const roll = (activeTab === 'present' ? item.students?.roll_number : item.roll_number) || '';
        const search = searchTerm.toLowerCase();

        return (
            name.toLowerCase().includes(search) ||
            roll.toLowerCase().includes(search)
        );
    });

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-white/50">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            Session Report
                        </h1>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-semibold mr-2">
                                {details[0]?.attendance_sessions?.subject || details[0]?.subject || 'Class'}
                            </span>
                            {details.length > 0 && (
                                <span>
                                    {(() => {
                                        const dateStr = details[0]?.created_at || details[0]?.attendance_sessions?.created_at;
                                        if (!dateStr) return '';
                                        try {
                                            return format(new Date(dateStr), 'PPP p');
                                        } catch (e) {
                                            return '';
                                        }
                                    })()}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-xl border-none bg-white/50 focus:bg-white ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500 transition-all text-sm w-64"
                        />
                    </div>
                    <Button variant="secondary" onClick={handleExport} disabled={details.length === 0} className="shadow-sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Mobile Search */}
            <div className="md:hidden relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="!pl-9 bg-white/50"
                />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${activeTab === 'present' ? 'bg-green-50 border-green-200 shadow-md transform scale-[1.02]' : 'bg-white/60 border-transparent hover:bg-white'}`}
                    onClick={() => setActiveTab('present')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-700">Present</p>
                            <h2 className="text-3xl font-bold text-green-800">{details.length}</h2>
                        </div>
                        <div className={`p-3 rounded-xl ${activeTab === 'present' ? 'bg-green-200' : 'bg-gray-100'}`}>
                            <UserCheck className={`w-6 h-6 ${activeTab === 'present' ? 'text-green-700' : 'text-gray-400'}`} />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${activeTab === 'absent' ? 'bg-red-50 border-red-200 shadow-md transform scale-[1.02]' : 'bg-white/60 border-transparent hover:bg-white'}`}
                    onClick={() => setActiveTab('absent')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-700">Absent</p>
                            <h2 className="text-3xl font-bold text-red-800">{absentStudents.length}</h2>
                        </div>
                        <div className={`p-3 rounded-xl ${activeTab === 'absent' ? 'bg-red-200' : 'bg-gray-100'}`}>
                            <UserX className={`w-6 h-6 ${activeTab === 'absent' ? 'text-red-700' : 'text-gray-400'}`} />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Content List */}
            <Card className="glass-card border-none shadow-xl bg-white/40">
                <CardContent className="p-0">
                    <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                        {filteredList.length === 0 ? (
                            <div className="p-12 text-center">
                                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <h3 className="text-gray-900 font-medium">No students found</h3>
                                <p className="text-gray-500 text-sm">Try adjusting your search</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                <AnimatePresence mode="popLayout">
                                    {filteredList.map((item, index) => {
                                        const isPresent = activeTab === 'present';
                                        const name = isPresent ? item.students?.name : item.name;
                                        const roll = isPresent ? item.students?.roll_number : item.roll_number;
                                        const id = isPresent ? item.id : item.id;

                                        return (
                                            <motion.div
                                                key={id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="p-4 hover:bg-white/60 transition-colors flex items-center justify-between group"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${getRandomColor(name || '?')}`}>
                                                        {getInitials(name)}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-gray-900">{name || 'Unknown Student'}</h3>
                                                        <p className="text-xs text-gray-500 font-mono">{roll || 'N/A'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-4">
                                                    {isPresent && (
                                                        <span className="text-xs text-gray-400 hidden sm:inline-block">
                                                            {(() => {
                                                                const dateStr = item.created_at;
                                                                if (!dateStr) return '';
                                                                try {
                                                                    return format(new Date(dateStr), 'h:mm a');
                                                                } catch (e) {
                                                                    return '';
                                                                }
                                                            })()}
                                                        </span>
                                                    )}
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${isPresent
                                                        ? 'bg-green-100 text-green-700 border-green-200'
                                                        : 'bg-red-100 text-red-700 border-red-200'
                                                        }`}>
                                                        {isPresent ? 'Present' : 'Absent'}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SessionDetails;
