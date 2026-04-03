exports.handler = async function () {
  console.log('[bdfd-functions] 🔔 Fetching function list from BDFD API');

  try {
    const res = await fetch('https://botdesignerdiscord.com/public/api/function_list');

    if (!res.ok) {
      console.error(`[bdfd-functions] ❌ BDFD API returned HTTP ${res.status}`);
      return { statusCode: 502, body: JSON.stringify({ error: `BDFD API error: ${res.status}` }) };
    }

    const data = await res.json();
    console.log(`[bdfd-functions] ✅ Got ${data.length} functions`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error('[bdfd-functions] ❌ Fetch failed:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch BDFD function list' }) };
  }
};