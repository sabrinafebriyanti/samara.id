const REPORTS_STORAGE_KEY = 'smartwarga.reports';
const SESSION_STORAGE_KEY = 'smartwarga.session';
const NOMINATIM_MIN_INTERVAL_MS = 1100;
const SESSION_ENDPOINT = '/api/auth/session';
let lastNominatimRequestAt = 0;
let nominatimRequestQueue = Promise.resolve();
let adminSession = false;
let adminCurrentRole = null;
var adminSessionCheck = null;

function requestNominatim(url) {
    const request = nominatimRequestQueue.then(async function() {
        const wait = NOMINATIM_MIN_INTERVAL_MS - (Date.now() - lastNominatimRequestAt);
        if (wait > 0) {
            await new Promise(resolve => setTimeout(resolve, wait));
        }
        lastNominatimRequestAt = Date.now();
        return fetch(url);
    });
    nominatimRequestQueue = request.then(() => undefined, () => undefined);
    return request;
}

function getStoredReports() {
    const stored = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (stored === null) return [];
    try {
        const reports = JSON.parse(stored);
        if (!Array.isArray(reports)) throw new Error('Data laporan lokal tidak valid.');
        return reports.filter(item => item && typeof item === 'object' && !Array.isArray(item));
    } catch (error) {
        console.error('Data laporan lokal tidak dapat dibaca:', error);
        throw new Error('Data laporan lokal tidak valid atau rusak.');
    }
}

function saveLocalReport(report) {
    const reports = getStoredReports();
    const requestedId = Number(report.id);
    const id = Number.isInteger(requestedId) && requestedId > 0
        ? requestedId
        : reports.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
    const today = new Date();
    const createdAt = today.toISOString();
    const tanggal = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0')
    ].join('-');
    reports.unshift({
        ...report,
        id,
        status: 'Diterima',
        tanggal,
        created_at: createdAt,
        completed_at: null,
        assigned_to: null,
        status_history: [{
            status: 'Diterima',
            note: 'Laporan diterima',
            assigned_to: null,
            changed_at: createdAt
        }],
        has_foto: Boolean(report.foto)
    });
    if (!saveStoredReports(reports)) {
        throw new Error('Laporan tidak dapat disimpan: penyimpanan browser penuh atau tidak tersedia.');
    }
    return { id };
}

function saveStoredReports(reports) {
    try {
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
        return true;
    } catch (error) {
        console.error('Penyimpanan lokal SAMARA gagal:', error);
        showRequestError(new Error('Perubahan tidak dapat disimpan: penyimpanan browser penuh atau tidak tersedia.'));
        return false;
    }
}

function getLocalSession() {
    try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        if (!session || typeof session !== 'object') return null;
        if (!session.role || !session.email) return null;
        return session;
    } catch (error) {
        console.warn('Sesi lokal tidak dapat dibaca:', error);
        return null;
    }
}

function setLocalSession(session) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    adminSession = session.role === 'admin';
    adminCurrentRole = session.role || null;
}

function clearLocalSession() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    adminSession = false;
    adminCurrentRole = null;
    adminSessionCheck = null;
}

async function saveServerReport() {
    // Mode statis: tidak ada backend server, laporan disimpan di browser.
    return null;
}

function escapeHtml(value) {
    const entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return String(value == null ? '' : value).replace(/[&<>"']/g, character => entities[character]);
}

function renderStatusBadge(status) {
    return `<span class="status-badge status-${status}"><span class="status-badge-dot" aria-hidden="true"></span>${escapeHtml(status)}</span>`;
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => resolve(reader.result));
        reader.addEventListener('error', () => reject(reader.error || new Error('Foto tidak dapat dibaca.')));
        reader.readAsDataURL(file);
    });
}

