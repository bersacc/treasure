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

document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationCustomForm');
    const submitButton = document.getElementById('submitButton');
    const buttonContent = submitButton ? submitButton.querySelector('.button-content') : null;
    const responseMessage = document.getElementById('responseMessage');
    const whatsappButtonContainer = document.getElementById('whatsappButtonContainer'); // Get the new container

    // Cek apakah semua elemen penting ditemukan
    if (!registrationForm || !submitButton || !buttonContent || !responseMessage || !whatsappButtonContainer) {
        console.error("Error: One or more required elements (form, button, button content, response message, or WhatsApp button container) not found. Cannot proceed with form logic.");
        return; // Hentikan eksekusi jika elemen tidak ditemukan
    }

    registrationForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Mencegah pengiriman formulir default

        // 1. **Mulai Efek Loading pada Tombol & Sembunyikan Pesan Lama**
        submitButton.disabled = true; // Nonaktifkan tombol
        submitButton.classList.add('loading'); // Tambahkan kelas loading untuk CSS
        if (buttonContent) buttonContent.textContent = 'Mengirim...'; // Ubah teks tombol
        responseMessage.classList.remove('show', 'success', 'error'); // Sembunyikan dan reset kelas
        responseMessage.textContent = ''; // Kosongkan teks pesan
        whatsappButtonContainer.classList.remove('show'); // Hide WhatsApp button

        const form = event.target;
        const fileInput = form.querySelector('input[name="ssBukti"]');

        // --- INI URL WEB APP APPS SCRIPT ANDA ---
        const appScriptUrl = 'https://accouner.site/api/submit-form'; // <--- PASTIKAN INI URL YANG BENAR DAN TIDAK BERUBAH
        // ----------------------------------------

        try {
            const formData = new FormData(form);

            // Proses file menjadi Base64
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const reader = new FileReader();

                const base64Data = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(file); // Baca file sebagai Data URL (Base64 string)
                });

                formData.append('Screenshot Bukti Kepemilikan Account BA_base64', base64Data);
                formData.append('Screenshot Bukti Kepemilikan Account BA_filename', file.name);
                formData.delete('ssBukti'); // Hapus input file asli agar tidak dikirim dua kali
            } else {
                // Validasi: File screenshot wajib diunggah
                responseMessage.textContent = 'Gagal: File screenshot wajib diunggah.';
                responseMessage.classList.add('show', 'error');
                // Kembali ke kondisi awal tombol (tanpa loading)
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
                if (buttonContent) buttonContent.textContent = 'Daftar Sekarang';
                return; // Hentikan proses jika tidak ada file
            }

            // Kirim data ke Apps Script
            const response = await fetch(appScriptUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const result = await response.json();

            // 2. Tampilkan pesan berdasarkan respons dari Apps Script
            if (result.status === 'success') {
                responseMessage.textContent = 'Selamat, formulir Anda berhasil dikirim!';
                responseMessage.classList.add('show', 'success');
                form.reset(); // Mengosongkan semua input di formulir
                whatsappButtonContainer.classList.add('show'); // Show WhatsApp button on success

                // Pastikan tombol kembali normal
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
                if (buttonContent) buttonContent.textContent = 'Daftar Sekarang';

            } else {
                const errorMessage = result.message || 'Terjadi kesalahan tidak diketahui dari server.';
                responseMessage.textContent = 'Gagal: ' + errorMessage;
                responseMessage.classList.add('show', 'error');
                // Pastikan tombol kembali normal
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
                if (buttonContent) buttonContent.textContent = 'Daftar Sekarang';
            }

        } catch (error) {
            // 3. Tangani kesalahan jaringan atau JavaScript
            responseMessage.textContent = 'Terjadi kesalahan saat mengirim. Coba lagi: ' + error.message;
            responseMessage.classList.add('show', 'error');
            console.error('Error during form submission:', error);
            // Pastikan tombol kembali normal
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
            if (buttonContent) buttonContent.textContent = 'Daftar Sekarang';
        }
    });
});
