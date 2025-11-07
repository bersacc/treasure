// File: functions/api/submit-form.js
// Cloudflare Pages Function (Proxy)

export async function onRequest(context) {
  // context.request adalah Request object yang datang dari browser
  const clientRequest = context.request;
  
  // PENTING: URL rahasia Apps Script (Web App) akan diambil dari Environment Variable
  const apiUrl = context.env.API_URL; 

  // 1. Validasi Metode HTTP
  if (clientRequest.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Hanya metode POST yang diizinkan." }), {
        status: 405,
        headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
  }
  
  // 2. Cek apakah API_URL sudah disetel
  if (!apiUrl) {
       return new Response(JSON.stringify({ error: "API_URL belum dikonfigurasi di Variabel Lingkungan Cloudflare." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    // 3. Meneruskan request POST (beserta body formData) ke Apps Script
    const res = await fetch(apiUrl, {
      method: 'POST', 
      headers: clientRequest.headers, // Teruskan header (Content-Type dll.)
      body: clientRequest.body,       // Teruskan body (FormData yang berisi Base64)
      redirect: 'follow',
    });
    
    // 4. Meneruskan Respons (JSON) dari Apps Script kembali ke browser
    const responseText = await res.text();

    return new Response(responseText, {
      status: res.status, 
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (err) {
    console.error("Fetch failed:", err);
    return new Response(JSON.stringify({ error: "Gagal memproses pendaftaran. Error Proxy Internal." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
