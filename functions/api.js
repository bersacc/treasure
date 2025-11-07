export default {
  async fetch(request) {
    if (request.method === "POST") {
      try {
        const formData = await request.formData();
        const response = await fetch("https://script.google.com/macros/s/AKfycbx1234567890/exec", {
          method: "POST",
          body: formData,
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : { status: "error", message: "No response" };
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ status: "error", message: err.message }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Invalid request", { status: 400 });
  },
};
