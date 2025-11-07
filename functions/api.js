// File: /functions/api.js

export async function onRequest(context) {
  const { request, env } = context;

  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Hanya izinkan POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  // Ambil URL Apps Script dari environment (lebih aman)
  const APPS_SCRIPT_URL = env.APPS_SCRIPT_URL;
  if (!APPS_SCRIPT_URL) {
    return new Response('Missing APPS_SCRIPT_URL environment variable', {
      status: 500,
      headers: CORS_HEADERS,
    });
  }

  try {
    // Teruskan request ke Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: request.body,
      headers: {
        'Content-Type': request.headers.get('Content-Type') || 'application/x-www-form-urlencoded',
      },
    });

    const text = await response.text();

    return new Response(text, {
      status: response.status,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy error', message: String(err) }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}
