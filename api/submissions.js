// Vercel Serverless Function - 代理飞书 API
// 获取多维表格数据

const APP_ID = 'cli_a93e92c4ccb8dbdf';
const APP_SECRET = 'on3bHmvthLQauzD62aibicDhElRdRcZj';
const APP_TOKEN = 'OjVPbkXWYaCBaWszTiwcKB5en9c';
const TABLE_ID = 'tblFRlmuaKx1isMh';

// 中文到英文的映射
const VOTE_MAP = {
  // 战略选择
  '成本优化': 'cost',
  '效率提升': 'efficiency',
  '模式创新': 'innovation',
  // 组织进化
  '岗位重构': 'role',
  '流程再造': 'process',
  '决策上移': 'decision',
  // 文化土壤
  '恐惧消除': 'fear',
  '能力重塑': 'capability',
  '激励机制': 'incentive',
  // 技术底座
  '私有化部署': 'private',
  'SaaS工具': 'saas',
  '混合架构': 'hybrid',
  // 风险对冲
  '人机复核': 'review',
  '熔断机制': 'circuit',
  '回退方案': 'fallback'
};

const GROUP_MAP = {
  '第一组': 'group1',
  '第二组': 'group2',
  '线上组': 'online'
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
    
    // 转换数据格式（过滤掉空记录，转换中文到英文）
    const submissions = records
      .filter(record => record.fields['公司'] && record.fields['分组'])
      .map(record => ({
        id: record.record_id,
        company: record.fields['公司'],
        group: GROUP_MAP[record.fields['分组']] || record.fields['分组'],
        layers: {
          strategy: { 
            vote: VOTE_MAP[record.fields['战略选择']], 
            note: record.fields['战略讨论'] 
          },
          org: { 
            vote: VOTE_MAP[record.fields['组织进化']], 
            note: record.fields['组织讨论'] 
          },
          culture: { 
            vote: VOTE_MAP[record.fields['文化土壤']], 
            note: record.fields['文化讨论'] 
          },
          tech: { 
            vote: VOTE_MAP[record.fields['技术底座']], 
            note: record.fields['技术讨论'] 
          },
          risk: { 
            vote: VOTE_MAP[record.fields['风险对冲']], 
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
