document.getElementById('resellerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // 1. Tentukan URL Proxy Cloudflare Anda
    // Mengarahkan ke proxy Cloudflare, BUKAN ke URL Apps Script.
    const appScriptUrl = 'https://treasuress.pages.dev/api'; 

    const form = e.target;
    const formData = new FormData(form);
    const fileInput = document.getElementById('screenshotFile'); // ID INPUT FILE
    const submitButton = document.getElementById('submitButton'); // Asumsi ID tombol submit

    // Tampilkan pesan loading
    const messageContainer = document.getElementById('message');
    messageContainer.innerHTML = 'Memproses pendaftaran... Mohon tunggu.';
    messageContainer.className = 'loading';
    submitButton.disabled = true;

    // Validasi file
    if (fileInput.files.length === 0) {
        messageContainer.innerHTML = 'Gagal: File screenshot wajib diunggah.';
        messageContainer.className = 'error';
        submitButton.disabled = false;
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onloadend = function() {
        // Data Base64 file
        const base64Data = reader.result; 

        // 2. Tambahkan data Base64 dan NAMA FILE ke FormData
        // Penting: Nama field harus sama persis dengan yang dicari di Apps Script!
        // Apps Script mencari: 'Screenshot Bukti Kepemilikan Account BA_base64'
        const object = {};
        
        // Ambil semua field form kecuali file, karena file diubah menjadi Base64
        formData.forEach((value, key) => {
            // Kita hanya ingin field data teks (Nama, Nomor WA, dll.)
            if (key !== fileInput.name) { 
                object[key] = value;
            }
        });
        
        // Tambahkan Base64 dan Nama File ke objek data
        object['Screenshot Bukti Kepemilikan Account BA_base64'] = base64Data;
        object['Screenshot Bukti Kepemilikan Account BA_filename'] = file.name; // Penting untuk Apps Script

        // 3. Kirim data ke Cloudflare Proxy (yang meneruskan ke Apps Script)
        fetch(appScriptUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json', // Penting: Mengirim data sebagai JSON
            },
            body: JSON.stringify(object),
        })
        .then(response => {
            if (response.ok) {
                // Berhasil dihubungi, coba parsing JSON
                return response.json();
            } else {
                // Jika respons tidak OK, baca teks (kemungkinan HTML error)
                return response.text().then(text => {
                    throw new Error(text);
                });
            }
        })
        .then(data => {
            if (data.status === 'success') {
                messageContainer.innerHTML = `Sukses: ${data.message}`;
                messageContainer.className = 'success';
                form.reset(); 
            } else {
                messageContainer.innerHTML = `Gagal: ${data.message || 'Terjadi error di server Apps Script.'}`;
                messageContainer.className = 'error';
            }
        })
        .catch(error => {
            // Menangani error koneksi atau error parsing JSON/HTML
            let errorMessage = error.message.substring(0, 100); 
            
            if (errorMessage.startsWith('<!DOCTYPE')) {
                // Ini menunjukkan error HTML (masalah Izin Apps Script, Timeout, atau Proxy)
                messageContainer.innerHTML = `Gagal: Unexpected token '<', "<!DOCTYPE "... is not valid JSON. (Masalah Otorisasi/Koneksi)`;
            } else if (errorMessage.startsWith('SyntaxError')) {
                messageContainer.innerHTML = `Gagal: ${errorMessage.substring(0, 50)}... Respons dari server tidak valid.`;
            } else {
                 messageContainer.innerHTML = `Gagal: ${errorMessage}`;
            }
            messageContainer.className = 'error';
        })
        .finally(() => {
            submitButton.disabled = false;
        });
    };

    reader.readAsDataURL(file);
});
