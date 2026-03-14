// Vercel Serverless Function - 从 Supabase 获取提交数据

const SUPABASE_URL = 'https://cvehqlibhvreoyzkvmij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZWhxbGliaHZyZW95emt2bWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTU0MzUsImV4cCI6MjA4ODk3MTQzNX0.7A4Y2NY4-PcFIUZARGmue-ufbM74BZn_mlugcMBCE2s';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/submissions?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch from Supabase');
    }
    
    const records = await response.json();
    
    // 转换数据格式
    const submissions = records.map(record => ({
      id: record.id,
      company: record.company,
      group: record.group_name,
      layers: record.layers
    }));
    
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
