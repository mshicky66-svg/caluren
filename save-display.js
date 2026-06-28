const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  try {
    // size guard: reject anything over ~5MB to protect storage
    if (event.body && event.body.length > 5000000) {
      return { statusCode: 413, body: JSON.stringify({ error: 'Too large' }) };
    }

    const data = JSON.parse(event.body);

    // shape check: must look like a real display setup, not junk
    if (!data || typeof data !== 'object' || !('m' in data)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid data' }) };
    }

    // server-side caps so a tampered request can't bloat storage
    if (Array.isArray(data.cp) && data.cp.length > 6) data.cp = data.cp.slice(0, 6);
    if (Array.isArray(data.k) && data.k.length > 12) data.k = data.k.slice(0, 12);

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data: row, error } = await supabase
      .from('displays')
      .insert({ data })
      .select('id')
      .single();
    if (error) throw error;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: row.id })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};