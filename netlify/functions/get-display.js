const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  try {
    const id = event.queryStringParameters.id;
    if (!id) return { statusCode: 400, body: 'Missing id' };
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data: row, error } = await supabase
      .from('displays')
      .select('data')
      .eq('id', id)
      .single();
    if (error) throw error;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row.data)
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
