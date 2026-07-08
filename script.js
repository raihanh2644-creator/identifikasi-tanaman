/**
 * CONFIGURATION
 */
const ANALYZE_API_URL = "/api/analyze";
const STATUS_API_URL = "/api/status";

// --- DOM Selectors ---
const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const imagePreview = document.getElementById('image-preview');
const uploadPlaceholder = document.querySelector('.upload-placeholder');
const identifyBtn = document.getElementById('identify-btn');
const loading = document.getElementById('loading');
const resultsSection = document.getElementById('results-section');
const journalGrid = document.getElementById('journal-grid');
const reminderBoard = document.getElementById('reminder-board');
const saveBtn = document.getElementById('save-btn');
const cameraBtn = document.getElementById('camera-btn');
const captureBtn = document.getElementById('capture-btn');
const closeCameraBtn = document.getElementById('close-camera-btn');
const cameraPreview = document.getElementById('camera-preview');
const cameraCanvas = document.getElementById('camera-canvas');
const languageSelect = document.getElementById('language-select');
const collectionCount = document.getElementById('collection-count');
const plantModal = document.getElementById('plant-modal');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal-btn');
const modeTabs = document.querySelectorAll('.mode-tab');
const compareUpload = document.getElementById('compare-upload');
const compareFileInput = document.getElementById('compare-file-input');
const compareImagePreview = document.getElementById('compare-image-preview');
const aiStatus = document.getElementById('ai-status');

let currentPlantData = null;
let currentImageData = null;
let currentImageMime = "image/jpeg";
let compareImageData = null;
let compareImageMime = "image/jpeg";
let cameraStream = null;
let currentLanguage = localStorage.getItem('leafLensLanguage') || 'id';
let currentMode = 'identify';
const MAX_ANALYSIS_IMAGE_SIZE = 1280;
const ANALYSIS_IMAGE_QUALITY = 0.82;

