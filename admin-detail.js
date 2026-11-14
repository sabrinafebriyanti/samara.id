async function openAdminReportDetail(reportId) {
    const modal = document.getElementById('adminReportModal');
    const title = document.getElementById('adminReportModalTitle');
    const content = document.getElementById('adminReportModalContent');
    if (!modal || !title || !content) return;

    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    content.innerHTML = '<p class="text-sm text-gray-500">Memuat detail laporan...</p>';

    try {
        const reports = getStoredReports();
        const report = reports.find(item => String(item.id) === String(reportId));
        if (!report) throw new Error('Laporan tidak ditemukan di penyimpanan browser.');
        const history = Array.isArray(report.status_history) ? report.status_history : [{
            status: report.status,
            note: 'Riwayat awal',
            assigned_to: report.assigned_to || null,
            changed_at: report.created_at || report.tanggal
        }];
        const photoUrl = typeof report.foto === 'string' ? report.foto : null;
        const completionPhotoUrl = typeof report.foto_pengerjaan === 'string' ? report.foto_pengerjaan : null;

        title.textContent = `Laporan #${report.id}`;
        const latitude = Number(report.lat);
        const longitude = Number(report.lng);
        const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
        const whatsappDigits = String(report.whatsapp || '').replace(/\D/g, '');
        const whatsappNumber = whatsappDigits.startsWith('0')
            ? `62${whatsappDigits.slice(1)}`
            : whatsappDigits.startsWith('8')
                ? `62${whatsappDigits}`
                : whatsappDigits;
        const whatsappUrl = /^\d{8,15}$/.test(whatsappNumber)
            ? `https://wa.me/${whatsappNumber}`
            : '';
        const mapUrl = hasCoordinates
            ? `https://www.openstreetmap.org/?mlat=${encodeURIComponent(latitude)}&mlon=${encodeURIComponent(longitude)}#map=18/${encodeURIComponent(latitude)}/${encodeURIComponent(longitude)}`
            : '';
        const validStatuses = ['Diterima', 'Diproses', 'Selesai'];
        const currentStatus = validStatuses.includes(report.status) ? report.status : 'Diterima';
        const historyMarkup = history.map(item => `
            <li class="relative border-l border-gray-200 pb-5 pl-5 last:pb-0">
                <span class="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white"></span>
                <p class="text-sm font-semibold text-gray-800">${escapeHtml(item.status || 'Pembaruan')}</p>
                <p class="mt-1 text-xs text-gray-500">${escapeHtml(formatAdminDate(item.changed_at))}${item.assigned_to ? ` — Petugas: ${escapeHtml(item.assigned_to)}` : ''}</p>
                ${item.note ? `<p class="mt-1 text-sm text-gray-600">${escapeHtml(item.note)}</p>` : ''}
            </li>
        `).join('');

        content.innerHTML = `
            <div class="space-y-5">
                <h3 class="font-bold text-gray-900">Foto Bukti dari Warga</h3>
                <div class="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    ${photoUrl
                        ? `<img src="${escapeHtml(photoUrl)}" alt="Foto bukti laporan #${escapeHtml(report.id)}" class="max-h-80 w-full object-contain">`
                        : '<div class="flex min-h-40 items-center justify-center px-4 text-sm text-gray-500">Tidak ada foto bukti untuk laporan ini.</div>'}
                </div>
                <h3 class="font-bold text-gray-900">Bukti Pengerjaan Petugas</h3>
                <div class="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    ${completionPhotoUrl
                        ? `<img src="${escapeHtml(completionPhotoUrl)}" alt="Bukti pengerjaan laporan #${escapeHtml(report.id)}" class="max-h-80 w-full object-contain">`
                        : '<div class="flex min-h-32 items-center justify-center px-4 text-center text-sm text-gray-500">Petugas belum mengunggah bukti pengerjaan.</div>'}
                </div>
                <div class="space-y-3">
                    <div><p class="text-xs font-semibold uppercase text-gray-400">Kategori</p><p class="mt-1 font-medium text-gray-900">${escapeHtml(report.kategori || '-')}</p></div>
                    <div><p class="text-xs font-semibold uppercase text-gray-400">Deskripsi warga</p><p class="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700">${escapeHtml(report.deskripsi || 'Tidak ada deskripsi.')}</p></div>
                    <div><p class="text-xs font-semibold uppercase text-gray-400">Alamat</p><p class="mt-1 text-sm text-gray-700">${escapeHtml(report.alamat || '-')}</p></div>
                    <div>
                        <p class="text-xs font-semibold uppercase text-gray-400">Koordinat</p>
                        ${hasCoordinates
                            ? `<a href="${mapUrl}" target="_blank" rel="noopener noreferrer" class="mt-1 inline-block text-sm font-medium text-emerald-700 hover:underline">${latitude.toFixed(6)}, ${longitude.toFixed(6)} — Buka peta</a>`
                            : '<p class="mt-1 text-sm text-gray-700">Koordinat tidak tersedia.</p>'}
                    </div>
                    <div>
                        <p class="text-xs font-semibold uppercase text-gray-400">Pelapor</p>
                        <p class="mt-1 text-sm text-gray-700">${escapeHtml(report.nama || '-')} — ${escapeHtml(report.email || '-')}</p>
                        ${whatsappUrl
                            ? `<a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="mt-1 inline-block text-sm font-medium text-emerald-700 hover:underline">Chat WhatsApp — ${escapeHtml(report.whatsapp)}</a>`
                            : '<p class="mt-1 text-xs text-gray-500">Nomor WhatsApp belum dicantumkan.</p>'}
                    </div>
                </div>
            </div>
            <div class="space-y-6">
                <form id="adminReportUpdateForm" class="space-y-4 rounded-xl border border-gray-200 p-4">
                    <h3 class="font-bold text-gray-900">Tindak lanjut</h3>
                    <label class="block text-sm font-medium text-gray-700" for="adminReportAssignee">Petugas penanggung jawab</label>
                    <input id="adminReportAssignee" name="assigned_to" type="text" list="adminAssigneeOptions" maxlength="100" value="${escapeHtml(report.assigned_to || '')}" placeholder="Contoh: petugas@samara.com" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100">
                    <datalist id="adminAssigneeOptions">
                        <option value="petugas@samara.com" label="Petugas Lapangan"></option>
                    </datalist>
                    <p class="text-xs text-gray-500">Agar muncul di panel petugas demo (versi statis), tugaskan ke <strong>petugas@samara.com</strong>.</p>
                    <label class="block text-sm font-medium text-gray-700" for="adminReportStatus">Status laporan</label>
                    <select id="adminReportStatus" name="status" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100">
                        ${validStatuses.map(status => `<option value="${status}"${status === currentStatus ? ' selected' : ''}>${status}</option>`).join('')}
                    </select>
                    <label class="block text-sm font-medium text-gray-700" for="adminReportNote">Catatan admin</label>
                    <textarea id="adminReportNote" name="note" rows="3" maxlength="500" placeholder="Tambahkan catatan perkembangan (opsional)" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"></textarea>
                    <p id="adminReportUpdateError" class="hidden text-sm text-red-600" role="alert"></p>
                    <button type="submit" class="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Simpan tindak lanjut</button>
                </form>
                <div>
                    <h3 class="mb-4 font-bold text-gray-900">Riwayat tindak lanjut</h3>
                    ${historyMarkup ? `<ol class="ml-1">${historyMarkup}</ol>` : '<p class="text-sm text-gray-500">Belum ada riwayat tindak lanjut.</p>'}
                </div>
            </div>`;

        const updateForm = document.getElementById('adminReportUpdateForm');
        updateForm.addEventListener('submit', event => {
            event.preventDefault();
            saveAdminReportUpdate(report, updateForm);
        });
    } catch (error) {
        console.error('Detail laporan gagal dimuat:', error);
        content.innerHTML = `<p class="text-sm text-red-600" role="alert">${escapeHtml(error.message || 'Detail laporan gagal dimuat.')}</p>`;
    }
}

