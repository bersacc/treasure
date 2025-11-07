// File: functions/api.js (Cloudflare Pages Function - Proxy)
// Fungsi ini merespons request ke /api

export async function onRequest(context) {
  const clientRequest = context.request;
  // URL Apps Script (Web App) diambil dari Environment Variable Cloudflare
  const apiUrl = context.env.API_URL; 

  // Menangani CORS pre-flight OPTIONS request dan validasi non-POST
  if (clientRequest.method !== 'POST') {
    // Header CORS standar yang dibutuhkan oleh browser
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Jika metode adalah OPTIONS (pre-flight check), kembalikan respons kosong 204
    if (clientRequest.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }

    // Jika metode lain selain POST atau OPTIONS
    return new Response(JSON.stringify({ error: "Hanya metode POST yang diizinkan." }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  // Cek jika API_URL (Apps Script) belum dikonfigurasi di Cloudflare
  if (!apiUrl) {
       return new Response(JSON.stringify({ error: "API_URL belum dikonfigurasi di Variabel Lingkungan Cloudflare." }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    // Meneruskan request POST (beserta body formData dan headers) ke Apps Script
    // Apps Script akan menerima ini sebagai event 'e' di fungsi doPost(e)
    const res = await fetch(apiUrl, {
      method: 'POST', 
      headers: clientRequest.headers, 
      body: clientRequest.body,       
      redirect: 'follow', // Mengikuti redirect jika Apps Script menggunakannya
    });
    
    // Meneruskan Respons (JSON) dari Apps Script kembali ke browser
    const responseText = await res.text();

    return new Response(responseText, {
      status: res.status, 
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        // Tambahkan header CORS untuk respons balik
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
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