const translations = {
    id: {
        tagline: "Identifikasi tanaman dan pelajari cara merawatnya dengan cepat.",
        languageLabel: "Bahasa",
        identifyTitle: "Identifikasi Tanaman Baru",
        uploadText: "Klik atau tarik gambar ke sini",
        uploadHint: "Mendukung JPG, PNG",
        openCamera: "Buka Kamera",
        capturePhoto: "Ambil Foto",
        closeCamera: "Tutup Kamera",
        identifyButton: "Analisis Tanaman",
        aiTitle: "AI Gemini",
        aiChecking: "Mengecek koneksi AI dari server...",
        aiReady: "AI aktif dari server. Upload foto lalu tekan Analisis Tanaman.",
        aiNotReady: "AI belum aktif. Jalankan server Node dan isi GEMINI_API_KEY di file .env.",
        aiServerError: "Server AI belum terhubung. Jalankan aplikasi lewat node server.js.",
        modeIdentify: "Analisis Tanaman",
        modeCompare: "Komparasi",
        compareSecondPhoto: "Foto kedua untuk dibandingkan",
        compareButton: "Bandingkan Foto",
        loadingText: "Menganalisis detail tanaman...",
        careGuide: "Panduan Perawatan",
        wateringLabel: "Penyiraman:",
        sunlightLabel: "Cahaya:",
        soilLabel: "Tanah:",
        pestsTitle: "Hama & Penyakit",
        saveButton: "Simpan ke Jurnal",
        journalTitle: "Buku Koleksi Tanaman",
        journalSubtitle: "Kartu tanaman yang pernah kamu identifikasi dan simpan.",
        collectionCount: "Kartu",
        emptyJournal: "Belum ada kartu tanaman. Identifikasi tanaman lalu simpan ke buku koleksi.",
        viewDetail: "Lihat Detail",
        cardNumber: "Kartu",
        collectedOn: "Disimpan",
        descriptionTitle: "Deskripsi Tanaman",
        diseaseTitle: "Hasil Cek Penyakit",
        compareTitle: "Hasil Komparasi",
        severity: "Tingkat Risiko",
        causes: "Kemungkinan Penyebab",
        treatmentPlan: "Rencana Perawatan",
        prevention: "Pencegahan",
        visualChanges: "Perubahan Visual",
        healthTrend: "Tren Kesehatan",
        recommendation: "Rekomendasi",
        reminderTitle: "Reminder Perawatan",
        wateringEvery: "Siram tiap",
        fertilizingEvery: "Pupuk tiap",
        sunlightCheckEvery: "Cek cahaya tiap",
        days: "hari",
        saveReminder: "Simpan Reminder",
        nextWatering: "Siram berikutnya",
        nextFertilizing: "Pupuk berikutnya",
        nextSunlightCheck: "Cek cahaya berikutnya",
        reminderBoardTitle: "Jadwal Perawatan Terdekat",
        noReminders: "Simpan tanaman ke jurnal untuk melihat jadwal perawatan.",
        healthNotesTitle: "Catatan Kesehatan",
        notePlaceholder: "Contoh: daun bawah mulai menguning, tanah masih lembap.",
        addNote: "Tambah Catatan",
        noHealthNotes: "Belum ada catatan kesehatan.",
        match: "Cocok",
        symptoms: "Gejala",
        solution: "Solusi",
        delete: "Hapus",
        saved: "Tanaman disimpan ke jurnal!",
        identifyError: "Gagal mengidentifikasi tanaman: ",
        cameraSecure: "Kamera hanya bisa dipakai dari localhost atau HTTPS. Buka halaman lewat http://localhost:8001, bukan langsung dari file.",
        cameraUnsupported: "Browser ini belum mendukung preview kamera langsung. Silakan ambil foto lewat pilihan file.",
        cameraDenied: "Izin kamera ditolak. Klik ikon izin di address bar browser, izinkan Camera, lalu coba lagi.",
        cameraNotFound: "Kamera tidak ditemukan. Pastikan kamera tersambung dan tidak dinonaktifkan.",
        cameraBusy: "Kamera sedang dipakai aplikasi lain. Tutup aplikasi kamera/video meeting, lalu coba lagi.",
        cameraUnavailable: "Kamera belakang tidak tersedia. Coba gunakan kamera lain atau ambil foto lewat pilihan file.",
        cameraUnknown: "Kamera tidak bisa dibuka",
        cameraTry: "Coba buka lewat http://localhost:8001 dan pastikan izin kamera diberikan.",
        cameraNotReady: "Kamera belum siap. Coba tunggu sebentar lalu ambil foto lagi.",
        promptLanguage: "Bahasa Indonesia"
    },
    en: {
        tagline: "Identify plants and learn how to care for them instantly.",
        languageLabel: "Language",
        identifyTitle: "Identify New Plant",
        uploadText: "Click or drag image here",
        uploadHint: "Supports JPG, PNG",
        openCamera: "Open Camera",
        capturePhoto: "Take Photo",
        closeCamera: "Close Camera",
        identifyButton: "Analyze Plant",
        aiTitle: "Gemini AI",
        aiChecking: "Checking AI connection from the server...",
        aiReady: "AI is active from the server. Upload a photo, then press Analyze Plant.",
        aiNotReady: "AI is not active yet. Run the Node server and set GEMINI_API_KEY in .env.",
        aiServerError: "AI server is not connected. Run the app through node server.js.",
        modeIdentify: "Analyze Plant",
        modeCompare: "Compare",
        compareSecondPhoto: "Second photo to compare",
        compareButton: "Compare Photos",
        loadingText: "Analyzing plant details...",
        careGuide: "Care Guide",
        wateringLabel: "Watering:",
        sunlightLabel: "Sunlight:",
        soilLabel: "Soil:",
        pestsTitle: "Pests & Diseases",
        saveButton: "Save to Journal",
        journalTitle: "Plant Collection Book",
        journalSubtitle: "Plant cards you have identified and saved.",
        collectionCount: "Cards",
        emptyJournal: "No plant cards yet. Identify a plant, then save it to your collection book.",
        viewDetail: "View Detail",
        cardNumber: "Card",
        collectedOn: "Collected",
        descriptionTitle: "Plant Description",
        diseaseTitle: "Disease Check Result",
        compareTitle: "Comparison Result",
        severity: "Risk Level",
        causes: "Possible Causes",
        treatmentPlan: "Care Plan",
        prevention: "Prevention",
        visualChanges: "Visual Changes",
        healthTrend: "Health Trend",
        recommendation: "Recommendation",
        reminderTitle: "Care Reminder",
        wateringEvery: "Water every",
        fertilizingEvery: "Fertilize every",
        sunlightCheckEvery: "Check light every",
        days: "days",
        saveReminder: "Save Reminder",
        nextWatering: "Next watering",
        nextFertilizing: "Next fertilizing",
        nextSunlightCheck: "Next light check",
        reminderBoardTitle: "Upcoming Care Schedule",
        noReminders: "Save plants to the journal to see care schedules.",
        healthNotesTitle: "Health Notes",
        notePlaceholder: "Example: lower leaves are yellowing, soil is still moist.",
        addNote: "Add Note",
        noHealthNotes: "No health notes yet.",
        match: "Match",
        symptoms: "Symptoms",
        solution: "Solution",
        delete: "Delete",
        saved: "Plant saved to journal!",
        identifyError: "Failed to identify plant: ",
        cameraSecure: "Camera can only be used from localhost or HTTPS. Open the page through http://localhost:8001, not directly from a file.",
        cameraUnsupported: "This browser does not support live camera preview. Please take a photo through the file picker.",
        cameraDenied: "Camera permission was denied. Click the permission icon in the address bar, allow Camera, then try again.",
        cameraNotFound: "No camera was found. Make sure a camera is connected and enabled.",
        cameraBusy: "The camera is being used by another app. Close camera/video meeting apps, then try again.",
        cameraUnavailable: "The rear camera is unavailable. Try another camera or take a photo through the file picker.",
        cameraUnknown: "Camera could not be opened",
        cameraTry: "Try opening through http://localhost:8001 and make sure camera permission is allowed.",
        cameraNotReady: "Camera is not ready yet. Wait a moment, then take the photo again.",
        promptLanguage: "English"
    }
};

function t(key) {
    return translations[currentLanguage][key] || translations.id[key] || key;
}

