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

    // ➡️ URL CLOUDFLARE PAGES FUNCTION (PROXY) YANG SUDAH DISESUAIKAN
    const appScriptUrl = 'https://treasuress.pages.dev/api'; 
    // -----------------------------------------------------------------------

    registrationForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Mencegah pengiriman formulir default (reload halaman)

        // 1. **Mulai Efek Loading pada Tombol & Sembunyikan Pesan Lama**
        submitButton.disabled = true; 
        submitButton.classList.add('loading'); 
        if (buttonContent) buttonContent.textContent = 'Mengirim...'; 
        responseMessage.classList.remove('show', 'success', 'error'); 
        responseMessage.textContent = ''; 
        whatsappButtonContainer.classList.remove('show'); 
        
        // Sembunyikan spinner loading saat proses awal 
        const loadingSpinner = submitButton.querySelector('.loading-spinner');
        if (loadingSpinner) loadingSpinner.style.display = 'block';

        const form = event.target;
        const fileInput = form.querySelector('input[name="ssBukti"]');

        try {
            const formData = new FormData(form);
            let isFileAttached = false;

            // Proses file menjadi Base64
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                isFileAttached = true;

                const base64Data = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(file); 
                });

                // Menambahkan Base64 dan nama file ke FormData
                // Nama field disesuaikan dengan Apps Script: field_name + _base64
                formData.append('Screenshot Bukti Kepemilikan Account BA_base64', base64Data);
                formData.append('Screenshot Bukti Kepemilikan Account BA_filename', file.name);
                
                // Hapus input file asli (ini penting agar tidak ada konflik di Apps Script)
                formData.delete('ssBukti'); 
            } else {
                isFileAttached = false;
            }

            // Validasi: File screenshot wajib diunggah
            if (!isFileAttached) {
                throw new Error('File screenshot wajib diunggah. Silakan pilih file.');
            }
            
            // Kirim data ke Apps Script via Proxy
            const response = await fetch(appScriptUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorText = await response.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    errorText = errorJson.message || errorJson.error || `HTTP error! status: ${response.status}`;
                } catch (e) {
                    errorText = `HTTP error! status: ${response.status}. Pesan server: ${errorText.substring(0, 100)}...`;
                }
                throw new Error(errorText);
            }

            const result = await response.json();

            // 2. Tampilkan pesan berdasarkan respons dari Apps Script
            if (result.status === 'success') {
                responseMessage.textContent = 'Selamat, formulir Anda berhasil dikirim! Silakan gabung grup WhatsApp.';
                responseMessage.classList.add('show', 'success');
                form.reset(); 
                whatsappButtonContainer.classList.add('show'); 
            } else {
                const errorMessage = result.message || 'Terjadi kesalahan tidak diketahui dari server Apps Script.';
                throw new Error(errorMessage);
            }

        } catch (error) {
            // 3. Tangani semua kesalahan 
            responseMessage.textContent = 'Gagal: ' + error.message;
            responseMessage.classList.add('show', 'error');
            console.error('Error during form submission:', error);
        } finally {
            // 4. Kembali ke kondisi awal tombol
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
            if (buttonContent) buttonContent.textContent = 'Daftar Sekarang';
             // Sembunyikan spinner loading saat selesai
            const loadingSpinner = submitButton.querySelector('.loading-spinner');
            if (loadingSpinner) loadingSpinner.style.display = 'none';
        }
    });


    // Fungsi untuk memainkan suara saat hover
    function playSound() {
        const sound = document.getElementById("hoverSound");
        if (sound) {
            // Menambahkan check untuk memastikan audio dimuat
            if (sound.readyState >= 2) { 
                sound.currentTime = 0;
                sound.play().catch(e => console.warn("Audio play failed (maybe user hasn't interacted):", e));
            } else {
                // Jika belum dimuat, coba muat ulang atau abaikan
                console.warn("Audio file not yet ready.");
            }
        }
    }

    // Pasang listener untuk playSound pada semua elemen <li>
    document.querySelectorAll('li[onmouseover="playSound()"]').forEach(li => {
        li.removeEventListener('mouseover', playSound); // Hapus listener dari HTML
        li.addEventListener('mouseover', playSound); // Pasang listener di JS
    });
    
    // Fungsi untuk mengaktifkan/nonaktifkan dropdown formulir
    function toggleRegistrationForm() {
        const section = document.querySelector('.registration-section');
        const content = document.querySelector('.registration-form-content');

        const isOpen = content.classList.contains('active');
        
        // Toggle class 'active'
        section.classList.toggle('active');
        content.classList.toggle('active');

        // Sembunyikan pesan respons dan tombol WhatsApp saat formulir ditutup/dibuka
        const responseMessage = document.getElementById('responseMessage');
        const whatsappButtonContainer = document.getElementById('whatsappButtonContainer');

        // Sembunyikan pesan dan tombol jika formulir ditutup
        if (isOpen) {
             if (responseMessage) {
                responseMessage.classList.remove('show', 'success', 'error');
                responseMessage.textContent = '';
            }
            if (whatsappButtonContainer) {
                whatsappButtonContainer.classList.remove('show');
            }
        }

        playSound();
    }
    
    // Pasang listener untuk judul formulir
    const regFormTitle = document.querySelector('.registration-section h2');
    if (regFormTitle) {
        regFormTitle.addEventListener('click', toggleRegistrationForm);
        regFormTitle.addEventListener('mouseover', playSound);
    }
    
});
