// ============ INIT ============
document.addEventListener('DOMContentLoaded', function() {
    const closeApiErrorButton = document.getElementById('btnCloseApiError');
    if (closeApiErrorButton) {
        closeApiErrorButton.addEventListener('click', function() {
            document.getElementById('apiErrorNotice').hidden = true;
        });
    }
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        const closeNavMenu = function() {
            navMenu.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Buka menu navigasi');
        };
        navToggle.addEventListener('click', function() {
            const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', String(!isOpen));
            navToggle.setAttribute('aria-label', isOpen ? 'Buka menu navigasi' : 'Tutup menu navigasi');
            navMenu.classList.toggle('is-open', !isOpen);
        });
        navMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNavMenu));
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') closeNavMenu();
        });
        window.addEventListener('resize', function() {
            if (window.innerWidth > 1200) closeNavMenu();
        });
    }
    
    // Inisialisasi Peta Leaflet dan Fungsi Lainnya. Satu fitur gagal tidak boleh mematikan fitur lain.
    const safeInit = function(name, fn) {
        try {
            return fn();
        } catch (error) {
            console.error(`Inisialisasi ${name} gagal:`, error);
            return undefined;
        }
    };
    safeInit('statistik', () => updateStats().catch(showRequestError));
    safeInit('peta formulir', initFormMap);
    safeInit('peta sebaran', initPeta);
    safeInit('form laporan', initFormLaporan);
    safeInit('lacak laporan', initLacak);
    safeInit('widget cuaca', initWeatherWidget);
    safeInit('chatbot', initChatbot);
    safeInit('cek sesi admin', checkAdminSession);
    safeInit('dasbor admin', initDashboard);
    
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    function updateActiveNav() {
        const currentHash = window.location.hash || '#beranda';
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === currentHash));
    }
    window.addEventListener('hashchange', updateActiveNav);
    updateActiveNav();
});

// Loading Screen Logic
window.addEventListener('load', function() {
    const loader = document.createElement('div');
    loader.id = 'loader';
    const inPagesDir = window.location.pathname.includes('/pages/');
    const logoPath = inPagesDir ? '../assets/img/logo%20samara.png' : 'assets/img/logo%20samara.png';
    loader.innerHTML = `
        <div class="loader-card" role="status" aria-live="polite">
            <div class="loader-brand">
                <img src="${logoPath}" alt="" />
            </div>
            <h2 class="loader-title">Memuat SAMARA</h2>
            <p class="loader-subtitle">Menyiapkan layanan pelaporan warga...</p>
            <div class="loader-spinner" aria-hidden="true"></div>
            <div class="loader-progress" aria-hidden="true"><span></span></div>
        </div>`;
    document.body.prepend(loader);

    requestAnimationFrame(() => {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            setTimeout(() => loader.remove(), 450);
        }, 700);
    });
});
