// ============ HALAMAN INDEX ============
async function updateStats() {
    const totalEl = document.getElementById('totalLaporan');
    if (!totalEl) return;
    const totalSelesai = document.getElementById('totalSelesai');
    const totalProses = document.getElementById('totalProses');
    const totalWarga = document.getElementById('totalWarga');
    const reports = getStoredReports();
    totalEl.textContent = reports.length;
    if (totalSelesai) totalSelesai.textContent =
        reports.filter(report => report.status === 'Selesai').length;
    if (totalProses) totalProses.textContent =
        reports.filter(report => report.status === 'Diproses').length;
    if (totalWarga) totalWarga.textContent =
        new Set(reports.map(report => String(report.email || '').trim().toLowerCase()).filter(Boolean)).size;
}

async function loadMyReports() {
    const list = document.getElementById('myReportsList');
    if (!list) return;

    let reports;
    try {
        reports = getStoredReports()
            .sort((left, right) => String(right.created_at || right.tanggal || '').localeCompare(
                String(left.created_at || left.tanggal || '')
            ));
    } catch (error) {
        console.error('Riwayat laporan perangkat tidak dapat dimuat:', error);
        list.innerHTML = '<p class="my-reports-empty" role="alert">Riwayat lokal tidak dapat dibaca. Penyimpanan browser mungkin rusak.</p>';
        return;
    }

    const emailFilter = String(document.getElementById('searchEmail')?.value || '').trim().toLowerCase();
    if (!emailFilter) {
        list.innerHTML = '<p class="my-reports-empty">Masukkan email pelaporan pada kolom Lacak untuk menampilkan riwayat.</p>';
        return;
    }
    reports = reports.filter(report => String(report.email || '').trim().toLowerCase() === emailFilter);

    if (reports.length === 0) {
        list.innerHTML = '<p class="my-reports-empty">Belum ada laporan dengan email tersebut di perangkat ini.</p>';
        return;
    }

    const visibleReports = reports.slice(0, 10);
    const statusLabels = ['Diterima', 'Diproses', 'Selesai'];
    const items = visibleReports.map(report => {
        const status = statusLabels.includes(report.status) ? report.status : 'Diterima';
        return `
            <article class="my-report-item">
                <div class="my-report-copy">
                    <strong>Laporan #${escapeHtml(report.id)} — ${escapeHtml(report.kategori || 'Laporan warga')}</strong>
                    <span>${escapeHtml(report.tanggal || 'Tanggal tidak tersedia')}</span>
                </div>
                ${renderStatusBadge(status)}
                <button type="button" class="btn btn-outline btn-sm my-report-track" data-report-id="${escapeHtml(report.id)}" data-report-email="${escapeHtml(report.email)}">Lihat progres</button>
            </article>`;
    }).join('');
    list.innerHTML = `<p class="my-reports-notice">Riwayat laporan ditampilkan dari penyimpanan browser perangkat ini (versi statis).</p>${items}${reports.length > visibleReports.length
        ? `<p class="my-reports-notice">Menampilkan 10 laporan terbaru dari ${reports.length} laporan di perangkat ini.</p>`
        : ''}`;
}
