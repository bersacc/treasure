export async function onRequest(context) {
  const apiUrl = context.env.API_URL;

  try {
    const res = await fetch(apiUrl);
    const text = await res.text(); // Gunakan .text() jika output bukan JSON valid

    return new Response(text, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Gagal mengambil data" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
