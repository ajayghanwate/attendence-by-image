import api from './api';

export const attendanceService = {
    // Students
    registerStudent: async (data) => {
        // data is FormData
        const response = await api.post('/register-student', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getAllStudents: async () => {
        const response = await api.get('/students');
        return response.data;
    },

    // Attendance
    takeAttendance: async (data) => {
        // data is FormData
        const response = await api.post('/take-attendance', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // History
    getHistory: async (teacherId) => {
        const response = await api.get(`/attendance-history?teacher_id=${teacherId}`);
        return response.data;
    },

    getSessionDetails: async (sessionId) => {
        const response = await api.get(`/attendance-history/${sessionId}`);
        return response.data;
    },
};