function showRequestError(error) {
    console.error('Terjadi kesalahan:', error);
    const notice = document.getElementById('apiErrorNotice');
    const message = document.getElementById('apiErrorMessage');
    if (!notice || !message) return;

    message.textContent = (error && error.message) || 'Data tidak dapat diproses. Silakan coba lagi.';
    notice.hidden = false;
}

const BANDAR_LAMPUNG_CENTER = { lat: -5.4290, lng: 105.2620 };
const BANDAR_LAMPUNG_BOUNDS = {
    north: -5.35,
    south: -5.60,
    east: 105.38,
    west: 105.15
};

function isWithinBandarLampung(lat, lng) {
    return Number.isFinite(lat) && Number.isFinite(lng) &&
        lat >= BANDAR_LAMPUNG_BOUNDS.south && lat <= BANDAR_LAMPUNG_BOUNDS.north &&
        lng >= BANDAR_LAMPUNG_BOUNDS.west && lng <= BANDAR_LAMPUNG_BOUNDS.east;
}

const WEATHER_CODES = {
    0: { description: 'Cerah', icon: '☀️' },
    1: { description: 'Cerah berawan', icon: '🌤️' },
    2: { description: 'Berawan sebagian', icon: '⛅' },
    3: { description: 'Mendung', icon: '☁️' },
    45: { description: 'Berkabut', icon: '🌫️' },
    48: { description: 'Berkabut tebal', icon: '🌫️' },
    51: { description: 'Gerimis ringan', icon: '🌦️' },
    53: { description: 'Gerimis', icon: '🌦️' },
    55: { description: 'Gerimis lebat', icon: '🌧️' },
    56: { description: 'Gerimis beku ringan', icon: '🌧️' },
    57: { description: 'Gerimis beku lebat', icon: '🌧️' },
    61: { description: 'Hujan ringan', icon: '🌦️' },
    63: { description: 'Hujan sedang', icon: '🌧️' },
    65: { description: 'Hujan lebat', icon: '🌧️' },
    66: { description: 'Hujan beku ringan', icon: '🌧️' },
    67: { description: 'Hujan beku lebat', icon: '🌧️' },
    71: { description: 'Salju ringan', icon: '🌨️' },
    73: { description: 'Salju sedang', icon: '🌨️' },
    75: { description: 'Salju lebat', icon: '❄️' },
    77: { description: 'Butiran salju', icon: '❄️' },
    80: { description: 'Hujan lokal ringan', icon: '🌦️' },
    81: { description: 'Hujan lokal sedang', icon: '🌧️' },
    82: { description: 'Hujan lokal lebat', icon: '🌧️' },
    85: { description: 'Hujan salju ringan', icon: '🌨️' },
    86: { description: 'Hujan salju lebat', icon: '🌨️' },
    95: { description: 'Badai petir', icon: '⛈️' },
    96: { description: 'Badai petir dengan hujan es ringan', icon: '⛈️' },
    99: { description: 'Badai petir dengan hujan es lebat', icon: '⛈️' }
};

