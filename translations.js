(function () {
  const translations = {
    "Sistem Aduan Masyarakat untuk Aksi Responsif dan Akuntabel.":
      "Community Complaint System for Responsive and Accountable Action.",
    "Beranda": "Home",
    "Lapor": "Report",
    "Lacak": "Track",
    "Peta": "Map",
    "Edukasi": "Guides",
    "EDUKASI SAMARA": "SAMARA EDUCATION",
    "Ilustrasi kota berkelanjutan": "Sustainable city illustration",
    "🌤️ Cuaca": "🌤️ Weather",
    "Cuaca": "Weather",
    "Admin": "Admin",
    "Pilih bahasa": "Choose language",
    "Buka menu navigasi": "Open navigation menu",
    "Tutup menu navigasi": "Close navigation menu",
    "Tutup pemberitahuan": "Dismiss notification",
    "Lambang Kota Bandar Lampung": "Bandar Lampung City Emblem",
    "Langkah mudah menggunakan SAMARA": "Easy steps to use SAMARA",
    "Kota Berkelanjutan": "Sustainable City",
    "Perubahan kota": "City change",
    "dimulai dari": "starts with",
    "warga.": "residents.",
    "Temukan masalah di sekitar, laporkan dengan mudah, lalu pantau perkembangannya. Bersama kita wujudkan Bandar Lampung yang lebih nyaman.":
      "Spot local problems, report them easily, and track their progress. Together, we can make Bandar Lampung a more livable city.",
    "📝 Buat Laporan": "📝 Submit a Report",
    "🔍 Lacak Laporan": "🔍 Track a Report",
    "Warga bergerak, kota bertumbuh": "Citizens act, the city grows",
    "Aksi kecil, dampak nyata.": "Small actions, real impact.",
    "Mulai dari satu laporan yang jelas dan lokasi yang tepat.":
      "Start with a clear report and an accurate location.",
    "Temukan masalah": "Identify a problem",
    "Kirim laporan": "Submit a report",
    "Pantau prosesnya": "Track its progress",
    "Lihat cara kerjanya": "See how it works",
    "Total Laporan": "Total Reports",
    "Selesai Ditangani": "Resolved",
    "Sedang Diproses": "In Progress",
    "Warga Aktif": "Active Citizens",
    "Mendukung SDG 11: Kota & Permukiman Berkelanjutan":
      "Supporting SDG 11: Sustainable Cities and Communities",
    "SDG 11 bertujuan menjadikan kota dan permukiman inklusif, aman, tangguh, dan berkelanjutan. Target 11.3 mendorong pengelolaan permukiman yang partisipatif.":
      "SDG 11 aims to make cities and communities inclusive, safe, resilient, and sustainable. Target 11.3 promotes participatory community planning.",
    "SDG 11 bertujuan menjadikan kota dan permukiman":
      "SDG 11 aims to make cities and communities",
    "inklusif, aman, tangguh, dan berkelanjutan":
      "inclusive, safe, resilient, and sustainable",
    "Target 11.3 mendorong pengelolaan permukiman yang":
      "Target 11.3 promotes participatory community planning",
    ". Target 11.3 mendorong pengelolaan permukiman yang":
      ". Target 11.3 promotes community planning",
    "partisipatif.": "with active resident participation.",
    "partisipatif": "with active resident participation",
    "SAMARA memberdayakan warga untuk memantau dan melaporkan kondisi fasilitas publik, menciptakan tata kelola kota yang transparan dan berbasis data.":
      "SAMARA empowers residents to monitor and report public facility conditions, supporting transparent, data-driven city management.",
    "Partisipatif": "Participatory",
    "Warga terlibat aktif dalam pengawasan kota":
      "Residents actively help monitor the city",
    "Transparan": "Transparent",
    "Status laporan dapat dilacak siapa saja":
      "Anyone can track report status",
    "Cerdas": "Smart",
    "Berbasis data dan teknologi modern":
      "Powered by data and modern technology",
    "Cara Kerja SAMARA": "How SAMARA Works",
    "Hanya 3 langkah mudah untuk berpartisipasi":
      "Just 3 easy steps to take part",
    "Laporkan": "Report",
    "Isi form laporan dengan foto, lokasi, dan deskripsi kerusakan fasilitas publik.":
      "Complete the report form with a photo, location, and description of the damaged public facility.",
    "Pantau": "Track",
    "Lacak status laporan Anda dari Diterima hingga Selesai.":
      "Track your report from Received to Resolved.",
    "Nikmati": "Enjoy",
    "Rasakan fasilitas publik yang lebih baik berkat kolaborasi warga dan pemerintah.":
      "Enjoy better public facilities through collaboration between residents and the local government.",
    "📝 Buat Laporan di Bandar Lampung": "📝 Submit a Report in Bandar Lampung",
    "Laporkan kerusakan fasilitas publik di wilayah Bandar Lampung.":
      "Report damaged public facilities in Bandar Lampung.",
    "Nama Pelapor *": "Your Name *",
    "Masukkan nama lengkap": "Enter your full name",
    "Email *": "Email *",
    "contoh@email.com": "name@example.com",
    "Nomor WhatsApp (opsional)": "WhatsApp Number (optional)",
    "Contoh: 081234567890": "Example: 081234567890",
    "Nomor ini digunakan petugas hanya untuk konfirmasi laporan.":
      "Staff will use this number only to confirm your report.",
    "Kategori Kerusakan *": "Issue Category *",
    "-- Pilih Kategori --": "-- Select a Category --",
    "🛣️ Jalan Rusak": "🛣️ Damaged Road",
    "💡 Lampu Penerangan Mati": "💡 Streetlight Out",
    "🚦 Lampu Lalu Lintas Mati": "🚦 Traffic Light Out",
    "🌊 Drainase Tersumbat": "🌊 Blocked Drain",
    "🌳 Taman/Fasilitas Umum Rusak": "🌳 Damaged Park/Public Facility",
    "🚏 Halte Rusak": "🚏 Damaged Bus Stop",
    "🗑️ Penumpukan Sampah": "🗑️ Garbage Pileup",
    "Lampu Lalu Lintas Mati": "Traffic Light Out",
    "Jalan Rusak": "Damaged Road",
    "Lampu Penerangan Mati": "Streetlight Out",
    "Drainase Tersumbat": "Blocked Drain",
    "Taman/Fasilitas Umum Rusak": "Damaged Park/Public Facility",
    "Halte Rusak": "Damaged Bus Stop",
    "Penumpukan Sampah": "Garbage Pileup",
    "Lainnya": "Other",
    "📌 Lainnya": "📌 Other",
    "Alamat/Lokasi *": "Address/Location *",
    "Contoh: Jl. Merdeka No. 10, Bandar Lampung":
      "Example: Merdeka St. No. 10, Bandar Lampung",
    "Hasil pencarian alamat": "Address search results",
    "Lokasi di Peta (Bandar Lampung)": "Location on the Map (Bandar Lampung)",
    "Pencarian alamat menggunakan":
      "Address search powered by",
    "Pilih hasil yang paling sesuai dan pastikan pin sudah tepat sebelum mengirim laporan.":
      "Choose the best match and confirm the pin is accurate before submitting your report.",
    ". Pilih hasil yang paling sesuai dan pastikan pin sudah tepat sebelum mengirim laporan.":
      ". Choose the best match and confirm the pin is accurate before submitting your report.",
    "📍 Gunakan Lokasi Saya": "📍 Use My Location",
    "Deskripsi Kerusakan *": "Issue Description *",
    "Jelaskan kerusakan secara detail...": "Describe the issue in detail...",
    "Upload Foto Bukti": "Upload Evidence Photo",
    "Format: JPG, PNG. Maks: 2MB": "Formats: JPG, PNG. Max: 2 MB",
    "🚀 Kirim Laporan": "🚀 Submit Report",
    "🔍 Lacak Status Laporan": "🔍 Track Report Status",
    "Masukkan ID Laporan dan email yang dipakai saat membuat laporan.":
      "Enter your Report ID and the email address used to submit the report.",
    "Cari Laporan": "Find a Report",
    "ID Laporan (contoh: 12)": "Report ID (e.g. 12)",
    "ID Laporan": "Report ID",
    "Email yang dipakai saat lapor": "Email used to submit the report",
    "Cari": "Search",
    "Aktivitas Saya": "My Activity",
    "Masukkan email pelaporan di atas untuk melihat riwayat yang tersimpan di perangkat ini.":
      "Enter your report email above to view history saved on this device.",
    "Muat ulang": "Refresh",
    "Memuat riwayat laporan...": "Loading report history...",
    "🗺️ Peta Sebaran Bandar Lampung": "🗺️ Report Map of Bandar Lampung",
    "Lihat sebaran laporan fasilitas publik di wilayah Bandar Lampung.":
      "View public facility reports across Bandar Lampung.",
    "Semua": "All",
    "Diterima": "Received",
    "Diproses": "In Progress",
    "Selesai": "Resolved",
    "🟡 Diterima": "🟡 Received",
    "🔵 Diproses": "🔵 In Progress",
    "🟢 Selesai": "🟢 Resolved",
    "Peta dan laporan dibatasi pada area Bandar Lampung.":
      "The map and reports are limited to Bandar Lampung.",
    "Keterangan:": "Legend:",
    "bertujuan": "aims to",
    "menjadikan kota dan permukiman": "make cities and communities",
    "bertujuan menjadikan kota dan permukiman":
      "aims to make cities and communities",
    "Target 11.3 mendorong urbanisasi yang inklusif dan pengelolaan":
      "Target 11.3 promotes inclusive urbanization and community",
    "permukiman yang partisipatif.": "participatory planning.",
    ". Target 11.3 mendorong urbanisasi yang inklusif dan pengelolaan permukiman yang partisipatif.":
      ". Target 11.3 promotes inclusive urbanization and participatory community planning.",
    "🌤️ Cuaca saat ini": "🌤️ Current Weather",
    "Tutup": "Close",
    "Cari kecamatan atau wilayah sekitar": "Search a district or nearby area",
    "Contoh: Rajabasa, Sukarame, Natar": "Example: Rajabasa, Sukarame, Natar",
    "Area pencarian dibatasi di sekitar Bandar Lampung.":
      "Searches are limited to the area around Bandar Lampung.",
    "Tekan tombol untuk memuat cuaca terkini.":
      "Press the button to load the latest weather.",
    "Muat Cuaca": "Load Weather",
    "Asisten SAMARA": "SAMARA Assistant",
    "Tanya seputar laporan warga": "Ask about community reports",
    "Tutup chatbot": "Close chat",
    "👋 Halo, Sobat SAMARA! Ada yang bisa saya bantu hari ini? Saya siap memandu Anda membuat laporan, memilih kategori yang tepat, atau mengecek status aduan. Yuk, mulai dari kebutuhan Anda!":
      "👋 Hello, SAMARA community! How can I help today? I can guide you through submitting a report, choosing the right category, or checking a report's status. What would you like to do?",
    "Saya belum bisa menentukan kategori secara pasti dari deskripsi tersebut. Coba jelaskan objek yang rusak dan masalah utamanya (misalnya: lampu jalan mati, jalan berlubang, selokan tersumbat, lampu lalu lintas mati, halte rusak, tumpukan sampah, atau fasilitas taman rusak).":
      "I couldn't determine the category from that description. Please describe the damaged item and main issue (for example: a streetlight outage, pothole, blocked drain, traffic light outage, damaged bus stop, garbage pileup, or damaged park facility).",
    "Panduan membuat laporan": "How to submit a report",
    "Tentukan kategori laporan": "Choose a report category",
    "Cek status laporan": "Check report status",
    "Info foto & lokasi": "Photo & location info",
    "Ceritakan singkat masalah yang ingin dilaporkan (contoh: \"lampu jalan di depan sekolah mati\" atau \"ada lubang besar di aspal\"). Saya akan sarankan kategori yang sesuai.":
      "Briefly describe the issue you want to report (e.g. \"a streetlight is out in front of a school\" or \"there is a large pothole\"). I'll suggest a suitable category.",
    "Tulis pertanyaan": "Type your question",
    "Tulis pertanyaan...": "Type your question...",
    "Kirim pertanyaan": "Send question",
    "Kirim": "Send",
    "Mendukung SDG 11: Kota dan Permukiman yang Berkelanjutan":
      "Supporting SDG 11: Sustainable Cities and Communities",
    "Navigasi": "Navigation",
    "Buat Laporan": "Submit a Report",
    "Lacak Laporan": "Track a Report",
    "© 2026 SAMARA": "© 2026 SAMARA",
    "Dikembangkan oleh Tim SAMARA": "Developed by the SAMARA Team",
    "SAMARA - Kota Cerdas untuk Masa Depan":
      "SAMARA - A Smart City for the Future",
    "Laporkan dan pantau kondisi fasilitas publik bersama SAMARA.":
      "Report and monitor public facility conditions with SAMARA.",
    "Memuat SAMARA": "Loading SAMARA",
    "Menyiapkan layanan pelaporan warga...":
      "Preparing the community reporting service...",

    "Data tidak dapat diproses. Silakan coba lagi.":
      "The data could not be processed. Please try again.",
    "Masukkan ID Laporan dan email yang dipakai saat melapor.":
      "Enter the Report ID and the email address used to submit the report.",
    "ID Laporan harus berupa angka.": "The Report ID must contain numbers only.",
    "Format email tidak valid.": "The email address format is invalid.",
    "Mencari laporan...": "Searching for report...",
    "Data ditampilkan dari penyimpanan browser perangkat ini (versi statis).":
      "Data shown from this device's browser storage (static version).",
    "Laporan tidak ditemukan di perangkat ini. Periksa ID Laporan, email, atau pastikan laporan dibuat di browser ini.":
      "Report not found on this device. Check the Report ID and email, or make sure the report was submitted in this browser.",
    "Peta dasar gagal dimuat. Periksa koneksi internet Anda.":
      "The base map could not be loaded. Check your internet connection.",
    "Memuat peta dasar...": "Loading base map...",
    "Memuat titik laporan...": "Loading report markers...",
    "Tidak ada laporan untuk status yang dipilih.":
      "There are no reports for the selected status.",
    "Riwayat lokal tidak dapat dibaca. Penyimpanan browser mungkin rusak.":
      "Local history could not be read. Browser storage may be corrupted.",
    "Masukkan email pelaporan pada kolom Lacak untuk menampilkan riwayat.":
      "Enter your report email in the Track section to view your history.",
    "Belum ada laporan dengan email tersebut di perangkat ini.":
      "There are no reports for that email on this device.",
    "Browser tidak mendukung geolokasi. Cuaca Bandar Lampung tetap tersedia.":
      "This browser does not support geolocation. Bandar Lampung weather is still available.",
    "Meminta izin lokasi perangkat...": "Requesting device location permission...",
    "Masukkan nama kecamatan atau wilayah yang ingin dicari.":
      "Enter the district or area you want to search for.",
    "Cuaca tidak dapat dimuat. Periksa koneksi internet lalu coba lagi.":
      "Weather could not be loaded. Check your internet connection and try again.",
    "Selesai mengetik? Klik di luar kolom untuk mencari lokasi di peta.":
      "Finished typing? Click outside the field to search for the location on the map.",
    "Tambahkan nama jalan, nomor, gedung, atau patokan lokasi selain nama kota.":
      "Add a street name, number, building, or landmark in addition to the city.",
    "Mencari alamat di peta...": "Searching for address on the map...",
    "Alamat tidak ditemukan. Coba tambahkan nama jalan atau kelurahan.":
      "Address not found. Try adding a street or neighborhood name.",
    "Pilih alamat yang paling cocok. Hasil pencarian belum dipasang sebagai pin.":
      "Choose the best matching address. Search results are not pinned until selected.",
    "Alamat yang dipilih berada di luar Bandar Lampung.":
      "The selected address is outside Bandar Lampung.",
    "Pencarian alamat gagal. Periksa koneksi internet atau pilih titik di peta.":
      "Address search failed. Check your internet connection or select a point on the map.",
    "Titik lokasi dipilih secara manual di peta.":
      "The location point was selected manually on the map.",
    "Browser Anda tidak mendukung fitur lokasi.":
      "Your browser does not support location services.",
    "Lokasi Anda dipilih di peta.": "Your location was selected on the map.",
    "Laporan lokal tidak dapat dibaca. Penyimpanan browser mungkin rusak.":
      "Local reports could not be read. Browser storage may be corrupted."
  };

  const textSources = new WeakMap();
  const attributeSources = new WeakMap();
  const translatableAttributes = ["placeholder", "aria-label", "title", "alt"];
  const languageStorageKey = "samara-language";
  let currentLanguage = readSavedLanguage();
  let observer;

  function readSavedLanguage() {
    try {
      return window.localStorage.getItem(languageStorageKey) === "en" ? "en" : "id";
    } catch (error) {
      console.error("Preferensi bahasa tidak dapat dibaca:", error);
      return "id";
    }
  }

  function storeLanguage(language) {
    try {
      window.localStorage.setItem(languageStorageKey, language);
    } catch (error) {
      console.error("Preferensi bahasa tidak dapat disimpan:", error);
    }
  }

  function normalize(value) {
    return value.replace(/\s+/g, " ").trim();
  }

  function translateCategoryResponse(value) {
    const singleCategory = value.match(
      /^Berdasarkan deskripsi Anda, kategori yang paling sesuai adalah: (.+)\. Jika kurang tepat, Anda bisa pilih "Lainnya" saat mengisi formulir laporan\.$/
    );
    if (singleCategory) {
      const category = translations[singleCategory[1]] || singleCategory[1];
      return `Based on your description, the best matching category is: ${category}. If this doesn't seem right, choose "Other" when submitting the report.`;
    }

    const multipleCategories = value.match(
      /^Deskripsi Anda mirip dengan beberapa kategori: (.+)\. Pilih yang paling dominan pada formulir laporan\. Jika tidak ada yang cocok, gunakan kategori "Lainnya"\.$/
    );
    if (multipleCategories) {
      const categories = multipleCategories[1]
        .split(", ")
        .map(category => translations[category] || category)
        .join(", ");
      return `Your description matches several categories: ${categories}. Choose the best fit on the report form. If none apply, select "Other".`;
    }

    return null;
  }

  function translatedValue(source, language) {
    if (language !== "en") return source;
    const key = normalize(source);
    const translation = translations[key] || translateCategoryResponse(key);
    if (!translation) return source;

    const leadingWhitespace = source.match(/^\s*/)[0];
    const trailingWhitespace = source.match(/\s*$/)[0];
    return `${leadingWhitespace}${translation}${trailingWhitespace}`;
  }

  function processTextNode(node, detectSourceChanges = true) {
    let source = textSources.get(node);
    const current = node.nodeValue;

    if (source === undefined) {
      source = current;
      textSources.set(node, source);
    } else if (detectSourceChanges &&
      current !== source &&
      current !== translatedValue(source, currentLanguage)
    ) {
      source = current;
      textSources.set(node, source);
    }

    const translated = translatedValue(source, currentLanguage);
    if (node.nodeValue !== translated) node.nodeValue = translated;
  }

  function processAttributes(element, detectSourceChanges = true) {
    let sources = attributeSources.get(element);
    if (!sources) {
      sources = new Map();
      attributeSources.set(element, sources);
    }

    translatableAttributes.forEach(attribute => {
      if (!element.hasAttribute(attribute)) return;

      const current = element.getAttribute(attribute);
      let source = sources.get(attribute);
      if (source === undefined) {
        source = current;
        sources.set(attribute, source);
      } else if (detectSourceChanges &&
        current !== source &&
        current !== translatedValue(source, currentLanguage)
      ) {
        source = current;
        sources.set(attribute, source);
      }

      const translated = translatedValue(source, currentLanguage);
      if (current !== translated) element.setAttribute(attribute, translated);
    });
  }

  function scan(node, detectSourceChanges = true) {
    if (node.nodeType === Node.TEXT_NODE) {
      processTextNode(node, detectSourceChanges);
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    processAttributes(node, detectSourceChanges);
    node.childNodes.forEach(child => scan(child, detectSourceChanges));
  }

  function updateLanguageButtons() {
    document.querySelectorAll("[data-language]").forEach(button => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.language === currentLanguage)
      );
    });
  }

  function applyLanguage() {
    if (observer) observer.disconnect();

    document.documentElement.lang = currentLanguage;
    document.title = translatedValue(
      "SAMARA - Kota Cerdas untuk Masa Depan",
      currentLanguage
    );
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute(
        "content",
        translatedValue(
          "Laporkan dan pantau kondisi fasilitas publik bersama SAMARA.",
          currentLanguage
        )
      );
    }

    scan(document.body, false);
    updateLanguageButtons();

    if (observer) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: translatableAttributes,
        characterData: true,
        childList: true,
        subtree: true
      });
    }
  }

  document.querySelectorAll("[data-language]").forEach(button => {
    button.addEventListener("click", () => {
      const language = button.dataset.language;
      if (language !== "id" && language !== "en") return;
      if (language === currentLanguage) return;

      currentLanguage = language;
      storeLanguage(language);
      applyLanguage();
    });
  });

  observer = new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === "characterData") {
        processTextNode(record.target);
        return;
      }

      if (record.type === "attributes") {
        processAttributes(record.target);
        return;
      }

      record.addedNodes.forEach(scan);
    });
  });

  applyLanguage();
})();
