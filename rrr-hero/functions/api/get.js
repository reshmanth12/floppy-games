export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) return new Response("No ID", { status: 400 });

  const data = await env.DB.prepare("SELECT config FROM games WHERE id = ?").bind(id).first();
  if (!data) return new Response("Not found", { status: 404 });

  return new Response(data.config, {
    headers: { "Content-Type": "application/json" }
  });
}