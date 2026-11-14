// ============ HALAMAN DASHBOARD ADMIN ============
let adminReports = [];

function filterReports(reports, query) {
    const value = query.trim().toLowerCase();
    if (!value) return reports;
    return reports.filter(report => {
        const idText = String(report.id || '');
        const namaText = String(report.nama || '');
        const kategoriText = String(report.kategori || '');
        return idText.includes(value) || namaText.toLowerCase().includes(value) || kategoriText.toLowerCase().includes(value);
    });
}

let dashboardDataSource = 'local';

async function loadDashboardData() {
    dashboardDataSource = 'local';
    adminReports = getStoredReports();
    renderDashboard(adminReports);
    refreshMapMarkers().catch(error => {
        console.error('Peta laporan admin gagal diperbarui:', error);
    });
    return dashboardDataSource;
}

function renderDashboard(reports = adminReports) {
    adminReports = reports;

    const totalElement = document.getElementById('adminStatTotal');
    const wargaElement = document.getElementById('adminStatWarga');
    const diprosesElement = document.getElementById('adminStatDiproses');
    const selesaiElement = document.getElementById('adminStatSelesai');
    const total = reports.length;
    const wargaAktif = new Set(reports.map(report => String(report.email || '').toLowerCase()).filter(Boolean)).size;
    const diproses = reports.filter(report => report.status === 'Diproses').length;
    const selesai = reports.filter(report => report.status === 'Selesai').length;
    if (totalElement) totalElement.textContent = String(total);
    if (wargaElement) wargaElement.textContent = String(wargaAktif);
    if (diprosesElement) diprosesElement.textContent = String(diproses);
    if (selesaiElement) selesaiElement.textContent = String(selesai);

    renderAdminNotifications(reports);
    renderMonthlyReportTraffic(reports);
    renderCategoryReportTraffic(reports);
    renderAverageResponseTime(reports);
    renderAdminCitizenDirectory(reports);
    populateAdminCategoryFilter(reports);
    renderDashboardTable();
}
