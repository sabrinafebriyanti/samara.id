// ============ HALAMAN LAPOR (FORM PETA LEAFLET) ============
function initFormLaporan() {
    const form = document.getElementById('formLaporan');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const submitButton = form.querySelector('[type="submit"]');
        const latitude = document.getElementById('lat').value;
        const longitude = document.getElementById('lng').value;
        const lat = Number(latitude);
        const lng = Number(longitude);
        const photoFile = document.getElementById('foto').files[0];
        if (!latitude || !longitude || !Number.isFinite(lat) || !Number.isFinite(lng)) {
            document.getElementById('addressMapStatus').textContent =
                'Pilih hasil alamat atau titik langsung di peta, lalu pastikan pin muncul sebelum mengirim laporan.';
            document.getElementById('mapForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        if (!isWithinBandarLampung(lat, lng)) {
            alert('Lokasi laporan harus berada di wilayah Bandar Lampung.');
            return;
        }
        if (photoFile && (!['image/jpeg', 'image/png'].includes(photoFile.type) ||
            photoFile.size > 2 * 1024 * 1024)) {
            alert('Foto bukti harus JPG atau PNG dengan ukuran maksimal 2 MB.');
            return;
        }
        submitButton.disabled = true;
        try {
            const foto = photoFile ? await readFileAsDataUrl(photoFile) : null;
            const reportPayload = {
                nama: document.getElementById('nama').value.trim(),
                email: document.getElementById('email').value.trim(),
                whatsapp: document.getElementById('whatsapp').value.trim(),
                kategori: document.getElementById('kategori').value,
                alamat: document.getElementById('alamat').value.trim(),
                deskripsi: document.getElementById('deskripsi').value.trim(),
                lat,
                lng,
                foto
            };
            const result = saveLocalReport(reportPayload);
            await loadMyReports(false);
            const refreshResults = await Promise.allSettled([
                updateStats(),
                refreshMapMarkers()
            ]);
            const refreshFailed = refreshResults.some(item => item.status === 'rejected');
            refreshResults.forEach(item => {
                if (item.status === 'rejected') {
                    console.error('Laporan tersimpan, tetapi tampilan gagal diperbarui:', item.reason);
                }
            });
            if (window.Swal && typeof Swal.fire === 'function') {
                await Swal.fire({
                    icon: refreshFailed ? 'warning' : 'success',
                    title: 'Laporan Berhasil Disimpan!',
                    text: `ID Laporan Anda: ${result.id}. Simpan ID ini untuk melacak status. Laporan tersimpan di browser perangkat ini.` +
                        (refreshFailed ? ' Beberapa tampilan belum diperbarui; muat ulang halaman.' : ''),
                    confirmButtonColor: '#10b981',
                    background: '#fff',
                    color: '#1e293b'
                });
            }
            form.reset();
            document.getElementById('searchLaporan').value = result.id;
            document.getElementById('searchEmail').value = reportPayload.email;
            document.getElementById('btnCari').click();
            window.location.hash = 'lacak';
        } catch (error) {
            showRequestError(error);
        } finally {
            submitButton.disabled = false;
        }
    });
}

