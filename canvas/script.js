// 五维画布数据存储
const CanvasData = {
  storageKey: 'nc-canvas-data',
  
  // 获取所有数据
  getAll() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  },
  
  // 保存数据
  save(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  },
  
  // 添加一条记录
  add(record) {
    const data = this.getAll();
    data.push({
      ...record,
      timestamp: Date.now()
    });
    this.save(data);
    this.notifyUpdate();
  },
  
  // 清空数据
  clear() {
    localStorage.removeItem(this.storageKey);
    this.notifyUpdate();
  },
  
  // 按小组筛选
  getByGroup(group) {
    const data = this.getAll();
    if (group === 'all') return data;
    return data.filter(item => item.group === group);
  },
  
  // 获取统计
  getStats() {
    const data = this.getAll();
    return {
      total: data.length,
      group1: data.filter(d => d.group === 'group1').length,
      group2: data.filter(d => d.group === 'group2').length,
      online: data.filter(d => d.group === 'online').length
    };
  },
  
  // 通知更新（用于跨标签页同步）
  notifyUpdate() {
    if (window.BroadcastChannel) {
      const channel = new BroadcastChannel('nc-canvas-channel');
      channel.postMessage({ type: 'update' });
    }
  }
};

// 层级配置
const LAYERS = [
  {
    id: 'strategy',
    name: '战略选择层',
    question: '我们要用AI解决什么级别的生存问题？',
    options: [
      { id: 'cost', name: '成本优化', desc: '(活下去)' },
      { id: 'efficiency', name: '效率提升', desc: '(跑更快)' },
      { id: 'innovation', name: '模式创新', desc: '(换赛道)' }
    ]
  },
  {
    id: 'org',
    name: '组织进化层',
    question: '我们的"人+AI"作战单元怎么设计？',
    options: [
      { id: 'role', name: '岗位重构', desc: '(谁+AI干活)' },
      { id: 'process', name: '流程再造', desc: '(AI管什么)' },
      { id: 'decision', name: '决策上移', desc: '(人做什么)' }
    ]
  },
  {
    id: 'culture',
    name: '文化土壤层',
    question: '怎么让员工从"怕AI"变成"用AI"？',
    options: [
      { id: 'fear', name: '恐惧消除', desc: '(安全感)' },
      { id: 'capability', name: '能力重塑', desc: '(培训体系)' },
      { id: 'incentive', name: '激励机制', desc: '(AI绩效)' }
    ]
  },
  {
    id: 'tech',
    name: '技术底座层',
    question: '我们的AI基建是自建、采购还是混合？',
    options: [
      { id: 'private', name: '私有化部署', desc: '(安全优先)' },
      { id: 'saas', name: 'SaaS工具', desc: '(速度优先)' },
      { id: 'hybrid', name: '混合架构', desc: '(平衡方案)' }
    ]
  },
  {
    id: 'risk',
    name: '风险对冲层',
    question: 'AI翻车的时候，我们怎么兜底？',
    options: [
      { id: 'review', name: '人机复核', desc: '(关键节点)' },
      { id: 'circuit', name: '熔断机制', desc: '(异常阈值)' },
      { id: 'fallback', name: '回退方案', desc: '(Plan B)' }
    ]
  }
];

// 小组名称映射
const GROUP_NAMES = {
  group1: '第一组',
  group2: '第二组',
  online: '线上组'
};

// 如果是大屏展示页，初始化展示逻辑
if (document.querySelector('.display-page')) {
  class DisplayManager {
    constructor() {
      this.currentFilter = 'all';
      this.init();
    }
    
    init() {
      this.setSubmitUrl();
      this.bindEvents();
      this.listenUpdates();
      this.render();
    }
    
    setSubmitUrl() {
      // 显示完整的提交页面URL
      const submitUrl = document.getElementById('submit-url');
      const qrImage = document.getElementById('qr-image');
      
      if (submitUrl && qrImage) {
        const url = window.location.href.replace('index.html', 'submit.html').replace(/\/$/, '/submit.html');
        submitUrl.textContent = url;
        
        // 使用免费二维码API生成二维码
        qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`;
      }
    }
    
    bindEvents() {
      // 小组筛选
      document.querySelectorAll('.group-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.group-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.currentFilter = tab.dataset.group;
          this.render();
        });
      });
    }
    
    // 监听跨标签页更新
    listenUpdates() {
      if (window.BroadcastChannel) {
        const channel = new BroadcastChannel('nc-canvas-channel');
        channel.onmessage = () => {
          this.render();
        };
      }
      
      // 同时也定时刷新（备用方案）
      setInterval(() => this.render(), 3000);
    }
    
    render() {
      const data = CanvasData.getByGroup(this.currentFilter);
      
      // 更新统计
      const stats = CanvasData.getStats();
      document.getElementById('submit-count').textContent = stats.total;
      document.getElementById('group1-count').textContent = stats.group1;
      document.getElementById('group2-count').textContent = stats.group2;
      document.getElementById('online-count').textContent = stats.online;
      
      // 渲染每层的数据
      LAYERS.forEach(layer => {
        this.renderLayer(layer, data);
      });
    }
    
    renderLayer(layer, data) {
      // 渲染选项投票
      layer.options.forEach(option => {
        const container = document.getElementById(`${layer.id}-${option.id}`);
        if (!container) return;
        
        container.innerHTML = '';
        
        data.forEach(item => {
          if (item.layers && item.layers[layer.id] === option.id) {
            const tag = document.createElement('span');
            tag.className = `vote-tag ${item.group}`;
            tag.textContent = item.company;
            container.appendChild(tag);
          }
        });
      });
      
      // 渲染讨论要点
      const discussionContainer = document.getElementById(`${layer.id}-discussion`);
      if (!discussionContainer) return;
      
      discussionContainer.innerHTML = '';
      
      data.forEach(item => {
        if (item.discussions && item.discussions[layer.id]) {
          const div = document.createElement('div');
          div.className = 'discussion-item';
          div.innerHTML = `
            <div class="company">${item.company}</div>
            <div>${item.discussions[layer.id]}</div>
          `;
          discussionContainer.appendChild(div);
        }
      });
    }
  }
  
  new DisplayManager();
}
