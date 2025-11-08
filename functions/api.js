export default {
  async fetch(request, env) {
    if (request.method === 'POST') {
      try {
        const body = await request.text();
        const payload = JSON.parse(body);

        const res = await fetch(env.APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const text = await res.text();

        // Pastikan responsnya JSON valid
        try {
          const json = JSON.parse(text);
          return new Response(JSON.stringify(json), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch {
          // Jika bukan JSON (misal HTML error), tampilkan isi mentah untuk debugging
          return new Response(
            JSON.stringify({ status: 'error', message: 'Respon bukan JSON valid', raw: text }),
            { headers: { 'Content-Type': 'application/json' }, status: 500 }
          );
        }

      } catch (err) {
        return new Response(
          JSON.stringify({ status: 'error', message: err.message }),
          { headers: { 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }

    return new Response('Invalid request', { status: 400 });
  }
};