function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    }[char]));
}

function renderParagraphs(value) {
    const text = String(value || "-").trim();
    const parts = text.includes("\n")
        ? text.split(/\n+/)
        : text.split(/(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-ÞA-Z])/);

    return parts
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => `<p>${escapeHtml(part)}</p>`)
        .join("");
}

// --- Event Listeners ---
dropZone.addEventListener('click', () => {
    if (!cameraStream) fileInput.click();
});
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.backgroundColor = '#e9f5ee';
    dropZone.style.borderColor = '#2d6a4f';
});
dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.backgroundColor = '';
    dropZone.style.borderColor = '';
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.style.backgroundColor = '';
    dropZone.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event('change'));
    }
});
fileInput.addEventListener('change', handleFile);
compareFileInput.addEventListener('change', handleCompareFile);
identifyBtn.addEventListener('click', identifyPlant);
saveBtn.addEventListener('click', saveToJournal);
cameraBtn.addEventListener('click', openCamera);
captureBtn.addEventListener('click', capturePhoto);
closeCameraBtn.addEventListener('click', closeCamera);
closeModalBtn.addEventListener('click', closePlantModal);
plantModal.addEventListener('click', (event) => {
    if (event.target === plantModal) closePlantModal();
});
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePlantModal();
});
languageSelect.addEventListener('change', (event) => {
    currentLanguage = event.target.value;
    localStorage.setItem('leafLensLanguage', currentLanguage);
    applyLanguage();
    updateAiStatus();
    updateModeUI();
    if (currentPlantData) displayResults(currentPlantData);
    renderJournal();
});
modeTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        currentMode = tab.dataset.mode;
        currentPlantData = null;
        updateModeUI();
        resultsSection.classList.add('hidden');
    });
});

// --- Functions ---

function applyLanguage() {
    document.documentElement.lang = currentLanguage;
    languageSelect.value = currentLanguage;
    document.querySelectorAll('[data-i18n]').forEach((element) => {
        element.innerText = t(element.dataset.i18n);
    });
}

function updateModeUI() {
    modeTabs.forEach((tab) => {
        tab.classList.toggle('active', tab.dataset.mode === currentMode);
    });

    compareUpload.classList.toggle('hidden', currentMode !== 'compare');

    const buttonLabels = {
        identify: t('identifyButton'),
        compare: t('compareButton')
    };
    identifyBtn.querySelector('span').innerText = buttonLabels[currentMode];
    identifyBtn.disabled = !canRunAnalysis();
}

function canRunAnalysis() {
    if (!currentImageData) return false;
    return currentMode !== 'compare' || Boolean(compareImageData);
}

async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    closeCamera();

    try {
        const image = await prepareImageForAnalysis(file);
        currentImageMime = image.mimeType;
        currentImageData = image.dataUrl;
        imagePreview.src = currentImageData;
        imagePreview.classList.remove('hidden');
        uploadPlaceholder.classList.add('hidden');
        identifyBtn.disabled = !canRunAnalysis();
        resultsSection.classList.add('hidden');
    } catch (error) {
        alert(error.message);
    }
}

async function handleCompareFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const image = await prepareImageForAnalysis(file);
        compareImageMime = image.mimeType;
        compareImageData = image.dataUrl;
        compareImagePreview.src = compareImageData;
        compareImagePreview.classList.remove('hidden');
        identifyBtn.disabled = !canRunAnalysis();
        resultsSection.classList.add('hidden');
    } catch (error) {
        alert(error.message);
    }
}

function prepareImageForAnalysis(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
        reader.onload = () => {
            compressImageDataUrl(reader.result)
                .then(resolve)
                .catch(reject);
        };
        reader.readAsDataURL(file);
    });
}

function compressImageDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onerror = () => reject(new Error("Format gambar tidak bisa dibaca."));
        img.onload = () => {
            const scale = Math.min(1, MAX_ANALYSIS_IMAGE_SIZE / Math.max(img.width, img.height));
            const width = Math.max(1, Math.round(img.width * scale));
            const height = Math.max(1, Math.round(img.height * scale));

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);

            resolve({
                mimeType: "image/jpeg",
                dataUrl: canvas.toDataURL("image/jpeg", ANALYSIS_IMAGE_QUALITY)
            });
        };
        img.src = dataUrl;
    });
}

async function openCamera() {
    if (!window.isSecureContext) {
        alert(t('cameraSecure'));
        return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        fileInput.click();
        alert(t('cameraUnsupported'));
        return;
    }

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: "environment" }
            },
            audio: false
        });

        cameraPreview.srcObject = cameraStream;
        cameraPreview.classList.remove('hidden');
        imagePreview.classList.add('hidden');
        uploadPlaceholder.classList.add('hidden');
        captureBtn.classList.remove('hidden');
        closeCameraBtn.classList.remove('hidden');
        cameraBtn.classList.add('hidden');
        identifyBtn.disabled = true;
        resultsSection.classList.add('hidden');
    } catch (error) {
        console.error("CAMERA ERROR:", error);
        alert(getCameraErrorMessage(error));
        fileInput.click();
    }
}