async function saveAdminReportUpdate(report, form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const errorElement = document.getElementById('adminReportUpdateError');
    const formData = new FormData(form);
    const update = {
        assigned_to: String(formData.get('assigned_to') || ''),
        status: String(formData.get('status') || ''),
        note: String(formData.get('note') || '')
    };
    submitButton.disabled = true;
    if (errorElement) errorElement.classList.add('hidden');

    try {
        const reports = getStoredReports();
        const index = reports.findIndex(item => String(item.id) === String(report.id));
        if (index < 0) throw new Error('Laporan tidak ditemukan di penyimpanan browser.');
        const localReport = reports[index];
        const assignedTo = update.assigned_to.trim() || null;
        const statusChanged = localReport.status !== update.status;
        const assigneeChanged = (localReport.assigned_to || null) !== assignedTo;
        const note = update.note.trim();
        if (statusChanged || assigneeChanged || note) {
            const changedAt = new Date().toISOString();
            localReport.status_history = Array.isArray(localReport.status_history)
                ? localReport.status_history
                : [{
                    status: localReport.status,
                    note: 'Riwayat awal',
                    assigned_to: localReport.assigned_to || null,
                    changed_at: localReport.created_at || localReport.tanggal
                }];
            localReport.status = update.status;
            localReport.assigned_to = assignedTo;
            if (statusChanged) {
                localReport.completed_at = update.status === 'Selesai' ? changedAt : null;
            }
            localReport.status_history.unshift({
                status: update.status,
                note,
                assigned_to: assignedTo,
                changed_at: changedAt
            });
            if (!saveStoredReports(reports)) throw new Error('Perubahan tidak dapat disimpan di penyimpanan browser.');
        }
        renderDashboard(reports);
        await openAdminReportDetail(report.id);
    } catch (error) {
        console.error('Perubahan tindak lanjut gagal:', error);
        if (errorElement) {
            errorElement.textContent = error.message || 'Perubahan gagal disimpan.';
            errorElement.classList.remove('hidden');
        }
    } finally {
        submitButton.disabled = false;
    }
}

function closeAdminReportDetail() {
    const modal = document.getElementById('adminReportModal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

function showAdminView() {
    const main = document.querySelector('main');
    if (!main || main.id === 'admin') return;
    main.querySelectorAll(':scope > section').forEach(section => {
        section.style.display = section.id === 'admin' ? 'block' : 'none';
    });
}

function showMainView() {
    const main = document.querySelector('main');
    if (!main || main.id === 'admin') return;
    main.querySelectorAll(':scope > section').forEach(section => {
        section.style.display = section.id === 'admin' ? 'none' : '';
    });
}


