function initDashboard() {
    const section = document.getElementById('admin');
    const loginScreen = document.getElementById('adminLoginScreen');
    const navigation = document.getElementById('adminNavigation');
    const loginForm = document.getElementById('adminLoginForm');
    const loginEmail = document.getElementById('adminLoginEmail');
    const loginPassword = document.getElementById('adminLoginPassword');
    const loginPasswordToggle = document.getElementById('adminLoginPasswordToggle');
    const loginError = document.getElementById('adminLoginError');
    const loginSubmit = document.getElementById('adminLoginSubmit');
    const searchInput = document.getElementById('adminSearch');
    const dateFromInput = document.getElementById('adminDateFrom');
    const dateToInput = document.getElementById('adminDateTo');
    const categoryFilter = document.getElementById('adminCategoryFilter');
    const clearFiltersButton = document.getElementById('adminClearFilters');
    const tableBody = document.getElementById('adminTableBody');
    const logoutButton = document.getElementById('btnLogoutAdmin');
    const notificationMenu = document.getElementById('adminNotificationMenu');
    const notificationToggle = document.getElementById('adminNotificationToggle');
    const notificationPanel = document.getElementById('adminNotificationsPanel');
    const reportModal = document.getElementById('adminReportModal');
    const reportModalClose = document.getElementById('adminReportModalClose');
    if (!section || !loginScreen || !loginForm || !loginEmail || !loginPassword) return;

    const DEMO_ACCOUNTS = {
        'admin@samara.com': { password: 'petugas123', role: 'admin', display_name: 'Admin SAMARA' },
        'petugas@samara.com': { password: 'petugas123', role: 'petugas', display_name: 'Petugas Lapangan' }
    };

    function showLogin(message) {
        loginScreen.hidden = false;
        if (navigation) navigation.hidden = true;
        section.hidden = true;
        if (message && loginError) {
            loginError.textContent = message;
            loginError.hidden = false;
        }
    }

    function showDashboard() {
        loginScreen.hidden = true;
        if (navigation) navigation.hidden = false;
        section.hidden = false;
        if (loginError) loginError.hidden = true;
    }

    if (loginPasswordToggle) {
        loginPasswordToggle.addEventListener('click', function() {
            const showPassword = loginPassword.type === 'password';
            loginPassword.type = showPassword ? 'text' : 'password';
            loginPasswordToggle.textContent = showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi';
            loginPasswordToggle.setAttribute('aria-pressed', String(showPassword));
        });
    }

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        if (loginSubmit) loginSubmit.disabled = true;
        if (loginError) loginError.hidden = true;
        try {
            const email = loginEmail.value.trim().toLowerCase();
            const password = loginPassword.value;
            const account = DEMO_ACCOUNTS[email];
            if (!account || account.password !== password) {
                throw new Error('Email atau kata sandi salah. Gunakan akun demo versi statis.');
            }
            setLocalSession({ email, role: account.role, display_name: account.display_name });
            if (account.role === 'petugas') {
                window.location.replace('petugas.html');
                return;
            }
            showDashboard();
            await loadDashboardData();
        } catch (error) {
            console.error('Login gagal:', error);
            showLogin(error.message || 'Login gagal. Coba lagi.');
        } finally {
            if (loginSubmit) loginSubmit.disabled = false;
        }
    });

    if (notificationMenu && notificationToggle && notificationPanel) {
        const closeNotifications = function() {
            notificationPanel.classList.add('hidden');
            notificationToggle.setAttribute('aria-expanded', 'false');
        };
        notificationToggle.addEventListener('click', function() {
            const isOpen = notificationToggle.getAttribute('aria-expanded') === 'true';
            notificationPanel.classList.toggle('hidden', isOpen);
            notificationToggle.setAttribute('aria-expanded', String(!isOpen));
        });
        notificationMenu.addEventListener('click', function(event) {
            if (event.target instanceof Element && event.target.closest('a')) closeNotifications();
        });
        document.addEventListener('click', function(event) {
            if (!notificationMenu.contains(event.target)) closeNotifications();
        });
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') closeNotifications();
        });
    }

    if (searchInput) searchInput.addEventListener('input', renderDashboardTable);
    [dateFromInput, dateToInput, categoryFilter].forEach(input => {
        if (input) input.addEventListener('change', renderDashboardTable);
    });
    if (clearFiltersButton) {
        clearFiltersButton.addEventListener('click', function() {
            if (searchInput) searchInput.value = '';
            if (dateFromInput) dateFromInput.value = '';
            if (dateToInput) dateToInput.value = '';
            if (categoryFilter) categoryFilter.value = '';
            renderDashboardTable();
        });
    }
    if (reportModalClose) reportModalClose.addEventListener('click', closeAdminReportDetail);
    if (reportModal) {
        reportModal.addEventListener('click', function(event) {
            if (event.target === reportModal) closeAdminReportDetail();
        });
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && !reportModal.classList.contains('hidden')) {
                closeAdminReportDetail();
            }
        });
    }
    if (tableBody) {
        tableBody.addEventListener('click', async function(event) {
            const button = event.target.closest('[data-action]');
            if (!button) return;
            const id = Number(button.dataset.id);
            if (Number.isNaN(id)) return;
            const action = button.dataset.action;
            if (action === 'detail') {
                await openAdminReportDetail(id);
                return;
            }
            button.disabled = true;
            try {
                const reports = getStoredReports();
                const index = reports.findIndex(report => Number(report.id) === id);
                if (index === -1) return;
                if (action === 'hapus') {
                    reports.splice(index, 1);
                    if (!saveStoredReports(reports)) return;
                } else {
                    const report = reports[index];
                    const nextStatus = action === 'proses' ? 'Diproses' : 'Selesai';
                    const changedAt = new Date().toISOString();
                    report.status_history = Array.isArray(report.status_history)
                        ? report.status_history
                        : [{
                            status: report.status,
                            note: 'Riwayat awal',
                            assigned_to: report.assigned_to || null,
                            changed_at: report.created_at || report.tanggal
                        }];
                    report.status = nextStatus;
                    if (nextStatus === 'Selesai' && !report.completed_at) report.completed_at = changedAt;
                    if (nextStatus !== 'Selesai') report.completed_at = null;
                    report.status_history.unshift({
                        status: nextStatus,
                        note: '',
                        assigned_to: report.assigned_to || null,
                        changed_at: changedAt
                    });
                    if (!saveStoredReports(reports)) return;
                }
                renderDashboard(reports);
            } catch (error) {
                console.error('Perubahan laporan gagal:', error);
                alert(error.message || 'Perubahan laporan gagal disimpan.');
            } finally {
                button.disabled = false;
            }
        });
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            clearLocalSession();
            window.location.replace('../index.html');
        });
    }

    const session = getLocalSession();
    if (!session) {
        showLogin();
        return;
    }
    if (session.role === 'petugas') {
        window.location.replace('petugas.html');
        return;
    }
    if (session.role !== 'admin') {
        showLogin();
        return;
    }
    showDashboard();
    loadDashboardData();
}