function getCameraErrorMessage(error) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
        return t('cameraDenied');
    }

    if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        return t('cameraNotFound');
    }

    if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        return t('cameraBusy');
    }

    if (error.name === "OverconstrainedError" || error.name === "ConstraintNotSatisfiedError") {
        return t('cameraUnavailable');
    }

    return `${t('cameraUnknown')} (${error.name || "UnknownError"}). ${t('cameraTry')}`;
}

function capturePhoto() {
    if (!cameraStream) return;

    const width = cameraPreview.videoWidth;
    const height = cameraPreview.videoHeight;

    if (!width || !height) {
        alert(t('cameraNotReady'));
        return;
    }

    const scale = Math.min(1, MAX_ANALYSIS_IMAGE_SIZE / Math.max(width, height));
    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    cameraCanvas.width = targetWidth;
    cameraCanvas.height = targetHeight;
    cameraCanvas.getContext('2d').drawImage(cameraPreview, 0, 0, targetWidth, targetHeight);

    currentImageMime = "image/jpeg";
    currentImageData = cameraCanvas.toDataURL(currentImageMime, ANALYSIS_IMAGE_QUALITY);
    imagePreview.src = currentImageData;
    imagePreview.classList.remove('hidden');
    identifyBtn.disabled = !canRunAnalysis();
    closeCamera();
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }

    cameraPreview.srcObject = null;
    cameraPreview.classList.add('hidden');
    captureBtn.classList.add('hidden');
    closeCameraBtn.classList.add('hidden');
    cameraBtn.classList.remove('hidden');

    if (!currentImageData) {
        uploadPlaceholder.classList.remove('hidden');
    }
}

async function identifyPlant() {
    if (!canRunAnalysis()) return;

    loading.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    identifyBtn.disabled = true;

    const base64Image = currentImageData.split(',')[1];
    const images = [
        { mimeType: currentImageMime, data: base64Image }
    ];

    if (currentMode === 'compare') {
        images.push({ mimeType: compareImageMime, data: compareImageData.split(',')[1] });
    }

    try {
        const response = await fetch(ANALYZE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: getPromptForMode(),
                images
            })
        });

        if (!response.ok) {
            const errorMsg = await response.json();
            throw new Error(errorMsg.error || errorMsg.message || "Gagal menghubungi AI");
        }

        currentPlantData = await response.json();
        currentPlantData.analysisType = currentMode;
        
        displayResults(currentPlantData);
    } catch (error) {
        console.error("DEBUG ERROR:", error);
        alert(t('identifyError') + error.message);
    } finally {
        loading.classList.add('hidden');
        identifyBtn.disabled = !canRunAnalysis();
    }
}

async function updateAiStatus() {
    aiStatus.innerText = t('aiChecking');
    aiStatus.classList.remove('ready');

    try {
        const response = await fetch(STATUS_API_URL);
        if (!response.ok) throw new Error("Server status unavailable");

        const status = await response.json();
        aiStatus.innerText = status.ready ? t('aiReady') : t('aiNotReady');
        aiStatus.classList.toggle('ready', Boolean(status.ready));
    } catch (error) {
        aiStatus.innerText = t('aiServerError');
        aiStatus.classList.remove('ready');
    }
}

function getPromptForMode() {
    if (currentMode === 'compare') {
        return `
            Tolong bertindak sebagai ahli botani dan kesehatan tanaman profesional.
            Bandingkan dua foto tanaman yang diberikan. Foto pertama adalah kondisi awal, foto kedua adalah kondisi terbaru.
            Berikan hasil dalam ${t('promptLanguage')} dengan paragraf yang jelas.

            Hasil HARUS dalam format JSON murni:
            {
                "name": "Nama tanaman jika bisa dikenali, atau Tanaman tidak diketahui",
                "scientificName": "Nama ilmiah jika bisa dikenali",
                "confidence": "Persentase keyakinan analisis (contoh: 88%)",
                "visualChanges": "Perubahan visual utama antara foto pertama dan kedua.",
                "healthTrend": "Membaik/Stabil/Menurun/Tidak pasti, beserta alasannya.",
                "symptoms": "Gejala baru atau gejala yang berkurang.",
                "causes": "Kemungkinan penyebab perubahan.",
                "recommendation": "Rekomendasi tindakan berikutnya."
            }

            PENTING: Jangan memberikan kata-kata pengantar. Hanya kembalikan objek JSON tersebut.
        `;
    }

    return `
        Tolong bertindak sebagai ahli botani dan ahli kesehatan tanaman profesional. 
        Identifikasi tanaman dalam gambar ini, jelaskan cara merawatnya, dan sekaligus cek apakah terlihat gejala penyakit, hama, kekurangan nutrisi, atau stres lingkungan.
        Berikan informasi detail dalam ${t('promptLanguage')}.
        Tulis setiap bagian informasi sebagai paragraf yang jelas. Jika ada beberapa ide berbeda, pisahkan dengan baris baru.
        
        Hasil HARUS dalam format JSON murni seperti struktur di bawah ini:
        {
            "name": "Nama Umum Tanaman",
            "scientificName": "Nama Ilmiah/Latin",
            "confidence": "Persentase akurasi (contoh: 98%)",
            "description": "Berikan deskripsi singkat tentang asal usul dan karakteristik tanaman ini (minimal 3 kalimat).",
            "watering": "Instruksi detail tentang frekuensi dan cara menyiram.",
            "sunlight": "Kebutuhan intensitas cahaya matahari (misal: terang tidak langsung, teduh, dsb).",
            "soil": "Jenis tanah, drainase, dan tingkat keasaman (pH) yang disukai.",
            "healthStatus": {
                "diagnosis": "Ringkasan kondisi kesehatan tanaman berdasarkan foto.",
                "severity": "Sehat/Rendah/Sedang/Tinggi/Tidak pasti",
                "symptoms": "Gejala visual yang terlihat. Jika tidak ada gejala jelas, tulis Tidak terlihat gejala serius.",
                "causes": "Kemungkinan penyebab masalah jika ada.",
                "treatment": "Langkah perawatan atau tindakan korektif yang disarankan.",
                "prevention": "Cara mencegah masalah muncul lagi."
            },
            "pests": [
                {
                    "name": "Nama Hama/Penyakit 1",
                    "symptoms": "Ciri-ciri tanaman terserang",
                    "treatment": "Cara membasmi atau mengobati"
                },
                {
                    "name": "Nama Hama/Penyakit 2",
                    "symptoms": "Ciri-ciri tanaman terserang",
                    "treatment": "Cara membasmi atau mengobati"
                }
            ]
        }

        PENTING: Jangan memberikan kata-kata pengantar. Hanya kembalikan objek JSON tersebut.
    `;
}

