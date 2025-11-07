document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationCustomForm');
    const submitButton = document.getElementById('submitButton');
    const buttonContent = submitButton ? submitButton.querySelector('.button-content') : null;
    const responseMessage = document.getElementById('responseMessage');
    const whatsappButtonContainer = document.getElementById('whatsappButtonContainer'); 

    // Cek apakah semua elemen penting ditemukan
    if (!registrationForm || !submitButton || !buttonContent || !responseMessage || !whatsappButtonContainer) {
        console.error("Error: Satu atau lebih elemen formulir tidak ditemukan. Logika tidak dapat berjalan.");
        return; 
    }

    registrationForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Mencegah pengiriman formulir default (reload halaman)

        // 1. **Mulai Efek Loading pada Tombol & Sembunyikan Pesan Lama**
        submitButton.disabled = true; 
        submitButton.classList.add('loading'); 
        if (buttonContent) buttonContent.textContent = 'Mengirim...'; 
        responseMessage.classList.remove('show', 'success', 'error'); 
        responseMessage.textContent = ''; 
        whatsappButtonContainer.classList.remove('show'); 

        const form = event.target;
        // PENTING: Nama input harus sama dengan yang di HTML: name="ssBukti"
        const fileInput = form.querySelector('input[name="ssBukti"]');

        // --- GANTI INI DENGAN URL CLOUDFLARE PROXY ANDA NANTI ---
        const appScriptUrl = 'URL_CLOUDFLARE_PROXY_BARU_ANDA'; 
        // --------------------------------------------------------

        try {
            const formData = new FormData(form);
            let isFileAttached = false;

            // Proses file menjadi Base64
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                isFileAttached = true;

                // Membaca file dan mengkonversinya menjadi string Base64 (Promise)
                const base64Data = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(file); // Baca file sebagai Data URL
                });

                // Menambahkan Base64 dan nama file ke FormData
                // Nama field ini harus diambil dan diolah di Google Apps Script
                formData.append('Screenshot Bukti Kepemilikan Account BA_base64', base64Data);
                formData.append('Screenshot Bukti Kepemilikan Account BA_filename', file.name);
                
                // Hapus input file asli agar tidak dikirim (Apps Script doPost tidak bisa baca file langsung)
                formData.delete('ssBukti'); 
            } else {
                isFileAttached = false;
            }

            // Validasi: File screenshot wajib diunggah
            if (!isFileAttached) {
                throw new Error('File screenshot wajib diunggah.');
            }
            
            // Kirim data ke Apps Script via Proxy
            const response = await fetch(appScriptUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                // Mencoba membaca respons error dari server/proxy
                const errorText = await response.text();
                // Mengurai JSON jika memungkinkan, jika tidak menggunakan teks mentah
                try {
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.message || errorJson.error || `HTTP error! status: ${response.status}`);
                } catch (e) {
                    throw new Error(`HTTP error! status: ${response.status}. Pesan server: ${errorText.substring(0, 100)}...`);
                }
            }

            const result = await response.json();

            // 2. Tampilkan pesan berdasarkan respons dari Apps Script
            if (result.status === 'success') {
                responseMessage.textContent = 'Selamat, formulir Anda berhasil dikirim!';
                responseMessage.classList.add('show', 'success');
                form.reset(); // Mengosongkan semua input di formulir
                whatsappButtonContainer.classList.add('show'); // Tampilkan tombol WhatsApp
            } else {
                const errorMessage = result.message || 'Terjadi kesalahan tidak diketahui dari server.';
                throw new Error(errorMessage);
            }

        } catch (error) {
            // 3. Tangani semua kesalahan (Jaringan, Validasi, atau Server)
            responseMessage.textContent = 'Gagal: ' + error.message;
            responseMessage.classList.add('show', 'error');
            console.error('Error during form submission:', error);
        } finally {
            // 4. Kembali ke kondisi awal tombol (selesai loading)
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
            if (buttonContent) buttonContent.textContent = 'Daftar Sekarang';
        }
    });
});


// Fungsi untuk memainkan suara saat hover
function playSound() {
    const sound = document.getElementById("hoverSound");
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.warn("Audio play failed:", e));
    }
}

// Fungsi untuk mengaktifkan/nonaktifkan dropdown formulir
function toggleRegistrationForm() {
    const section = document.querySelector('.registration-section');
    const content = document.querySelector('.registration-form-content');

    section.classList.toggle('active');
    content.classList.toggle('active');

    // Sembunyikan pesan respons dan tombol WhatsApp saat formulir ditutup/dibuka
    const responseMessage = document.getElementById('responseMessage');
    const whatsappButtonContainer = document.getElementById('whatsappButtonContainer');

    if (responseMessage) {
        responseMessage.classList.remove('show', 'success', 'error');
        responseMessage.textContent = '';
    }
    if (whatsappButtonContainer) {
        whatsappButtonContainer.classList.remove('show');
    }

    playSound();
}