function initFormMap() {
    const mapEl = document.getElementById('mapForm');
    if (!mapEl) return;
    if (typeof L === 'undefined') {
        console.warn('Leaflet belum termuat; peta formulir tidak dapat dibuat.');
        return;
    }

    // 1. Inisialisasi Peta Leaflet untuk Form
    const map = L.map('mapForm').setView([BANDAR_LAMPUNG_CENTER.lat, BANDAR_LAMPUNG_CENTER.lng], 13);
    window.addEventListener('load', () => window.setTimeout(() => map.invalidateSize(), 150));
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
    }).addTo(map);

    let marker;
    let addressLookupId = 0;
    let lastAddressQuery = '';
    const addressInput = document.getElementById('alamat');
    const addressStatus = document.getElementById('addressMapStatus');
    const addressCandidates = document.getElementById('addressCandidates');

    function setMarker(lat, lng) {
        if (!isWithinBandarLampung(lat, lng)) {
            alert('Pilih lokasi di dalam wilayah Bandar Lampung.');
            return;
        }
        if (marker) {
            map.removeLayer(marker);
        }
        marker = L.marker([lat, lng]).addTo(map);
        document.getElementById('lat').value = lat;
        document.getElementById('lng').value = lng;
    }

    addressInput.addEventListener('input', function() {
        addressLookupId += 1;
        lastAddressQuery = '';
        addressCandidates.replaceChildren();
        document.getElementById('lat').value = '';
        document.getElementById('lng').value = '';
        if (marker) {
            map.removeLayer(marker);
            marker = null;
        }
        const address = this.value.trim();

        if (address.length < 5) {
            addressStatus.textContent = '';
            return;
        }
        addressStatus.textContent = 'Selesai mengetik? Klik di luar kolom untuk mencari lokasi di peta.';
    });

    addressInput.addEventListener('blur', async function() {
        const address = this.value.trim();
        if (address.length < 5 || address === lastAddressQuery) return;

        const queryTerms = address.toLocaleLowerCase('id-ID')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .split(/[^a-z0-9]+/)
            .filter(term => term.length > 1 && ![
                'jalan', 'jl', 'nomor', 'no', 'bandar', 'lampung', 'indonesia',
                'kecamatan', 'kec', 'kelurahan', 'kel'
            ].includes(term));
        if (queryTerms.length === 0) {
            addressStatus.textContent = 'Tambahkan nama jalan, nomor, gedung, atau patokan lokasi selain nama kota.';
            return;
        }

        const lookupId = addressLookupId;
        lastAddressQuery = address;
        addressStatus.textContent = 'Mencari alamat di peta...';
        const params = new URLSearchParams({
            q: `${address}, Bandar Lampung, Indonesia`,
            format: 'jsonv2',
            limit: '5',
            countrycodes: 'id',
            viewbox: [
                BANDAR_LAMPUNG_BOUNDS.west,
                BANDAR_LAMPUNG_BOUNDS.north,
                BANDAR_LAMPUNG_BOUNDS.east,
                BANDAR_LAMPUNG_BOUNDS.south
            ].join(','),
            bounded: '1',
            'accept-language': 'id'
        });

        try {
            const response = await requestNominatim(`https://nominatim.openstreetmap.org/search?${params}`);
            if (!response.ok) {
                throw new Error(`Layanan pencarian alamat merespons HTTP ${response.status}.`);
            }
            const results = await response.json();
            if (lookupId !== addressLookupId) return;
            if (!Array.isArray(results) || results.length === 0) {
                addressStatus.textContent = 'Alamat tidak ditemukan. Coba tambahkan nama jalan atau kelurahan.';
                return;
            }

            const minimumMatchedTerms = Math.ceil(queryTerms.length / 2);
            const candidates = results.filter(result => {
                if (!isWithinBandarLampung(Number(result.lat), Number(result.lon))) return false;
                const resultTerms = new Set(result.display_name.toLocaleLowerCase('id-ID')
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .split(/[^a-z0-9]+/));
                const matchedTerms = queryTerms.filter(term => resultTerms.has(term)).length;
                return matchedTerms >= minimumMatchedTerms;
            });
            if (candidates.length === 0) {
                addressStatus.textContent = 'Tidak ada hasil yang cukup cocok dengan kata kunci alamat di Bandar Lampung. Periksa ejaan atau coba nama jalan/patokan lain.';
                return;
            }

            addressStatus.textContent = 'Pilih alamat yang paling cocok. Hasil pencarian belum dipasang sebagai pin.';
            const fragment = document.createDocumentFragment();
            candidates.forEach(candidate => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'address-candidate';
                button.textContent = candidate.display_name;
                button.setAttribute('aria-pressed', 'false');
                button.addEventListener('click', function() {
                    const latitude = Number(candidate.lat);
                    const longitude = Number(candidate.lon);
                    if (!isWithinBandarLampung(latitude, longitude)) {
                        addressStatus.textContent = 'Alamat yang dipilih berada di luar Bandar Lampung.';
                        return;
                    }

                    map.setView([latitude, longitude], 17);
                    setMarker(latitude, longitude);
                    addressCandidates.querySelectorAll('.address-candidate').forEach(item => {
                        item.setAttribute('aria-pressed', String(item === button));
                    });
                    addressStatus.textContent = `Pin dipasang pada: ${candidate.display_name}. Periksa kembali posisi pin di peta.`;
                });
                fragment.append(button);
            });
            addressCandidates.replaceChildren(fragment);
        } catch (error) {
            if (lookupId !== addressLookupId) return;
            lastAddressQuery = '';
            addressStatus.textContent = 'Pencarian alamat gagal. Periksa koneksi internet atau pilih titik di peta.';
            console.error('Pencarian alamat dengan Nominatim gagal:', error);
        }
    });

    map.on('click', function(e) {
        setMarker(e.latlng.lat, e.latlng.lng);
        addressStatus.textContent = 'Titik lokasi dipilih secara manual di peta.';
    });

    document.getElementById('btnLokasi').addEventListener('click', function() {
        if (!navigator.geolocation) {
            alert('Browser Anda tidak mendukung fitur lokasi.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function(pos) {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                if (!isWithinBandarLampung(lat, lng)) {
                    alert('Lokasi Anda berada di luar wilayah Bandar Lampung.');
                    return;
                }
                map.setView([lat, lng], 15);
                setMarker(lat, lng);
                addressStatus.textContent = 'Lokasi Anda dipilih di peta.';
            },
            function(error) {
                alert(`Lokasi tidak dapat diakses: ${error.message}`);
            }
        );
    });
}

function checkAdminSession() {
    if (!adminSessionCheck) {
        adminSessionCheck = Promise.resolve().then(function() {
            const session = getLocalSession();
            adminCurrentRole = session ? session.role : null;
            adminSession = Boolean(session && session.role === 'admin');
            return adminSession;
        });
    }
    return adminSessionCheck;
}


