const form = document.getElementById('registrationForm');
const submitButton = document.getElementById('submit-btn');
const messageContainer = document.getElementById('message-container');
const workerUrl = form.action;

// Fungsi konversi File menjadi Base64 String
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// Fungsi pembuat Link Akun Otomatis
const createSocialLink = (platform, username) => {
    if (!username) {
        return 'Username Kosong';
    }
    const cleanUsername = username.replace('@', '');
    switch (platform) {
        case 'Twitter':
            return 'https://twitter.com/' + cleanUsername;
        case 'Instagram':
            return 'https://instagram.com/' + cleanUsername;
        case 'TikTok':
            return 'https://tiktok.com/@' + cleanUsername;
        case 'Lainnya':
            return 'Platform Lain: ' + cleanUsername;
        default:
            return 'Link Gagal';
    }
};

form.addEventListener('submit', async function(e) {
    e.preventDefault(); 

    submitButton.disabled = true;
    submitButton.textContent = 'Memproses... Harap Tunggu';
    messageContainer.innerHTML = ''; 

    const data = new FormData(form);
    const fileInput = document.getElementById('screenshot');
    const file = fileInput.files[0];
    
    if (!file) {
         messageContainer.innerHTML = '<div class="message error">❌ File bukti belum dipilih.</div>';
         submitButton.disabled = false;
         submitButton.textContent = 'Kirim Pendaftaran';
         return;
    }

    let base64String = null;
    let mimeType = '';
    let fileName = '';

    try {
        // Konversi File ke Base64
        submitButton.textContent = 'Mengkonversi File (Base64)...';
        base64String = await toBase64(file);
        mimeType = file.type;
        fileName = file.name;
        
        // 1. Ambil data teks
        const platform = data.get('platform');
        const username = data.get('usernameBA');
        
        // 2. Buat objek data yang akan dikirim (JSON Payload)
        const payload = {
            nama: data.get('nama'),
            platform: platform,
            usernameBA: username,
            noWA: data.get('noWA'),
            linkAkun: createSocialLink(platform, username), 
            
            // Data file Base64
            base64File: base64String ? base64String.split(',')[1] : '', 
            mimeType: mimeType,
            fileName: fileName
        };

        submitButton.textContent = 'Mengirim Data...';
        
        // 3. Kirim data ke Worker menggunakan Fetch dengan body JSON
        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();

        if (!response.ok) {
            throw new Error(`Worker merespons status ${response.status}: ${result.message || 'Error Server Tidak Diketahui'}`);
        }

        if (result.status === 'success') {
            messageContainer.innerHTML = '<div class="message success">✅ Pendaftaran Berhasil! Data dan File Anda sudah tersimpan.</div>';
            form.reset(); 
        } else {
            messageContainer.innerHTML = `<div class="message error">❌ Pendaftaran Gagal (Apps Script Error): ${result.message}</div>`;
        }

    } catch (error) {
        messageContainer.innerHTML = `<div class="message error">🚨 Terjadi kesalahan koneksi atau server: ${error.message}</div>`;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Kirim Pendaftaran';
    }
});