function displayResults(data) {
    document.getElementById('res-name').innerText = data.name || '-';
    document.getElementById('res-sci-name').innerText = data.scientificName || '-';
    document.getElementById('res-confidence').innerText = `${data.confidence} ${t('match')}`;

    const careCard = document.querySelector('.care-card');
    const pestCard = document.querySelector('.pest-card');
    const resultTitle = careCard.querySelector('h3 span');
    const pestTitle = pestCard.querySelector('h3 span');
    const pestContainer = document.getElementById('res-pests');

    if (data.analysisType === 'compare') {
        document.getElementById('res-description').innerHTML = renderParagraphs(data.visualChanges);
        resultTitle.innerText = t('compareTitle');
        document.getElementById('res-water').innerHTML = renderParagraphs(data.healthTrend);
        document.getElementById('res-sun').innerHTML = renderParagraphs(data.causes);
        document.getElementById('res-soil').innerHTML = renderParagraphs(data.recommendation);
        document.querySelector('[data-i18n="wateringLabel"]').innerText = `${t('healthTrend')}:`;
        document.querySelector('[data-i18n="sunlightLabel"]').innerText = `${t('causes')}:`;
        document.querySelector('[data-i18n="soilLabel"]').innerText = `${t('recommendation')}:`;
        pestTitle.innerText = t('visualChanges');
        pestContainer.innerHTML = `<div class="analysis-box"><div class="text-paragraphs"><strong>${t('symptoms')}:</strong> ${renderParagraphs(data.symptoms)}</div></div>`;
    } else {
        document.getElementById('res-description').innerHTML = renderParagraphs(data.description);
        resultTitle.innerText = t('careGuide');
        document.querySelector('[data-i18n="wateringLabel"]').innerText = t('wateringLabel');
        document.querySelector('[data-i18n="sunlightLabel"]').innerText = t('sunlightLabel');
        document.querySelector('[data-i18n="soilLabel"]').innerText = t('soilLabel');
        document.getElementById('res-water').innerHTML = renderParagraphs(data.watering);
        document.getElementById('res-sun').innerHTML = renderParagraphs(data.sunlight);
        document.getElementById('res-soil').innerHTML = renderParagraphs(data.soil);
        pestTitle.innerText = t('diseaseTitle');
        pestContainer.innerHTML = '';
        const health = data.healthStatus || {};
        const healthBox = document.createElement('div');
        healthBox.className = 'analysis-box';
        healthBox.innerHTML = `
            <strong><i class="fas fa-stethoscope"></i> ${t('severity')}: ${escapeHtml(health.severity || '-')}</strong>
            <div class="text-paragraphs">${renderParagraphs(health.diagnosis)}</div>
            <div class="text-paragraphs"><strong>${t('symptoms')}:</strong> ${renderParagraphs(health.symptoms)}</div>
            <div class="text-paragraphs"><strong>${t('causes')}:</strong> ${renderParagraphs(health.causes)}</div>
            <div class="text-paragraphs"><strong>${t('solution')}:</strong> ${renderParagraphs(health.treatment)}</div>
            <div class="text-paragraphs"><strong>${t('prevention')}:</strong> ${renderParagraphs(health.prevention)}</div>
        `;
        pestContainer.appendChild(healthBox);
        (data.pests || []).forEach(pest => {
            const div = document.createElement('div');
            div.className = 'analysis-box';
            div.innerHTML = `
                <strong><i class="fas fa-bug"></i> ${escapeHtml(pest.name)}</strong><br>
                <div class="text-paragraphs"><strong>${t('symptoms')}:</strong> ${renderParagraphs(pest.symptoms)}</div>
                <div class="text-paragraphs"><strong>${t('solution')}:</strong> ${renderParagraphs(pest.treatment)}</div>
            `;
            pestContainer.appendChild(div);
        });
    }

    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function saveToJournal() {
    if (!currentPlantData) return;
    const journal = JSON.parse(localStorage.getItem('plantJournal') || '[]');
    const entry = {
        id: Date.now(),
        analysisType: currentPlantData.analysisType || 'identify',
        name: currentPlantData.name,
        scientificName: currentPlantData.scientificName,
        confidence: currentPlantData.confidence,
        description: currentPlantData.description,
        watering: currentPlantData.watering,
        sunlight: currentPlantData.sunlight,
        soil: currentPlantData.soil,
        pests: currentPlantData.pests || [],
        healthStatus: currentPlantData.healthStatus || null,
        diagnosis: currentPlantData.diagnosis,
        severity: currentPlantData.severity,
        symptoms: currentPlantData.symptoms,
        causes: currentPlantData.causes,
        treatment: currentPlantData.treatment,
        prevention: currentPlantData.prevention,
        visualChanges: currentPlantData.visualChanges,
        healthTrend: currentPlantData.healthTrend,
        recommendation: currentPlantData.recommendation,
        careReminder: {
            wateringDays: 3,
            fertilizingDays: 30,
            sunlightCheckDays: 7,
            updatedAt: new Date().toISOString()
        },
        healthNotes: [],
        date: new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }),
        image: currentImageData,
        compareImage: currentPlantData.analysisType === 'compare' ? compareImageData : null
    };
    journal.unshift(entry);
    localStorage.setItem('plantJournal', JSON.stringify(journal));
    renderJournal();
    alert(t('saved'));
}

