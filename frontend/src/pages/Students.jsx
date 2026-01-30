import { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendance';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/shared';
import { Loader2, User, Plus, Search, ArrowLeft } from 'lucide-react';
import { Input, Button } from '../components/ui/shared';

const Students = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await attendanceService.getAllStudents();
                setStudents(data);
                setFilteredStudents(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    useEffect(() => {
        const results = students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredStudents(results);
    }, [searchTerm, students]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-white/50">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Students Directory</h1>
                </div>
                <Link to="/students/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Student
                    </Button>
                </Link>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                    placeholder="Search by name or roll number..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student) => (
                    <Card key={student.id} className="hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6 flex items-center space-x-4">
                            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                                <User className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                                <p className="text-sm text-gray-500 font-mono">{student.roll_number}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filteredStudents.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        No students found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Students;