function initWeatherWidget() {
    const triggers = document.querySelectorAll('.weather-trigger');
    const modal = document.getElementById('weatherModal');
    const content = document.getElementById('weatherContent');
    const refreshButton = document.getElementById('btnMuatCuaca');
    const locationButton = document.getElementById('btnCuacaLokasi');
    const searchForm = document.getElementById('weatherSearchForm');
    const searchInput = document.getElementById('weatherSearchInput');
    const searchButton = document.getElementById('weatherSearchButton');
    const title = document.getElementById('weatherTitle');
    const closeButton = document.getElementById('btnTutupCuaca');
    if (!triggers.length || !modal || !content || !refreshButton || !locationButton ||
        !searchForm || !searchInput || !searchButton || !title || !closeButton) return;

    let activeTrigger = triggers[0];

    function closeModal() {
        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
        activeTrigger.focus();
    }

    function showMessage(message) {
        const paragraph = document.createElement('p');
        paragraph.textContent = message;
        content.replaceChildren(paragraph);
    }

    function addWeatherDetail(container, label, value) {
        const detail = document.createElement('div');
        detail.className = 'weather-detail';
        detail.append(document.createTextNode(label));
        const strong = document.createElement('strong');
        strong.textContent = value;
        detail.append(strong);
        container.append(detail);
    }

    async function findWeatherLocation(query) {
        const params = new URLSearchParams({
            format: 'jsonv2',
            q: query,
            viewbox: '104.95,-5.15,105.60,-5.80',
            bounded: '1',
            limit: '1',
            addressdetails: '1'
        });
        const response = await requestNominatim(
            `https://nominatim.openstreetmap.org/search?${params}`
        );
        if (!response.ok) {
            throw new Error(`Layanan pencarian wilayah merespons HTTP ${response.status}.`);
        }
        const results = await response.json();
        const result = Array.isArray(results) ? results[0] : null;
        if (!result) {
            throw new Error('Wilayah tidak ditemukan di sekitar Bandar Lampung.');
        }
        const location = { lat: Number(result.lat), lng: Number(result.lon) };
        if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
            throw new Error('Koordinat wilayah yang ditemukan tidak valid.');
        }

        const displayName = typeof result.display_name === 'string'
            ? result.display_name.split(',')[0].trim()
            : query;
        return {
            location,
            label: typeof result.name === 'string' && result.name.trim()
                ? result.name.trim()
                : displayName
        };
    }

    async function loadWeather(location = BANDAR_LAMPUNG_CENTER, locationLabel = 'Bandar Lampung') {
        refreshButton.disabled = true;
        refreshButton.textContent = 'Memuat...';
        locationButton.disabled = true;
        title.textContent = locationLabel;
        showMessage(`Mengambil data cuaca ${locationLabel}...`);

        const params = new URLSearchParams({
            latitude: String(location.lat),
            longitude: String(location.lng),
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
            timezone: 'Asia/Jakarta'
        });

        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
            if (!response.ok) throw new Error(`Layanan cuaca merespons HTTP ${response.status}.`);

            const data = await response.json();
            const current = data.current;
            if (!current || !Number.isFinite(current.temperature_2m) ||
                !Number.isFinite(current.weather_code)) {
                throw new Error('Data cuaca yang diterima tidak lengkap.');
            }

            const weather = WEATHER_CODES[current.weather_code] || {
                description: 'Kondisi cuaca tidak diketahui',
                icon: '🌡️'
            };
            const icon = document.createElement('div');
            icon.className = 'weather-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = weather.icon;

            const temperature = document.createElement('div');
            temperature.className = 'weather-temperature';
            temperature.textContent = `${Math.round(current.temperature_2m)}°C`;

            const description = document.createElement('div');
            description.className = 'weather-description';
            description.textContent = weather.description;

            const details = document.createElement('div');
            details.className = 'weather-details';
            addWeatherDetail(details, 'Terasa seperti', `${Math.round(current.apparent_temperature)}°C`);
            addWeatherDetail(details, 'Kelembapan', `${current.relative_humidity_2m}%`);
            addWeatherDetail(details, 'Angin', `${current.wind_speed_10m} km/jam`);

            const observedAt = document.createElement('small');
            observedAt.textContent = `Data: ${new Date(current.time).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
                timeZone: 'Asia/Jakarta'
            })}`;

            content.replaceChildren(icon, temperature, description, details, observedAt);
        } catch (error) {
            console.error(`Gagal memuat cuaca ${locationLabel}:`, error);
            showMessage('Cuaca tidak dapat dimuat. Periksa koneksi internet lalu coba lagi.');
        } finally {
            refreshButton.disabled = false;
            refreshButton.textContent = 'Muat Ulang Cuaca';
            locationButton.disabled = false;
        }
    }

    async function loadWeatherAtCurrentLocation() {
        if (!navigator.geolocation) {
            showMessage('Browser tidak mendukung geolokasi. Cuaca Bandar Lampung tetap tersedia.');
            return;
        }

        locationButton.disabled = true;
        showMessage('Meminta izin lokasi perangkat...');
        navigator.geolocation.getCurrentPosition(async function(position) {
            const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            let locationLabel = `Lokasi Anda (${location.lat.toFixed(3)}, ${location.lng.toFixed(3)})`;

            try {
                const params = new URLSearchParams({
                    format: 'jsonv2',
                    lat: String(location.lat),
                    lon: String(location.lng),
                    zoom: '14',
                    addressdetails: '1'
                });
                const response = await requestNominatim(`https://nominatim.openstreetmap.org/reverse?${params}`);
                if (!response.ok) {
                    throw new Error(`Layanan lokasi merespons HTTP ${response.status}.`);
                }
                const result = await response.json();
                const address = result.address || {};
                const nearbyArea = address.city_district || address.suburb || address.neighbourhood ||
                    address.village || address.town || address.city;
                if (nearbyArea) locationLabel = nearbyArea;
            } catch (error) {
                console.warn('Nama kecamatan tidak dapat ditemukan:', error);
            }

            await loadWeather(location, locationLabel);
        }, function(error) {
            locationButton.disabled = false;
            const message = error.code === error.PERMISSION_DENIED
                ? 'Izin lokasi ditolak. Izinkan akses lokasi atau muat cuaca Bandar Lampung.'
                : 'Lokasi perangkat tidak dapat ditemukan. Muat cuaca Bandar Lampung sebagai gantinya.';
            showMessage(message);
        }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        });
    }

    triggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            activeTrigger = trigger;
            modal.hidden = false;
            modal.setAttribute('aria-hidden', 'false');
            refreshButton.focus();
            loadWeather();
        });
    });
    searchForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const query = searchInput.value.trim();
        if (!query) {
            showMessage('Masukkan nama kecamatan atau wilayah yang ingin dicari.');
            return;
        }

        searchButton.disabled = true;
        searchButton.textContent = 'Mencari...';
        showMessage(`Mencari wilayah "${query}" di sekitar Bandar Lampung...`);
        try {
            const result = await findWeatherLocation(query);
            await loadWeather(result.location, result.label);
        } catch (error) {
            console.error('Pencarian wilayah cuaca gagal:', error);
            showMessage(error.message || 'Wilayah tidak dapat ditemukan. Coba nama wilayah lain.');
        } finally {
            searchButton.disabled = false;
            searchButton.textContent = 'Cari';
        }
    });
    refreshButton.addEventListener('click', function() {
        loadWeather();
    });
    locationButton.addEventListener('click', loadWeatherAtCurrentLocation);
    closeButton.addEventListener('click', closeModal);
    modal.addEventListener('click', event => {
        if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
}

function initChatbot() {
    const launcher = document.getElementById('chatLauncher');
    const panel = document.getElementById('chatPanel');
    const closeButton = document.getElementById('chatClose');
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    const sendButton = document.getElementById('chatSend');
    const messagesContainer = document.getElementById('chatMessages');
    const suggestions = document.getElementById('chatSuggestions');
    if (!launcher || !panel || !closeButton || !form || !input || !sendButton || !messagesContainer) return;

    const chatState = { mode: null, trackId: '', trackEmail: '' };

    function addMessage(role, text, className = '') {
        const message = document.createElement('p');
        message.className = `chat-message ${role}${className ? ` ${className}` : ''}`;
        message.textContent = text;
        messagesContainer.append(message);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return message;
    }

    function resetFlow() {
        chatState.mode = null;
        chatState.trackId = '';
        chatState.trackEmail = '';
    }

    function suggestCategory(text) {
        const q = String(text).toLowerCase();
        const rules = [
            { category: 'Lampu Lalu Lintas Mati', keywords: ['lampu lalu lintas', 'lampu merah', 'traffic light', 'traffic signal', 'apill'] },
            { category: 'Halte Rusak', keywords: ['halte', 'bus stop'] },
            { category: 'Jalan Rusak', keywords: ['jalan', 'aspal', 'berlubang', 'lubang', 'retak', 'amblas', 'paving', 'trotoar'] },
            { category: 'Lampu Penerangan Mati', keywords: ['lampu jalan', 'lampu mati', 'pju', 'penerangan', 'gelap', 'mati lampu', 'jalan gelap'] },
            { category: 'Drainase Tersumbat', keywords: ['drainase', 'selokan', 'got', 'parit', 'genangan', 'air menggenang', 'tersumbat', 'saluran'] },
            { category: 'Taman/Fasilitas Umum Rusak', keywords: ['taman', 'bangku', 'jembatan', 'fasilitas', 'playground', 'lapangan', 'pagar', 'pos ronda'] },
            { category: 'Penumpukan Sampah', keywords: ['sampah', 'tumpukan', 'bau', 'liar', 'tps', 'kotor', 'berserakan'] }
        ];
        const matched = rules.filter(rule => rule.keywords.some(k => q.includes(k))).map(rule => rule.category);
        if (matched.length === 1) {
            return `Berdasarkan deskripsi Anda, kategori yang paling sesuai adalah: ${matched[0]}.\n\nJika kurang tepat, Anda bisa pilih "Lainnya" saat mengisi formulir laporan.`;
        }
        if (matched.length > 1) {
            return `Deskripsi Anda mirip dengan beberapa kategori: ${matched.join(', ')}.\n\nPilih yang paling dominan pada formulir laporan. Jika tidak ada yang cocok, gunakan kategori "Lainnya".`;
        }
        return 'Saya belum bisa menentukan kategori secara pasti dari deskripsi tersebut. Coba jelaskan objek yang rusak dan masalah utamanya (misalnya: lampu jalan mati, jalan berlubang, selokan tersumbat, lampu lalu lintas mati, halte rusak, tumpukan sampah, atau fasilitas taman rusak).';
    }

    async function fetchReportStatus(id, email) {
        try {
            const local = getStoredReports().find(report =>
                String(report.id) === String(id) &&
                String(report.email || '').trim().toLowerCase() === String(email).trim().toLowerCase()
            );
            if (local) {
                return `Status laporan #${local.id} (data perangkat ini)\n- Kategori: ${local.kategori || '-'}\n- Status: ${local.status || '-'}\n- Tanggal: ${local.tanggal || '-'}\n\nCatatan: ini adalah versi statis, data berasal dari penyimpanan browser perangkat ini.`;
            }
        } catch (error) {
            console.warn('Cek status lokal gagal:', error);
        }
        return 'Laporan tidak ditemukan di perangkat ini. Pastikan ID Laporan benar, email sama dengan saat melapor, dan laporan dibuat di browser/perangkat yang sama.';
    }

    async function answerQuestion(text) {
        const raw = String(text).trim();
        const q = raw.toLowerCase();

        if (/(^batal$|^cancel$|^reset$|batalkan|mulai ulang)/.test(q)) {
            resetFlow();
            return 'Baik, percakapan saya reset. Ada yang bisa saya bantu? (buat laporan, tentukan kategori, cek status, atau info lainnya)';
        }

        if (chatState.mode === 'track_id') {
            if (!/^\d+$/.test(raw)) {
                return 'ID Laporan harus berupa angka. Masukkan ID Laporan (contoh: 12), atau ketik "batal" untuk berhenti.';
            }
            chatState.trackId = raw;
            chatState.mode = 'track_email';
            return `ID Laporan ${raw} diterima. Sekarang masukkan email yang digunakan saat membuat laporan.`;
        }

        if (chatState.mode === 'track_email') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
                return 'Format email tidak valid. Masukkan email yang dipakai saat melapor, atau ketik "batal".';
            }
            const id = chatState.trackId;
            resetFlow();
            return fetchReportStatus(id, raw);
        }

        if (chatState.mode === 'suggest_category') {
            resetFlow();
            return suggestCategory(raw);
        }

        if (/(darurat|bahaya|kebakaran|kecelakaan|korban|pingsan|sesak)/.test(q)) {
            return 'Jika kondisi berbahaya atau ada korban, segera hubungi 112 atau layanan darurat terdekat. SAMARA dipakai untuk melaporkan fasilitas publik, bukan untuk menggantikan layanan darurat.';
        }

        if (/(halo|hai|hi|selamat|assalam)/.test(q) && q.length < 40) {
            return '👋 Halo, Sobat SAMARA! Ada yang bisa saya bantu hari ini? Saya siap memandu Anda membuat laporan, memilih kategori yang tepat, atau mengecek status aduan. Yuk, mulai dari kebutuhan Anda!';
        }

        if ((q.includes('cek') && q.includes('status')) || q.includes('lacak') || q.includes('cek laporan')) {
            chatState.mode = 'track_id';
            return 'Baik, saya bantu cek status. Masukkan ID Laporan Anda (angka saja). Contoh: 12\nKetik "batal" jika ingin membatalkan.';
        }

        if (q.includes('kategori') || q.includes('tentukan kategori') || q.includes('pilih kategori') || q.includes('bingung kategori')) {
            chatState.mode = 'suggest_category';
            return 'Ceritakan singkat masalah yang ingin dilaporkan (contoh: "lampu jalan di depan sekolah mati" atau "ada lubang besar di aspal"). Saya akan sarankan kategori yang sesuai.';
        }

        if (q.includes('bantu lapor') || q.includes('buat laporan') || q.includes('cara lapor') || q.includes('mau lapor') || q.includes('panduan laporan')) {
            return 'Panduan membuat laporan di SAMARA:\n1. Buka menu "Lapor" pada halaman utama\n2. Isi nama, email, dan nomor WhatsApp (opsional)\n3. Pilih kategori kerusakan yang sesuai\n4. Tulis alamat/lokasi dan deskripsi yang jelas\n5. Tandai titik lokasi di peta (wajib, wilayah Bandar Lampung)\n6. Unggah foto bukti (opsional, JPG/PNG maks. 2 MB)\n7. Kirim laporan dan simpan ID Laporan untuk pelacakan\n\nTips: sertakan patokan lokasi. Jika bingung kategori, ketik "tentukan kategori" dan jelaskan masalahnya.';
        }

        if (q.includes('foto') || q.includes('gambar') || q.includes('bukti')) {
            return 'Panduan foto bukti:\n- Format JPG/PNG, maksimal 2 MB\n- Ambil foto jelas yang menampilkan kerusakan\n- Hindari menampilkan wajah, plat nomor, atau data pribadi jika tidak perlu\n- Foto membantu petugas memverifikasi dan mempercepat penanganan.';
        }

        if (q.includes('lokasi') || q.includes('peta') || q.includes('alamat') || q.includes('titik')) {
            return 'Panduan lokasi laporan:\n- Isi alamat selengkap mungkin (nama jalan, nomor/patokan)\n- Pilih kandidat hasil pencarian peta atau tandai titik manual\n- Pastikan pin berada di wilayah Bandar Lampung\n- Laporan tidak bisa dikirim tanpa titik koordinat di peta.';
        }

        if (q.includes('status') || q.includes('diterima') || q.includes('diproses') || q.includes('selesai')) {
            return 'Penjelasan status laporan:\n- Diterima: laporan masuk dan menunggu verifikasi/tindak lanjut\n- Diproses: laporan sedang ditangani petugas/instansi terkait\n- Selesai: penanganan dinyatakan selesai\n\nUntuk cek status laporan Anda, ketik "cek status laporan" dan siapkan ID Laporan + email.';
        }

        if (q.includes('data') || q.includes('privasi') || q.includes('email')) {
            return 'Informasi data & privasi:\n- Email dan ID Laporan digunakan untuk pelacakan status\n- Hindari mengirim data sensitif (NIK, nomor rekening, dokumen pribadi)\n- Data laporan digunakan untuk keperluan tindak lanjut fasilitas publik.';
        }

        if (q.includes('admin') || q.includes('rt') || q.includes('rw') || q.includes('petugas')) {
            return 'Laporan warga ditindaklanjuti melalui dashboard admin/petugas. Admin dapat memverifikasi, menugaskan, dan memperbarui status laporan. Jika kondisi mendesak di lapangan, tetap hubungi RT/RW atau kanal resmi setempat.';
        }

        if (q.includes('biaya') || q.includes('bayar')) {
            return 'Tidak ada biaya untuk membuat laporan melalui SAMARA.';
        }

        if (q.includes('tidak bisa kirim') || q.includes('gagal mengirim') || q.includes('error') || q.includes('gagal')) {
            return 'Jika laporan gagal dikirim, periksa:\n- Semua kolom wajib sudah diisi\n- Email valid\n- Lokasi/pin di peta sudah dipilih (Bandar Lampung)\n- Foto (jika ada) berformat JPG/PNG dan maks. 2 MB\n- Koneksi internet/server lokal aktif\n\nCoba muat ulang halaman lalu kirim kembali. Jika masih gagal, simpan detail laporan dan hubungi RT/RW setempat.';
        }

        if (q.includes('bantuan') || q.includes('help') || q === 'menu') {
            return 'Saya bisa membantu:\n- "Panduan membuat laporan"\n- "Tentukan kategori" (jelaskan masalahnya)\n- "Cek status laporan" (siapkan ID & email)\n- Pertanyaan tentang lokasi/peta, foto, status, privasi, dan kendala pengiriman';
        }

        return 'Saya bisa membantu proses pengaduan, menentukan kategori laporan, mengecek status, dan memberikan panduan penggunaan SAMARA.\n\nCoba ketik: "panduan membuat laporan", "tentukan kategori", atau "cek status laporan".';
    }

    function openChat() {
        panel.hidden = false;
        launcher.setAttribute('aria-expanded', 'true');
        input.focus();
    }

    function closeChat() {
        panel.hidden = true;
        launcher.setAttribute('aria-expanded', 'false');
        launcher.focus();
    }

    launcher.addEventListener('click', function() {
        if (panel.hidden) openChat();
        else closeChat();
    });
    closeButton.addEventListener('click', closeChat);

    if (suggestions) {
        suggestions.addEventListener('click', function(event) {
            const button = event.target.closest('button');
            if (!button) return;
            input.value = button.dataset.chatPrompt || button.textContent.trim();
            form.requestSubmit();
        });
    }

    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            form.requestSubmit();
        }
    });

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        const text = input.value.trim();
        if (!text || sendButton.disabled) return;

        input.value = '';
        if (suggestions) suggestions.hidden = true;
        addMessage('user', text);
        const pending = addMessage('assistant', 'Sedang menyiapkan jawaban...', 'is-pending');
        sendButton.disabled = true;
        input.disabled = true;

        try {
            const answer = await answerQuestion(text);
            pending.classList.remove('is-pending');
            pending.textContent = answer;
        } catch (error) {
            console.error('Chatbot gagal merespons:', error);
            pending.classList.remove('is-pending');
            pending.textContent = 'Maaf, terjadi kendala saat memproses permintaan. Silakan coba lagi.';
        } finally {
            sendButton.disabled = false;
            input.disabled = false;
            input.focus();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !panel.hidden) closeChat();
    });
}

let refreshMapMarkers = function() {
    return Promise.resolve();
};