function renderJournal() {
    const journal = JSON.parse(localStorage.getItem('plantJournal') || '[]');
    journalGrid.innerHTML = '';
    collectionCount.innerText = `${journal.length} ${t('collectionCount')}`;
    renderCareReminderBoard(journal);

    if (!journal.length) {
        journalGrid.innerHTML = `<div class="empty-journal">${t('emptyJournal')}</div>`;
        return;
    }

    journal.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'journal-card';
        const cardNumber = String(journal.length - index).padStart(3, '0');
        const typeLabel = getAnalysisTypeLabel(item.analysisType);
        card.innerHTML = `
            <div class="card-number">#${cardNumber}</div>
            <img src="${item.image}" alt="${escapeHtml(item.name)}">
            <div class="journal-info">
                <div class="plant-type"><i class="fas fa-leaf"></i> ${escapeHtml(typeLabel)}</div>
                <h4>${escapeHtml(item.name)}</h4>
                <p class="journal-sci-name">${escapeHtml(item.scientificName || '-')}</p>
                <div class="card-meta">
                    <span>${escapeHtml(item.confidence || '-')} ${t('match')}</span>
                    <span>${escapeHtml(item.date)}</span>
                </div>
                <div class="journal-actions">
                    <button class="btn-detail" onclick="openPlantCard(${item.id})">${t('viewDetail')}</button>
                    <button class="btn-delete" onclick="deleteJournalItem(${item.id})">${t('delete')}</button>
                </div>
            </div>
        `;
        journalGrid.appendChild(card);
    });
}

function renderCareReminderBoard(journal) {
    const reminders = journal.flatMap((item) => {
        const reminder = item.careReminder;
        if (!reminder) return [];

        return [
            {
                plantId: item.id,
                plantName: item.name,
                label: t('nextWatering'),
                icon: 'fa-tint',
                date: getNextCareDate(reminder.updatedAt, reminder.wateringDays),
                timestamp: getNextCareTimestamp(reminder.updatedAt, reminder.wateringDays)
            },
            {
                plantId: item.id,
                plantName: item.name,
                label: t('nextFertilizing'),
                icon: 'fa-seedling',
                date: getNextCareDate(reminder.updatedAt, reminder.fertilizingDays),
                timestamp: getNextCareTimestamp(reminder.updatedAt, reminder.fertilizingDays)
            },
            {
                plantId: item.id,
                plantName: item.name,
                label: t('nextSunlightCheck'),
                icon: 'fa-sun',
                date: getNextCareDate(reminder.updatedAt, reminder.sunlightCheckDays),
                timestamp: getNextCareTimestamp(reminder.updatedAt, reminder.sunlightCheckDays)
            }
        ];
    }).sort((a, b) => a.timestamp - b.timestamp).slice(0, 5);

    reminderBoard.innerHTML = `
        <h3><i class="fas fa-bell"></i> ${t('reminderBoardTitle')}</h3>
        <div class="reminder-board-list">
            ${reminders.map(reminder => `
                <button class="reminder-board-item" type="button" onclick="openPlantCard(${reminder.plantId})">
                    <i class="fas ${reminder.icon}"></i>
                    <span>${escapeHtml(reminder.label)}</span>
                    <strong>${escapeHtml(reminder.plantName)}</strong>
                    <small>${escapeHtml(reminder.date)}</small>
                </button>
            `).join('') || `<div class="empty-reminder">${t('noReminders')}</div>`}
        </div>
    `;
}

