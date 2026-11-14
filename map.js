// ============ HALAMAN PETA (LEAFLET) ============
function initPeta() {
    const mapEl = document.getElementById('mapFull');
    if (!mapEl) return;
    if (typeof L === 'undefined') {
        console.warn('Leaflet belum termuat; peta sebaran tidak dapat dibuat.');
        return;
    }

    const map = L.map('mapFull').setView([BANDAR_LAMPUNG_CENTER.lat, BANDAR_LAMPUNG_CENTER.lng], 13);
    const isAdminPage = Boolean(document.getElementById('admin'));
    const mapStatus = document.getElementById('mapStatus');
    const categoryMarkerConfigs = new Map();
    const categoryMarkers = [
        { id: 'road', symbol: '↔', label: 'Jalan rusak', names: ['Jalan Rusak'] },
        { id: 'streetlight', symbol: '💡', label: 'Lampu penerangan mati', names: ['Lampu Mati', 'Lampu Penerangan Mati'] },
        { id: 'traffic', symbol: '🚦', label: 'Lampu lalu lintas mati', names: ['Lampu Lalu Lintas Mati'] },
        { id: 'drain', symbol: '≋', label: 'Drainase tersumbat', names: ['Drainase', 'Drainase Tersumbat'] },
        { id: 'facility', symbol: '◆', label: 'Fasilitas umum rusak', names: ['Taman', 'Taman/Fasilitas Umum Rusak'] },
        { id: 'bus-stop', symbol: '🚏', label: 'Halte rusak', names: ['Halte Rusak'] },
        { id: 'waste', symbol: '♻', label: 'Penumpukan sampah', names: ['Sampah', 'Penumpukan Sampah'] },
        { id: 'other', symbol: '?', label: 'Lainnya', names: ['Lainnya'] }
    ];
    categoryMarkers.forEach(config => {
        config.names.forEach(name => {
            categoryMarkerConfigs.set(name.toLocaleLowerCase('id'), config);
        });
    });
    let mapTilesReady = false;
    let mapDataReady = false;
    let mapTilesError = false;
    let mapDataError = '';
    let visibleReportCount = 0;
    let reportCache = null;
    let reportRequest = null;

    function updateMapStatus() {
        if (!mapStatus) return;
        if (mapDataError) {
            mapStatus.textContent = mapDataError;
        } else if (mapTilesError && !mapTilesReady) {
            mapStatus.textContent = 'Peta dasar gagal dimuat. Periksa koneksi internet Anda.';
        } else if (!mapTilesReady) {
            mapStatus.textContent = 'Memuat peta dasar...';
        } else if (!mapDataReady) {
            mapStatus.textContent = 'Memuat titik laporan...';
        } else if (visibleReportCount === 0) {
            mapStatus.textContent = 'Tidak ada laporan untuk status yang dipilih.';
        } else {
            mapStatus.textContent = `${visibleReportCount} titik laporan ditampilkan. Klik titik untuk melihat detail.`;
        }
    }

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    });
    tileLayer.on('load', function() {
        mapTilesReady = true;
        mapTilesError = false;
        updateMapStatus();
    });
    tileLayer.on('tileerror', function() {
        mapTilesError = true;
        updateMapStatus();
    });
    tileLayer.addTo(map);

    if (typeof ResizeObserver !== 'undefined') {
        const mapResizeObserver = new ResizeObserver(function(entries) {
            if (entries.some(entry => entry.contentRect.width > 0 && entry.contentRect.height > 0)) {
                map.invalidateSize({ pan: false });
            }
        });
        mapResizeObserver.observe(mapEl);
    }

    window.addEventListener('load', () => map.invalidateSize({ pan: false }));
    window.addEventListener('resize', () => map.invalidateSize({ pan: false }));

    let markers = [];
    let currentFilter = 'all';

    async function fetchMapReports(forceRefresh) {
        if (!forceRefresh && reportCache) return reportCache;
        reportCache = getStoredReports();
        return reportCache;
    }

    async function renderMarkers(filter = currentFilter, forceRefresh = false) {
        currentFilter = filter;
        
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        mapDataReady = false;
        mapDataError = '';
        updateMapStatus();
        let reports;
        reports = await fetchMapReports(forceRefresh);
        reports = reports.filter(l =>
            isWithinBandarLampung(Number(l.lat), Number(l.lng)) &&
            (filter === 'all' || l.status === filter)
        );

        reports.forEach(l => {
            const statusClass = l.status === 'Selesai'
                ? 'done'
                : l.status === 'Diproses'
                    ? 'progress'
                    : 'new';
            const statusLabel = l.status === 'Selesai'
                ? 'Selesai'
                : l.status === 'Diproses'
                    ? 'Diproses'
                    : 'Laporan baru';
            const categoryMarker = categoryMarkerConfigs.get(
                String(l.kategori || '').trim().toLocaleLowerCase('id')
            ) || categoryMarkers[categoryMarkers.length - 1];
            const markerClass = isAdminPage
                ? `admin-map-marker admin-map-marker--category-${categoryMarker.id}`
                : `admin-map-marker admin-map-marker--${statusClass}`;
            const markerSymbol = isAdminPage
                ? categoryMarker.symbol
                : statusClass === 'done' ? '✓' : statusClass === 'progress' ? '↻' : '!';
            const iconHtml = `<span class="${markerClass}" aria-hidden="true"><span>${markerSymbol}</span></span>`;

            const customIcon = L.divIcon({
                className: 'admin-map-div-icon',
                html: iconHtml,
                iconSize: [38, 46],
                iconAnchor: [19, 42],
                popupAnchor: [0, -38]
            });

            const marker = L.marker([Number(l.lat), Number(l.lng)], {
                icon: customIcon,
                title: isAdminPage
                    ? `Laporan #${l.id} · ${categoryMarker.label} · ${statusLabel}`
                    : `Laporan #${l.id} · ${statusLabel}`,
                alt: isAdminPage
                    ? `Laporan #${l.id}: ${categoryMarker.label}, ${statusLabel}`
                    : `Laporan #${l.id}: ${statusLabel}`
            }).addTo(map);
            
            marker.bindPopup(`
                <div class="admin-map-popup">
                    <strong>#${escapeHtml(l.id)} · ${escapeHtml(l.kategori || 'Laporan warga')}</strong>
                    ${isAdminPage && l.alamat ? `<p>${escapeHtml(l.alamat)}</p>` : ''}
                    <span class="admin-map-popup__status admin-map-popup__status--${statusClass}">${escapeHtml(statusLabel)}</span>
                </div>
            `);
            
            markers.push(marker);
        });
        visibleReportCount = markers.length;
        mapDataReady = true;
        updateMapStatus();
        map.invalidateSize({ pan: false });
    }

    refreshMapMarkers = function() {
        return renderMarkers(currentFilter, true);
    };

    const refreshButton = document.getElementById('adminMapRefresh');
    if (refreshButton) {
        refreshButton.addEventListener('click', async function() {
            refreshButton.disabled = true;
            mapTilesReady = false;
            mapTilesError = false;
            tileLayer.redraw();
            updateMapStatus();
            try {
                await refreshMapMarkers();
            } catch (error) {
                console.error('Penyegaran peta gagal:', error);
            } finally {
                refreshButton.disabled = false;
            }
        });
    }

    if (!isAdminPage) renderMarkers().catch(showRequestError);

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Reset style semua tombol
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-emerald-600', 'text-white');
                b.classList.add('bg-gray-100', 'text-gray-600');
            });
            
            // Aktifkan style tombol yg diklik
            this.classList.remove('bg-gray-100', 'text-gray-600');
            this.classList.add('active', 'bg-emerald-600', 'text-white');
            
            renderMarkers(this.dataset.filter).catch(error => {
                console.error('Filter peta gagal dimuat:', error);
            });
        });
    });
}


