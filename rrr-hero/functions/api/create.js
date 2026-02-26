export async function onRequestPost(context) {
  const { env, request } = context;
  const formData = await request.formData();
  const gameId = formData.get('id').toLowerCase().replace(/\s/g, '');

  // 1. Check if name exists
  const existing = await env.DB.prepare("SELECT id FROM games WHERE id = ?").bind(gameId).first();
  if (existing) return new Response("Name taken", { status: 400 });

  // 2. Upload files to R2
  let config = { id: gameId };
  const files = ['bird', 'pipe', 'gif', 'tap', 'hit', 'bgm', 'voice'];

  for (const key of files) {
    const file = formData.get(key);
    if (file && file.size > 0) {
      const fileName = `${gameId}/${key}-${Date.now()}`;
      await env.R2.put(fileName, file);
      // REPLACE THE URL BELOW WITH YOUR R2 PUBLIC URL
      config[key] = `https://YOUR_R2_PUBLIC_URL_HERE/${fileName}`;
    }
  }

  // 3. Save to D1
  await env.DB.prepare("INSERT INTO games (id, config) VALUES (?, ?)")
    .bind(gameId, JSON.stringify(config))
    .run();

  return new Response(JSON.stringify({ success: true, id: gameId }), {
    headers: { "Content-Type": "application/json" }
  });
}