function getAnalysisTypeLabel(type) {
    if (type === 'disease') return t('diseaseTitle');
    if (type === 'compare') return t('modeCompare');
    return t('modeIdentify');
}

function openPlantCard(id) {
    const journal = JSON.parse(localStorage.getItem('plantJournal') || '[]');
    const item = journal.find(entry => entry.id === id);
    if (!item) return;

    const pests = Array.isArray(item.pests) ? item.pests : [];
    const reminder = item.careReminder || { wateringDays: 3, fertilizingDays: 30, sunlightCheckDays: 7, updatedAt: new Date().toISOString() };
    const notes = Array.isArray(item.healthNotes) ? item.healthNotes : [];
    const analysisHtml = getModalAnalysisHtml(item, pests);
    modalBody.innerHTML = `
        <div class="modal-plant-card">
            <div class="modal-image-wrap">
                <img src="${item.image}" alt="${escapeHtml(item.name)}">
                ${item.compareImage ? `<img src="${item.compareImage}" alt="Foto pembanding ${escapeHtml(item.name)}">` : ''}
            </div>
            <div class="modal-details">
                <div class="badge">${escapeHtml(item.confidence || '-')} ${t('match')}</div>
                <h2>${escapeHtml(item.name)}</h2>
                <p class="scientific-name">${escapeHtml(item.scientificName || '-')}</p>
                <p class="collected-date">${t('collectedOn')}: ${escapeHtml(item.date)}</p>
                ${analysisHtml}
                <h3><i class="fas fa-bell"></i> ${t('reminderTitle')}</h3>
                <form class="reminder-form" onsubmit="saveCareReminder(event, ${item.id})">
                    <label>${t('wateringEvery')} <input name="wateringDays" type="number" min="1" max="90" value="${escapeHtml(reminder.wateringDays)}"> ${t('days')}</label>
                    <label>${t('fertilizingEvery')} <input name="fertilizingDays" type="number" min="1" max="180" value="${escapeHtml(reminder.fertilizingDays)}"> ${t('days')}</label>
                    <label>${t('sunlightCheckEvery')} <input name="sunlightCheckDays" type="number" min="1" max="90" value="${escapeHtml(reminder.sunlightCheckDays)}"> ${t('days')}</label>
                    <button class="btn-secondary" type="submit">${t('saveReminder')}</button>
                </form>
                <div class="reminder-summary">
                    <span>${t('nextWatering')}: ${getNextCareDate(reminder.updatedAt, reminder.wateringDays)}</span>
                    <span>${t('nextFertilizing')}: ${getNextCareDate(reminder.updatedAt, reminder.fertilizingDays)}</span>
                    <span>${t('nextSunlightCheck')}: ${getNextCareDate(reminder.updatedAt, reminder.sunlightCheckDays)}</span>
                </div>
                <h3><i class="fas fa-notes-medical"></i> ${t('healthNotesTitle')}</h3>
                <form class="health-note-form" onsubmit="addHealthNote(event, ${item.id})">
                    <textarea name="note" rows="3" placeholder="${escapeHtml(t('notePlaceholder'))}"></textarea>
                    <button class="btn-secondary" type="submit">${t('addNote')}</button>
                </form>
                <div class="health-note-list">
                    ${notes.map(note => `
                        <div class="health-note">
                            <strong>${escapeHtml(note.date)}</strong>
                            <p>${escapeHtml(note.text)}</p>
                        </div>
                    `).join('') || `<small>${t('noHealthNotes')}</small>`}
                </div>
            </div>
        </div>
    `;
    plantModal.classList.remove('hidden');
}

function getModalAnalysisHtml(item, pests) {
    if (item.analysisType === 'disease') {
        return `
            <h3><i class="fas fa-stethoscope"></i> ${t('diseaseTitle')}</h3>
            <div class="text-paragraphs">${renderParagraphs(item.diagnosis)}</div>
            <div class="modal-care-grid">
                <div><strong>${t('severity')}</strong><div class="text-paragraphs">${renderParagraphs(item.severity)}</div></div>
                <div><strong>${t('symptoms')}</strong><div class="text-paragraphs">${renderParagraphs(item.symptoms)}</div></div>
                <div><strong>${t('causes')}</strong><div class="text-paragraphs">${renderParagraphs(item.causes)}</div></div>
                <div><strong>${t('treatmentPlan')}</strong><div class="text-paragraphs">${renderParagraphs(item.treatment)}</div></div>
                <div><strong>${t('prevention')}</strong><div class="text-paragraphs">${renderParagraphs(item.prevention)}</div></div>
            </div>
        `;
    }

    if (item.analysisType === 'compare') {
        return `
            <h3><i class="fas fa-code-compare"></i> ${t('compareTitle')}</h3>
            <div class="text-paragraphs">${renderParagraphs(item.visualChanges)}</div>
            <div class="modal-care-grid">
                <div><strong>${t('healthTrend')}</strong><div class="text-paragraphs">${renderParagraphs(item.healthTrend)}</div></div>
                <div><strong>${t('symptoms')}</strong><div class="text-paragraphs">${renderParagraphs(item.symptoms)}</div></div>
                <div><strong>${t('causes')}</strong><div class="text-paragraphs">${renderParagraphs(item.causes)}</div></div>
                <div><strong>${t('recommendation')}</strong><div class="text-paragraphs">${renderParagraphs(item.recommendation)}</div></div>
            </div>
        `;
    }

    return `
        <h3><i class="fas fa-align-left"></i> ${t('descriptionTitle')}</h3>
        <div class="text-paragraphs">${renderParagraphs(item.description)}</div>
        <div class="modal-care-grid">
            <div><strong>${t('wateringLabel')}</strong><div class="text-paragraphs">${renderParagraphs(item.watering)}</div></div>
            <div><strong>${t('sunlightLabel')}</strong><div class="text-paragraphs">${renderParagraphs(item.sunlight)}</div></div>
            <div><strong>${t('soilLabel')}</strong><div class="text-paragraphs">${renderParagraphs(item.soil)}</div></div>
        </div>
        <h3><i class="fas fa-bug"></i> ${t('pestsTitle')}</h3>
        <div class="modal-pest-list">
            ${renderHealthAndPestItems(item, pests)}
        </div>
    `;
}

