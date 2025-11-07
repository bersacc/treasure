/**
 * Cloudflare Pages Function (Proxy) untuk meneruskan permintaan formulir ke Google Apps Script.
 * Mengambil URL Apps Script dari Environment Variable/Secret bernama API_URL.
 */
export async function onRequest(context) {
    // Ambil URL Apps Script dari Cloudflare Secret
    const apiUrl = context.env.API_URL; 

    // Cek metode request. Hanya izinkan POST.
    if (context.request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    // Pastikan URL Apps Script ada
    if (!apiUrl) {
         return new Response(JSON.stringify({
            status: 'error',
            message: 'Konfigurasi Proxy Gagal: Variabel API_URL tidak ditemukan.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // 1. Baca body dari frontend sebagai JSON (karena script.js mengirim JSON)
        const requestBody = await context.request.json(); 

        // 2. Teruskan request ke Apps Script
        const response = await fetch(apiUrl, {
            method: 'POST',
            // PENTING: Header Content-Type harus diatur agar Apps Script dapat memproses data JSON
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody), // Meneruskan body sebagai string JSON
        });

        // 3. Mengembalikan respons (JSON/Error) dari Apps Script kembali ke frontend
        return response;

    } catch (error) {
        // Log error di log Cloudflare (jika request.json() gagal, dll.)
        console.error('Proxy Error:', error.message);
        
        // Kembalikan respons error JSON agar script.js tidak menampilkan error <!DOCTYPE
        return new Response(JSON.stringify({
            status: 'error',
            message: 'Gagal memproses request di proxy (Error: ' + error.message + ')'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
