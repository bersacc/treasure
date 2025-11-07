document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('resellerForm');
    if (!form) {
        console.error("Elemen formulir dengan ID 'resellerForm' tidak ditemukan. JavaScript tidak akan berjalan.");
        return; 
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // 1. Tentukan URL Proxy Cloudflare Anda
        const appScriptUrl = 'https://treasuress.pages.dev/api'; 

        const formData = new FormData(form);
        const fileInput = document.getElementById('screenshotFile'); 
        const submitButton = document.getElementById('submitButton'); 
        const messageContainer = document.getElementById('message');

        // Tambahkan cek keamanan untuk elemen opsional
        if (messageContainer) {
            messageContainer.innerHTML = 'Memproses pendaftaran... Mohon tunggu.';
            messageContainer.className = 'loading';
        }
        if (submitButton) {
            submitButton.disabled = true;
        }

        // Validasi file
        if (!fileInput || fileInput.files.length === 0) {
            if (messageContainer) {
                messageContainer.innerHTML = 'Gagal: File screenshot wajib diunggah.';
                messageContainer.className = 'error';
            }
            if (submitButton) {
                submitButton.disabled = false;
            }
            return;
        }

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onloadend = function() {
            const base64Data = reader.result; 

            // Siapkan objek data untuk dikirim sebagai JSON
            const object = {};
            formData.forEach((value, key) => {
                // Abaikan input file asli
                if (key !== fileInput.name) { 
                    object[key] = value;
                }
            });
            
            // Tambahkan Base64 dan Nama File ke objek data
            object['Screenshot Bukti Kepemilikan Account BA_base64'] = base64Data;
            object['Screenshot Bukti Kepemilikan Account BA_filename'] = file.name; 

            // Kirim data ke Cloudflare Proxy
            fetch(appScriptUrl, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(object),
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.text().then(text => {
                        throw new Error(text);
                    });
                }
            })
            .then(data => {
                if (messageContainer) {
                    if (data.status === 'success') {
                        messageContainer.innerHTML = `Sukses: ${data.message}`;
                        messageContainer.className = 'success';
                        form.reset(); 
                    } else {
                        messageContainer.innerHTML = `Gagal: ${data.message || 'Terjadi error di server Apps Script.'}`;
                        messageContainer.className = 'error';
                    }
                }
            })
            .catch(error => {
                if (messageContainer) {
                    let errorMessage = error.message.substring(0, 100); 
                    
                    if (errorMessage.startsWith('<!DOCTYPE')) {
                        messageContainer.innerHTML = `Gagal: Unexpected token '<', "<!DOCTYPE "... is not valid JSON. (Periksa Otorisasi Apps Script)`;
                    } else {
                         messageContainer.innerHTML = `Gagal: ${errorMessage}`;
                    }
                    messageContainer.className = 'error';
                }
            })
            .finally(() => {
                if (submitButton) {
                    submitButton.disabled = false;
                }
            });
        };

        reader.readAsDataURL(file);
    });
});