function renderHealthAndPestItems(item, pests) {
    const health = item.healthStatus || null;
    const healthHtml = health ? `
        <div class="modal-pest-item">
            <strong><i class="fas fa-stethoscope"></i> ${t('diseaseTitle')}</strong>
            <div class="text-paragraphs"><b>${t('severity')}:</b> ${renderParagraphs(health.severity)}</div>
            <div class="text-paragraphs">${renderParagraphs(health.diagnosis)}</div>
            <div class="text-paragraphs"><b>${t('symptoms')}:</b> ${renderParagraphs(health.symptoms)}</div>
            <div class="text-paragraphs"><b>${t('causes')}:</b> ${renderParagraphs(health.causes)}</div>
            <div class="text-paragraphs"><b>${t('solution')}:</b> ${renderParagraphs(health.treatment)}</div>
            <div class="text-paragraphs"><b>${t('prevention')}:</b> ${renderParagraphs(health.prevention)}</div>
        </div>
    ` : '';

    const pestHtml = pests.map(pest => `
        <div class="modal-pest-item">
            <strong>${escapeHtml(pest.name)}</strong>
            <div class="text-paragraphs"><b>${t('symptoms')}:</b> ${renderParagraphs(pest.symptoms)}</div>
            <div class="text-paragraphs"><b>${t('solution')}:</b> ${renderParagraphs(pest.treatment)}</div>
        </div>
    `).join('');

    return healthHtml || pestHtml ? `${healthHtml}${pestHtml}` : '<small>-</small>';
}

function getNextCareDate(updatedAt, intervalDays) {
    const base = new Date(updatedAt || Date.now());
    base.setDate(base.getDate() + Number(intervalDays || 1));
    return base.toLocaleDateString(currentLanguage === 'id' ? 'id-ID' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function getNextCareTimestamp(updatedAt, intervalDays) {
    const base = new Date(updatedAt || Date.now());
    base.setDate(base.getDate() + Number(intervalDays || 1));
    return base.getTime();
}

function updateJournalItem(id, updater) {
    const journal = JSON.parse(localStorage.getItem('plantJournal') || '[]');
    const index = journal.findIndex(entry => entry.id === id);
    if (index === -1) return null;
    journal[index] = updater(journal[index]);
    localStorage.setItem('plantJournal', JSON.stringify(journal));
    renderJournal();
    return journal[index];
}

function saveCareReminder(event, id) {
    event.preventDefault();
    const form = event.target;
    updateJournalItem(id, (item) => ({
        ...item,
        careReminder: {
            wateringDays: Number(form.wateringDays.value || 3),
            fertilizingDays: Number(form.fertilizingDays.value || 30),
            sunlightCheckDays: Number(form.sunlightCheckDays.value || 7),
            updatedAt: new Date().toISOString()
        }
    }));
    openPlantCard(id);
}

function addHealthNote(event, id) {
    event.preventDefault();
    const form = event.target;
    const text = form.note.value.trim();
    if (!text) return;

    updateJournalItem(id, (item) => ({
        ...item,
        healthNotes: [
            {
                id: Date.now(),
                text,
                date: new Date().toLocaleDateString(currentLanguage === 'id' ? 'id-ID' : 'en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })
            },
            ...(Array.isArray(item.healthNotes) ? item.healthNotes : [])
        ]
    }));
    openPlantCard(id);
}

function closePlantModal() {
    plantModal.classList.add('hidden');
}

function deleteJournalItem(id) {
    const message = currentLanguage === 'id'
        ? 'Yakin ingin menghapus tanaman ini dari jurnal?'
        : 'Are you sure you want to delete this plant from the journal?';
    if (!confirm(message)) return;
    let journal = JSON.parse(localStorage.getItem('plantJournal') || '[]');
    journal = journal.filter(item => item.id !== id);
    localStorage.setItem('plantJournal', JSON.stringify(journal));
    renderJournal();
}

// Inisialisasi awal
applyLanguage();
updateAiStatus();
updateModeUI();
renderJournal();
