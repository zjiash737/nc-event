// Vercel Serverless Function - 提交数据到飞书多维表格

const APP_ID = 'cli_a93e92c4ccb8dbdf';
const APP_SECRET = 'EYMmWDh97hfyJPuOF7OuxhsaVpsIMh72';
const APP_TOKEN = 'OjVPbkXWYaCBaWszTiwcKB5en9c';
const TABLE_ID = 'tblFRlmuaKx1isMh';

// 英文到中文的映射
const VOTE_MAP = {
  'cost': '成本优化',
  'efficiency': '效率提升',
  'innovation': '模式创新',
  'role': '岗位重构',
  'process': '流程再造',
  'decision': '决策上移',
  'fear': '恐惧消除',
  'capability': '能力重塑',
  'incentive': '激励机制',
  'private': '私有化部署',
  'saas': 'SaaS工具',
  'hybrid': '混合架构',
  'review': '人机复核',
  'circuit': '熔断机制',
  'fallback': '回退方案'
};

const GROUP_MAP = {
  'group1': '第一组',
  'group2': '第二组',
  'online': '线上组'
};

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

// 创建记录
async function createRecord(token, fields) {
  const res = await fetch(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/records`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ fields })
    }
  );
  const data = await res.json();
  if (data.code !== 0) throw new Error(data.msg);
  return data.data;
}

// 获取记录
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const token = await getAccessToken();
    
    // POST: 提交数据
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      const fields = {
        '公司': body.company,
        '分组': GROUP_MAP[body.group_name] || body.group_name,
        '战略选择': VOTE_MAP[body.layers?.strategy?.vote] || body.layers?.strategy?.vote,
        '战略讨论': body.layers?.strategy?.note || '',
        '组织进化': VOTE_MAP[body.layers?.org?.vote] || body.layers?.org?.vote,
        '组织讨论': body.layers?.org?.note || '',
        '文化土壤': VOTE_MAP[body.layers?.culture?.vote] || body.layers?.culture?.vote,
        '文化讨论': body.layers?.culture?.note || '',
        '技术底座': VOTE_MAP[body.layers?.tech?.vote] || body.layers?.tech?.vote,
        '技术讨论': body.layers?.tech?.note || '',
        '风险对冲': VOTE_MAP[body.layers?.risk?.vote] || body.layers?.risk?.vote,
        '风险讨论': body.layers?.risk?.note || ''
      };
      
      await createRecord(token, fields);
      
      res.status(200).json({ success: true, message: '提交成功' });
      return;
    }
    
    // GET: 获取数据
    const records = await getRecords(token);
    
    // 转换数据格式
    const REVERSE_VOTE_MAP = Object.fromEntries(Object.entries(VOTE_MAP).map(([k, v]) => [v, k]));
    const REVERSE_GROUP_MAP = Object.fromEntries(Object.entries(GROUP_MAP).map(([k, v]) => [v, k]));
    
    const submissions = records
      .filter(record => record.fields['公司'] && record.fields['分组'])
      .map(record => ({
        id: record.record_id,
        company: record.fields['公司'],
        group: REVERSE_GROUP_MAP[record.fields['分组']] || record.fields['分组'],
        layers: {
          strategy: { 
            vote: REVERSE_VOTE_MAP[record.fields['战略选择']], 
            note: record.fields['战略讨论'] 
          },
          org: { 
            vote: REVERSE_VOTE_MAP[record.fields['组织进化']], 
            note: record.fields['组织讨论'] 
          },
          culture: { 
            vote: REVERSE_VOTE_MAP[record.fields['文化土壤']], 
            note: record.fields['文化讨论'] 
          },
          tech: { 
            vote: REVERSE_VOTE_MAP[record.fields['技术底座']], 
            note: record.fields['技术讨论'] 
          },
          risk: { 
            vote: REVERSE_VOTE_MAP[record.fields['风险对冲']], 
            note: record.fields['风险讨论'] 
          }
        }
      }));
    
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
