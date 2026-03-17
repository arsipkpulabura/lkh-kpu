export async function onRequest(context) {
  const { request, params, env } = context;
  const api = params.api;
  const gasUrl = env.GAS_WEBAPP_URL;

  if (!gasUrl) {
    return json({ ok: false, message: 'Env GAS_WEBAPP_URL belum diisi di Cloudflare Pages.' }, 500);
  }

  try {
    const body = request.method === 'GET'
      ? { token: '', payload: {} }
      : await request.json().catch(() => ({ token: '', payload: {} }));

    const upstreamRes = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api,
        token: body?.token || '',
        payload: body?.payload || {}
      })
    });

    const text = await upstreamRes.text();
    return new Response(text, {
      status: upstreamRes.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    return json({ ok: false, message: String(err?.message || err) }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}
