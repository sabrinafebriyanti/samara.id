function populateAdminCategoryFilter(reports) {
    const select = document.getElementById('adminCategoryFilter');
    if (!select) return;

    const selectedCategory = select.value;
    const categories = [...new Set(
        reports.map(report => String(report.kategori || '').trim()).filter(Boolean)
    )].sort((left, right) => left.localeCompare(right, 'id'));
    select.innerHTML = '<option value="">Semua kategori</option>' +
        categories.map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('');
    if (categories.includes(selectedCategory)) select.value = selectedCategory;
}

function renderAdminCitizenDirectory(reports) {
    const tbody = document.getElementById('adminCitizensTableBody');
    if (!tbody) return;

    const citizens = new Map();
    reports.forEach(report => {
        const email = String(report.email || '').trim();
        if (!email) return;
        const key = email.toLocaleLowerCase();
        const current = citizens.get(key) || {
            nama: String(report.nama || 'Warga'),
            email,
            jumlah: 0,
            tanggalTerakhir: ''
        };
        current.jumlah += 1;
        const reportDate = String(report.tanggal || '');
        if (reportDate > current.tanggalTerakhir) {
            current.tanggalTerakhir = reportDate;
            current.nama = String(report.nama || current.nama);
            current.email = email;
        }
        citizens.set(key, current);
    });

    const rows = [...citizens.values()].sort((left, right) =>
        right.tanggalTerakhir.localeCompare(left.tanggalTerakhir)
    );
    if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">Belum ada data warga dari laporan.</td></tr>';
        return;
    }

    tbody.innerHTML = rows.map(citizen => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-900">${escapeHtml(citizen.nama)}</td>
            <td class="px-6 py-4 text-gray-600">${escapeHtml(citizen.email)}</td>
            <td class="px-6 py-4 text-gray-600">${citizen.jumlah}</td>
            <td class="px-6 py-4 text-gray-600">${escapeHtml(citizen.tanggalTerakhir || '—')}</td>
        </tr>
    `).join('');
}

function renderMonthlyReportTraffic(reports) {
    const chart = document.getElementById('adminMonthlyTraffic');
    if (!chart) return;

    const now = new Date();
    const months = [];
    for (let offset = 11; offset >= 0; offset -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        months.push({
            key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            label: new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date),
            year: date.getFullYear()
        });
    }

    const counts = new Map(months.map(month => [month.key, 0]));
    reports.forEach(report => {
        const match = String(report.tanggal || '').match(/^(\d{4})-(\d{2})/);
        if (!match) return;
        const key = `${match[1]}-${match[2]}`;
        if (counts.has(key)) counts.set(key, counts.get(key) + 1);
    });

    const maxCount = Math.max(1, ...counts.values());
    const bars = months.map(month => {
        const count = counts.get(month.key);
        const height = count === 0 ? 0 : Math.max(6, Math.round((count / maxCount) * 100));
        return `
            <div class="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                <span class="text-xs font-semibold text-gray-600">${count}</span>
                <div class="flex h-40 w-full items-end justify-center rounded-t-lg bg-gray-50">
                    <div class="w-2/3 max-w-10 rounded-t-md bg-emerald-500 transition-all" style="height:${height}%"></div>
                </div>
                <span class="text-[11px] text-gray-500">${month.label}</span>
            </div>`;
    }).join('');
    const yearLabels = [...new Set(months.map(month => month.year))].join(' · ');

    chart.setAttribute('aria-label', `Grafik laporan bulanan ${yearLabels}. Total ${reports.length} laporan.`);
    chart.innerHTML = `
        <div class="overflow-x-auto">
            <div class="min-w-[680px]">
                <div class="flex items-end gap-2 sm:gap-3" aria-hidden="true">${bars}</div>
            </div>
        </div>
        <p class="mt-3 text-center text-xs text-gray-400">${yearLabels}</p>`;
}

function renderCategoryReportTraffic(reports) {
    const chart = document.getElementById('adminCategoryTraffic');
    if (!chart) return;

    const categoryCounts = new Map();
    reports.forEach(report => {
        const category = String(report.kategori || 'Tanpa kategori').trim() || 'Tanpa kategori';
        categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    });
    const categories = [...categoryCounts.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 8);

    if (categories.length === 0) {
        chart.innerHTML = '<p class="text-sm text-gray-500">Belum ada data laporan.</p>';
        return;
    }

    const maxCount = categories[0][1];
    chart.setAttribute('aria-label', `Grafik laporan menurut kategori dari ${reports.length} laporan.`);
    chart.innerHTML = categories.map(([category, count]) => `
        <div>
            <div class="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span class="truncate font-medium text-gray-700">${escapeHtml(category)}</span>
                <span class="shrink-0 text-gray-500">${count}</span>
            </div>
            <div class="h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div class="h-full rounded-full bg-emerald-500" style="width:${Math.round((count / maxCount) * 100)}%"></div>
            </div>
        </div>
    `).join('');
}

function renderAverageResponseTime(reports) {
    const valueElement = document.getElementById('adminAverageResponseTime');
    const samplesElement = document.getElementById('adminResponseTimeSamples');
    if (!valueElement || !samplesElement) return;

    const durations = reports
        .filter(report => report.status === 'Selesai' && report.created_at && report.completed_at)
        .map(report => Date.parse(report.completed_at) - Date.parse(report.created_at))
        .filter(duration => Number.isFinite(duration) && duration >= 0);

    if (durations.length === 0) {
        valueElement.textContent = '—';
        samplesElement.textContent = 'Belum ada data waktu penyelesaian yang tercatat.';
        return;
    }

    const averageHours = durations.reduce((sum, duration) => sum + duration, 0) / durations.length / 3600000;
    valueElement.textContent = averageHours < 1
        ? `${Math.max(1, Math.round(averageHours * 60))} menit`
        : averageHours < 48
            ? `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(averageHours)} jam`
            : `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(averageHours / 24)} hari`;
    samplesElement.textContent = `Rata-rata dari ${durations.length} laporan selesai`;
}

function renderAdminNotifications(reports) {
    const countElement = document.getElementById('adminNotificationsCount');
    const listElement = document.getElementById('adminNotificationsList');
    if (!countElement || !listElement) return;

    const newReports = reports.filter(report => report.status === 'Diterima');
    countElement.textContent = String(newReports.length);
    countElement.setAttribute('aria-label', `${newReports.length} laporan baru`);
    countElement.classList.toggle('hidden', newReports.length === 0);
    const notificationToggle = document.getElementById('adminNotificationToggle');
    if (notificationToggle) {
        notificationToggle.setAttribute(
            'aria-label',
            newReports.length ? `Buka notifikasi admin, ${newReports.length} laporan baru` : 'Buka notifikasi admin'
        );
    }

    if (newReports.length === 0) {
        listElement.innerHTML = `
            <li class="p-5 text-sm text-gray-500">
                Belum ada laporan baru.
            </li>`;
        return;
    }

    const visibleReports = newReports.slice(0, 5);
    listElement.innerHTML = visibleReports.map(report => `
        <li>
            <a href="#daftar-laporan" class="block px-5 py-4 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none">
                <p class="text-sm font-semibold text-gray-900">Laporan #${escapeHtml(report.id)} menunggu ditinjau</p>
                <p class="mt-1 text-xs text-gray-600">${escapeHtml(report.kategori || 'Kategori tidak tersedia')} · ${escapeHtml(report.nama || 'Warga')}</p>
                ${report.tanggal ? `<p class="mt-1 text-xs text-gray-400">${escapeHtml(report.tanggal)}</p>` : ''}
            </a>
        </li>
    `).join('');

    if (newReports.length > visibleReports.length) {
        listElement.insertAdjacentHTML('beforeend', `
            <li class="px-5 py-3 bg-gray-50 text-xs text-gray-500">
                ${newReports.length - visibleReports.length} laporan baru lainnya.
            </li>`);
    }
}

// Render Data Table Terintegrasi dengan Tailwind CSS
function getFilteredDashboardReports() {
    const searchInput = document.getElementById('adminSearch');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const dateFrom = document.getElementById('adminDateFrom')?.value || '';
    const dateTo = document.getElementById('adminDateTo')?.value || '';
    const category = document.getElementById('adminCategoryFilter')?.value || '';
    const errorElement = document.getElementById('adminFilterError');

    if (dateFrom && dateTo && dateFrom > dateTo) {
        if (errorElement) {
            errorElement.textContent = 'Rentang tanggal tidak valid: tanggal awal harus sebelum atau sama dengan tanggal akhir.';
            errorElement.classList.remove('hidden');
        }
        return [];
    }

    if (errorElement) errorElement.classList.add('hidden');
    return adminReports.filter(report => {
        if (query && filterReports([report], query).length === 0) return false;
        if (category && report.kategori !== category) return false;
        const reportDate = String(report.tanggal || '').slice(0, 10);
        if (dateFrom && (!reportDate || reportDate < dateFrom)) return false;
        if (dateTo && (!reportDate || reportDate > dateTo)) return false;
        return true;
    });
}

function renderDashboardTable() {
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;
    const reports = getFilteredDashboardReports();
    const filterError = document.getElementById('adminFilterError');
    
    if (reports.length === 0) {
        const message = filterError && !filterError.classList.contains('hidden')
            ? 'Periksa rentang tanggal yang dipilih.'
            : 'Tidak ada laporan yang sesuai dengan filter.';
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center">
                        <span class="text-3xl mb-2">📭</span>
                        <p class="font-medium">${message}</p>
                    </div>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = reports.map(report => {
        let badgeClass = '';
        let dotColor = '';
        if (report.status === 'Diterima') {
            badgeClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
            dotColor = 'bg-yellow-500';
        } else if (report.status === 'Diproses') {
            badgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
            dotColor = 'bg-blue-500';
        } else {
            badgeClass = 'bg-green-100 text-green-800 border-green-200';
            dotColor = 'bg-green-500';
        }

        const statusActions = report.status === 'Diterima'
            ? `<button type="button" class="text-blue-600 hover:text-blue-800 font-medium text-sm mr-3 transition-colors" data-action="proses" data-id="${escapeHtml(report.id)}">Proses</button>`
            : '';
        const selesaiAction = report.status === 'Diproses'
            ? `<button type="button" class="text-emerald-600 hover:text-emerald-800 font-medium text-sm mr-3 transition-colors" data-action="selesai" data-id="${escapeHtml(report.id)}">Selesai</button>`
            : '';
        const hasPhoto = Boolean(
            report.has_foto || report.foto || report.has_foto_pengerjaan
        );
        const photoAction = hasPhoto
            ? `<button type="button" class="text-emerald-700 hover:text-emerald-900 font-semibold text-sm whitespace-nowrap" data-action="detail" data-id="${escapeHtml(report.id)}">${report.has_foto && report.has_foto_pengerjaan ? 'Foto warga · Bukti petugas' : report.has_foto_pengerjaan ? 'Bukti petugas' : 'Lihat foto'}</button>`
            : '<span class="text-xs text-gray-400">Tidak ada</span>';
        const receivedAt = report.created_at
            ? formatAdminDate(report.created_at)
            : report.tanggal
                ? `${formatAdminDate(report.tanggal, false)} · Jam belum tercatat`
                : 'Waktu tidak tersedia';

        return `
        <tr class="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-0">
            <td class="px-6 py-4 font-medium text-gray-900">#${escapeHtml(report.id)}</td>
            <td class="px-6 py-4 text-gray-900 font-medium">
                ${escapeHtml(report.nama)}
                <div class="text-xs text-gray-500 font-normal mt-0.5">${escapeHtml(report.email)}</div>
            </td>
            <td class="px-6 py-4 text-gray-600 text-xs">${escapeHtml(receivedAt)}</td>
            <td class="px-6 py-4 text-gray-600">${escapeHtml(report.kategori)}</td>
            <td class="px-6 py-4">${photoAction}</td>
            <td class="px-6 py-4 text-gray-600 text-xs">${escapeHtml(report.alamat)}</td>
            <td class="px-6 py-4 text-gray-600">${escapeHtml(report.assigned_to || 'Belum ditugaskan')}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badgeClass}">
                    <span class="w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}"></span>
                    ${escapeHtml(report.status)}
                </span>
            </td>
            <td class="px-6 py-4 text-right whitespace-nowrap">
                <button type="button" class="text-emerald-700 hover:text-emerald-900 font-medium text-sm mr-3 transition-colors" data-action="detail" data-id="${escapeHtml(report.id)}">Detail</button>
                ${statusActions}
                ${selesaiAction}
                <button type="button" class="text-red-600 hover:text-red-800 font-medium text-sm transition-colors" data-action="hapus" data-id="${escapeHtml(report.id)}">Hapus</button>
            </td>
        </tr>
        `;
    }).join('');
}

function formatAdminDate(value, includeTime = true) {
    if (!value) return 'Waktu tidak tersedia';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const options = { dateStyle: 'full' };
    if (includeTime) options.timeStyle = 'short';
    return new Intl.DateTimeFormat('id-ID', options).format(date);
}


