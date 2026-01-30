const API_BASE_URL = window.location.port === '8000' ? '' : 'http://localhost:8000';

const api = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;

        // Handle form data or JSON
        let body = options.body;
        if (body && !(body instanceof FormData)) {
            options.headers = {
                ...options.headers,
                'Content-Type': 'application/json'
            };
            body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, { ...options, body });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Something went wrong');
            }
            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    },

    // Teacher Auth
    signup(email, password) {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        return this.request('/teacher/signup', { method: 'POST', body: formData });
    },

    login(email, password) {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        return this.request('/teacher/login', { method: 'POST', body: formData });
    },

    // Students
    getStudents() {
        return this.request('/students');
    },

    registerStudent(name, rollNumber, imageFile) {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('roll_number', rollNumber);
        formData.append('image', imageFile);
        return this.request('/register-student', { method: 'POST', body: formData });
    },

    // Attendance
    takeAttendance(subject, teacherId, imageFile) {
        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('teacher_id', teacherId);
        formData.append('image', imageFile);
        return this.request('/take-attendance', { method: 'POST', body: formData });
    },

    getHistory(teacherId) {
        return this.request(`/attendance-history?teacher_id=${teacherId}`);
    },

    getSessionDetails(sessionId) {
        return this.request(`/attendance-history/${sessionId}`);
    }
};
