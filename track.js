// ============ HALAMAN LACAK ============
function initLacak() {
    const btnCari = document.getElementById('btnCari');
    const idInput = document.getElementById('searchLaporan');
    const emailInput = document.getElementById('searchEmail');
    if (!btnCari || !idInput || !emailInput) return;

    function renderReport(l, note = '') {
        const statusClass = ['Diterima', 'Diproses', 'Selesai'].includes(l.status) ? l.status : 'Diterima';
        const alamat = l.alamat || '-';
        const deskripsi = l.deskripsi || '-';
        const statusStages = ['Diterima', 'Diproses', 'Selesai'];
        const currentStage = statusStages.indexOf(statusClass);
        const history = Array.isArray(l.status_history) ? l.status_history : [];
        const stageTimes = new Map();
        history.forEach(item => {
            if (item.status && item.changed_at) stageTimes.set(item.status, item.changed_at);
        });
        const progress = currentStage < 0 ? 0 : (currentStage / (statusStages.length - 1)) * 100;
        const timeline = statusStages.map((status, index) => {
            const state = index < currentStage ? 'is-complete' : index === currentStage ? 'is-current' : '';
            const timestamp = stageTimes.get(status);
            return `
                <li class="timeline-item ${state}">
                    <span class="timeline-marker" aria-hidden="true">${index < currentStage || (statusClass === 'Selesai' && index === currentStage) ? '✓' : index + 1}</span>
                    <div class="timeline-content">
                        <strong>${status}</strong>
                        ${timestamp ? `<time datetime="${escapeHtml(timestamp)}">${escapeHtml(formatAdminDate ? formatAdminDate(timestamp) : timestamp)}</time>` : ''}
                    </div>
                </li>`;
        }).join('');
        const completionPhotoUrl = l.foto_pengerjaan || l.completion_photo_url || null;
        const completionProof = completionPhotoUrl
            ? `
                    <section class="track-evidence" aria-label="Bukti penyelesaian">
                        <h4>Bukti Penyelesaian Pengerjaan</h4>
                        <p class="track-evidence-note">Foto bukti yang tersimpan pada laporan ini.</p>
                        <img src="${escapeHtml(completionPhotoUrl)}" alt="Bukti penyelesaian laporan #${escapeHtml(l.id)}" class="track-evidence-photo" loading="lazy">
                    </section>`
            : (statusClass === 'Selesai'
                ? `
                    <section class="track-evidence" aria-label="Bukti penyelesaian">
                        <h4>Bukti Penyelesaian Pengerjaan</h4>
                        <p class="track-evidence-note">Laporan selesai, tetapi bukti foto belum tersedia.</p>
                    </section>`
                : '');
        return `
                <article class="track-result-card">
                    <header class="track-result-header">
                        <h3>Laporan #${escapeHtml(l.id)}</h3>
                        ${renderStatusBadge(statusClass)}
                    </header>
                    <div class="track-result-details">
                        <p><strong>Kategori:</strong> ${escapeHtml(l.kategori || '-')}</p>
                        <p><strong>Alamat:</strong> ${escapeHtml(alamat)}</p>
                        <p><strong>Tanggal:</strong> ${escapeHtml(l.tanggal || '-')}</p>
                        <p><strong>Deskripsi:</strong> ${escapeHtml(deskripsi)}</p>
                    </div>
                    ${completionProof}
                    ${note ? `<p class="track-offline-note" role="note">${escapeHtml(note)}</p>` : ''}
                    <section class="track-progress" aria-label="Progres laporan">
                        <h4>Progres penanganan</h4>
                        <div class="track-progress-bar" aria-hidden="true"><span style="width:${progress}%"></span></div>
                        <ol class="timeline">${timeline}</ol>
                    </section>
                </article>`;
    }

    const myReportsList = document.getElementById('myReportsList');
    const refreshMyReportsButton = document.getElementById('btnRefreshMyReports');
    if (refreshMyReportsButton) {
        refreshMyReportsButton.addEventListener('click', function() {
            refreshMyReportsButton.disabled = true;
            loadMyReports().finally(() => { refreshMyReportsButton.disabled = false; });
        });
    }
    if (myReportsList) {
        myReportsList.addEventListener('click', function(event) {
            if (!(event.target instanceof Element)) return;
            const button = event.target.closest('[data-report-id]');
            if (!button) return;
            idInput.value = button.dataset.reportId;
            emailInput.value = button.dataset.reportEmail;
            btnCari.click();
        });
        loadMyReports();
    }

    btnCari.addEventListener('click', async function() {
        const id = idInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const hasil = document.getElementById('hasilLacak');
        if (!id || !email) { alert('Masukkan ID Laporan dan email yang dipakai saat melapor.'); return; }
        if (!/^\d+$/.test(id)) { alert('ID Laporan harus berupa angka.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Format email tidak valid.'); return; }

        btnCari.disabled = true;
        try {
            hasil.style.display = 'block';
            hasil.innerHTML = '<p style="text-align:center;color:#2563eb;">Mencari laporan...</p>';
            const reports = getStoredReports();
            const found = reports.find(report =>
                String(report.id) === id &&
                String(report.email || '').trim().toLowerCase() === email
            );
            if (found) {
                hasil.innerHTML = renderReport(found, 'Data ditampilkan dari penyimpanan browser perangkat ini (versi statis).');
            } else {
                hasil.innerHTML = '<p role="alert" style="text-align:center;color:#ef4444;">Laporan tidak ditemukan di perangkat ini. Periksa ID Laporan, email, atau pastikan laporan dibuat di browser ini.</p>';
            }
            loadMyReports();
        } catch (error) {
            showRequestError(error);
        } finally {
            btnCari.disabled = false;
        }
    });
}
