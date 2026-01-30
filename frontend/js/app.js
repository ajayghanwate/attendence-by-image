document.addEventListener('DOMContentLoaded', () => {
    const app = {
        currentUser: JSON.parse(localStorage.getItem('user')),
        currentView: 'dashboard',

        init() {
            this.bindEvents();
            this.render();
        },

        bindEvents() {
            // Navigation
            document.querySelectorAll('.nav-link[data-view]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.setView(e.currentTarget.dataset.view);
                });
            });

            // Logout
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
        },

        setView(view) {
            this.currentView = view;

            // Update active state in nav
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.toggle('active', link.dataset.view === view);
            });

            this.render();
        },

        showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = `toast show ${type}`;
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        },

        logout() {
            localStorage.removeItem('user');
            localStorage.removeItem('session');
            this.currentUser = null;
            this.showToast('Logged out successfully');
            this.render();
        },

        async render() {
            const container = document.getElementById('view-container');
            const navbar = document.getElementById('navbar');

            // If not logged in, show auth page (login/signup)
            if (!this.currentUser) {
                navbar.style.display = 'none';
                container.innerHTML = this.getAuthHTML();
                this.bindAuthEvents();
                return;
            }

            navbar.style.display = 'block';

            // Routing
            switch (this.currentView) {
                case 'dashboard':
                    container.innerHTML = await this.getDashboardHTML();
                    break;
                case 'register-student':
                    container.innerHTML = this.getRegisterStudentHTML();
                    this.bindRegisterEvents();
                    break;
                case 'take-attendance':
                    container.innerHTML = this.getTakeAttendanceHTML();
                    this.bindAttendanceEvents();
                    break;
                case 'history':
                    container.innerHTML = await this.getHistoryHTML();
                    this.bindHistoryEvents();
                    break;
                default:
                    container.innerHTML = '<h1>404 Not Found</h1>';
            }
        },

        // --- View HTML Generators ---

        getAuthHTML() {
            return `
                <div class="auth-container">
                    <div class="card glass-card">
                        <div class="auth-header">
                            <h1>AI Attendance</h1>
                            <p id="auth-subtitle">Teacher Login</p>
                        </div>
                        <form id="auth-form">
                            <div class="form-group">
                                <label>Email Address</label>
                                <input type="email" id="email" class="form-input" required placeholder="teacher@school.com">
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" id="password" class="form-input" required placeholder="••••••••">
                            </div>
                            <button type="submit" class="btn btn-primary btn-block" id="auth-submit-btn">Login</button>
                        </form>
                        <p style="text-align: center; margin-top: 1.5rem; color: var(--text-muted);">
                            <span id="auth-toggle-text">Don't have an account?</span> 
                            <a href="#" id="auth-toggle-link" style="color: var(--primary); font-weight: 600; text-decoration: none;">Sign Up</a>
                        </p>
                    </div>
                </div>
            `;
        },

        async getDashboardHTML() {
            let stats = { students: 0, sessions: 0 };
            try {
                const students = await api.getStudents();
                const history = await api.getHistory(this.currentUser.id);
                stats.students = students.length;
                stats.sessions = history.length;
            } catch (e) {
                console.error("Dashboard data load failed", e);
            }

            return `
                <div class="fade-in">
                    <h1 style="margin-bottom: 2rem;">Welcome, ${this.currentUser.email}</h1>
                    <div class="stats-grid">
                        <div class="card">
                            <div style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600;">TOTAL STUDENTS</div>
                            <div style="font-size: 2.5rem; font-weight: 700; color: var(--primary);">${stats.students}</div>
                        </div>
                        <div class="card">
                            <div style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600;">SESSIONS CONDUCTED</div>
                            <div style="font-size: 2.5rem; font-weight: 700; color: var(--secondary);">${stats.sessions}</div>
                        </div>
                        <div class="card">
                            <div style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600;">SYSTEM STATUS</div>
                            <div style="font-size: 1.2rem; font-weight: 600; color: var(--success); margin-top: 1rem;"><i class="fas fa-check-circle"></i> Online</div>
                        </div>
                    </div>
                    
                    <h2 style="margin-bottom: 1.5rem;">Quick Actions</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <button class="btn btn-primary" onclick="window.app.setView('take-attendance')">
                            <i class="fas fa-camera"></i> Take New Attendance
                        </button>
                        <button class="btn btn-primary" style="background: var(--secondary);" onclick="window.app.setView('register-student')">
                            <i class="fas fa-user-plus"></i> Register Student
                        </button>
                    </div>
                </div>
            `;
        },

        getRegisterStudentHTML() {
            return `
                <div class="fade-in" style="max-width: 600px; margin: 0 auto;">
                    <div class="card">
                        <h2 style="margin-bottom: 1.5rem;"><i class="fas fa-user-plus"></i> Register New Student</h2>
                        <form id="register-form">
                            <div class="form-group">
                                <label>Full Name</label>
                                <input type="text" id="student-name" class="form-input" required placeholder="John Doe">
                            </div>
                            <div class="form-group">
                                <label>Roll Number</label>
                                <input type="text" id="student-roll" class="form-input" required placeholder="CS101">
                            </div>
                            <div class="form-group">
                                <label>Face Image (Passport size preferred)</label>
                                <div class="upload-box" id="upload-trigger">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <p>Click or Drag photo here</p>
                                    <input type="file" id="student-image" accept="image/*" style="display: none;" required>
                                    <img id="preview-img">
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block" id="reg-submit">
                                Register Student
                            </button>
                        </form>
                    </div>
                </div>
            `;
        },

        getTakeAttendanceHTML() {
            return `
                <div class="fade-in" style="max-width: 600px; margin: 0 auto;">
                    <div class="card">
                        <h2 style="margin-bottom: 1.5rem;"><i class="fas fa-camera"></i> Mark Class Attendance</h2>
                        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Upload or capture an image of the entire classroom.</p>
                        <form id="attendance-form">
                            <div class="form-group">
                                <label>Subject / Class Name</label>
                                <input type="text" id="subject" class="form-input" required placeholder="Mathematics - 10th Grade">
                            </div>
                            <div class="form-group">
                                <label>Classroom Image</label>
                                <div class="upload-box" id="upload-trigger">
                                    <i class="fas fa-camera-retro"></i>
                                    <p>Snap or upload classroom photo</p>
                                    <input type="file" id="class-image" accept="image/*" style="display: none;" required>
                                    <img id="preview-img">
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block" id="att-submit">
                                Process Attendance
                            </button>
                        </form>
                    </div>
                </div>
            `;
        },

        async getHistoryHTML() {
            let history = [];
            try {
                history = await api.getHistory(this.currentUser.id);
            } catch (e) {
                console.error("History load failed", e);
            }

            const rows = history.map(session => `
                <tr>
                    <td>${new Date(session.created_at).toLocaleString()}</td>
                    <td><b>${session.subject}</b></td>
                    <td><span class="badge">${session.attendance_records[0].count} Students</span></td>
                    <td>
                        <button class="btn btn-sm view-details" data-id="${session.id}" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;">
                            View Details
                        </button>
                    </td>
                </tr>
            `).join('');

            return `
                <div class="fade-in">
                    <h1 style="margin-bottom: 2rem;"><i class="fas fa-history"></i> Attendance History</h1>
                    <div class="card">
                        <div class="data-table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Subject</th>
                                        <th>Present Count</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rows || '<tr><td colspan="4" style="text-align: center;">No history found</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div id="details-modal" class="modal" style="display:none;"></div>
                </div>
            `;
        },

        // --- Event Binding ---

        bindAuthEvents() {
            const form = document.getElementById('auth-form');
            const toggleLink = document.getElementById('auth-toggle-link');
            let isLogin = true;

            toggleLink.addEventListener('click', (e) => {
                e.preventDefault();
                isLogin = !isLogin;
                document.getElementById('auth-subtitle').textContent = isLogin ? 'Teacher Login' : 'Teacher Sign Up';
                document.getElementById('auth-submit-btn').textContent = isLogin ? 'Login' : 'Sign Up';
                document.getElementById('auth-toggle-text').textContent = isLogin ? "Don't have an account?" : "Already have an account?";
                toggleLink.textContent = isLogin ? 'Sign Up' : 'Login';
            });

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const btn = document.getElementById('auth-submit-btn');

                btn.disabled = true;
                btn.textContent = 'Processing...';

                try {
                    const res = isLogin
                        ? await api.login(email, password)
                        : await api.signup(email, password);

                    this.currentUser = res.user;
                    localStorage.setItem('user', JSON.stringify(res.user));
                    localStorage.setItem('session', JSON.stringify(res.session));

                    this.showToast(isLogin ? 'Login successful!' : 'Registration successful!');
                    this.render();
                } catch (err) {
                    this.showToast(err.message, 'error');
                    btn.disabled = false;
                    btn.textContent = isLogin ? 'Login' : 'Sign Up';
                }
            });
        },

        bindRegisterEvents() {
            const form = document.getElementById('register-form');
            const uploadTrigger = document.getElementById('upload-trigger');
            const fileInput = document.getElementById('student-image');
            const preview = document.getElementById('preview-img');

            uploadTrigger.addEventListener('click', () => fileInput.click());

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (re) => {
                        preview.src = re.target.result;
                        preview.style.display = 'block';
                        uploadTrigger.querySelector('i').style.display = 'none';
                        uploadTrigger.querySelector('p').style.display = 'none';
                    };
                    reader.readAsDataURL(file);
                }
            });

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('student-name').value;
                const roll = document.getElementById('student-roll').value;
                const file = fileInput.files[0];
                const btn = document.getElementById('reg-submit');

                btn.disabled = true;
                btn.textContent = 'Registering...';

                try {
                    await api.registerStudent(name, roll, file);
                    this.showToast('Student registered successfully!');
                    this.setView('dashboard');
                } catch (err) {
                    this.showToast(err.message, 'error');
                    btn.disabled = false;
                    btn.textContent = 'Register Student';
                }
            });
        },

        bindAttendanceEvents() {
            const form = document.getElementById('attendance-form');
            const uploadTrigger = document.getElementById('upload-trigger');
            const fileInput = document.getElementById('class-image');
            const preview = document.getElementById('preview-img');

            uploadTrigger.addEventListener('click', () => fileInput.click());

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (re) => {
                        preview.src = re.target.result;
                        preview.style.display = 'block';
                        uploadTrigger.querySelector('i').style.display = 'none';
                        uploadTrigger.querySelector('p').style.display = 'none';
                    };
                    reader.readAsDataURL(file);
                }
            });

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const subject = document.getElementById('subject').value;
                const file = fileInput.files[0];
                const btn = document.getElementById('att-submit');

                btn.disabled = true;
                btn.textContent = 'Analyzing Classroom...';

                try {
                    const res = await api.takeAttendance(subject, this.currentUser.id, file);
                    this.showToast(`Attendance marked! ${res.present_count} students identified.`);
                    this.setView('history');
                } catch (err) {
                    this.showToast(err.message, 'error');
                    btn.disabled = false;
                    btn.textContent = 'Process Attendance';
                }
            });
        },

        bindHistoryEvents() {
            document.querySelectorAll('.view-details').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const sessionId = e.currentTarget.dataset.id;
                    try {
                        const details = await api.getSessionDetails(sessionId);
                        let detailList = details.map(d => `<li>${d.students.name} (${d.students.roll_number})</li>`).join('');
                        alert("Present Students:\n" + (detailList ? details.map(d => `- ${d.students.name}`).join('\n') : "No students identified"));
                    } catch (err) {
                        this.showToast("Failed to load details", "error");
                    }
                });
            });
        }
    };

    window.app = app;
    app.init();
});
