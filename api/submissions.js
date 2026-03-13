// Vercel Serverless Function - 代理飞书 API
// 获取多维表格数据

const APP_ID = 'cli_a93e92c4ccb8dbdf';
const APP_SECRET = 'on3bHmvthLQauzD62aibicDhElRdRcZj';
const APP_TOKEN = 'OjVPbkXWYaCBaWszTiwcKB5en9c';
const TABLE_ID = 'tblFRlmuaKx1isMh';

// 获取 tenant_access_token
async function getAccessToken() {
  const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET })
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(data.msg);
  return data.tenant_access_token;
}

// 获取多维表格记录
async function getRecords(token) {
  const res = await fetch(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/records?page_size=500`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  const data = await res.json();
  if (data.code !== 0) throw new Error(data.msg);
  return data.data.items;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const token = await getAccessToken();
    const records = await getRecords(token);
    
    // 转换数据格式
    const submissions = records.map(record => ({
      id: record.record_id,
      company: record.fields['公司'],
      group: record.fields['分组'],
      layers: {
        strategy: { vote: record.fields['战略选择'], note: record.fields['战略讨论'] },
        org: { vote: record.fields['组织进化'], note: record.fields['组织讨论'] },
        culture: { vote: record.fields['文化土壤'], note: record.fields['文化讨论'] },
        tech: { vote: record.fields['技术底座'], note: record.fields['技术讨论'] },
        risk: { vote: record.fields['风险对冲'], note: record.fields['风险讨论'] }
      }
    }));
    
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
