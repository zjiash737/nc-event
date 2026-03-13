/* ========================================
   Main Event Page - Scene Manager
   Version: 1.0.1
   ======================================== */

class SceneManager {
  constructor() {
    this.scenes = document.querySelectorAll('.scene');
    this.currentScene = 0;
    this.totalScenes = this.scenes.length;
    this.broadcastChannel = null;
    this.submissions = [];
    
    this.init();
  }
  
  init() {
    this.updateNavButtons();
    this.bindEvents();
    this.initBroadcastChannel();
    this.loadSubmissions();
    this.showScene(0);
  }
  
  bindEvents() {
    document.getElementById('prevBtn').addEventListener('click', () => this.prevScene());
    document.getElementById('nextBtn').addEventListener('click', () => this.nextScene());
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        this.nextScene();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prevScene();
      }
    });
    
    // 五维画布小组筛选
    document.querySelectorAll('.group-tabs .tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.group-tabs .tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.filterByGroup(e.target.dataset.group);
      });
    });
  }
  
  showScene(index) {
    // 隐藏所有场景
    this.scenes.forEach(scene => scene.classList.remove('active'));
    
    // 显示当前场景
    this.scenes[index].classList.add('active');
    this.currentScene = index;
    
    // 更新导航
    this.updateNavButtons();
    document.getElementById('currentScene').textContent = index + 1;
    
    // 五维画布场景特殊处理
    if (index === 6) { // 场景7是五维画布
      this.renderCanvas();
    }
  }
  
  nextScene() {
    if (this.currentScene < this.totalScenes - 1) {
      this.showScene(this.currentScene + 1);
    }
  }
  
  prevScene() {
    if (this.currentScene > 0) {
      this.showScene(this.currentScene - 1);
    }
  }
  
  updateNavButtons() {
    document.getElementById('prevBtn').disabled = this.currentScene === 0;
    document.getElementById('nextBtn').disabled = this.currentScene === this.totalScenes - 1;
  }
  
  // ========================================
  // 五维画布功能
  // ========================================
  
  initBroadcastChannel() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('nc-canvas-channel');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data.type === 'new-submission') {
          this.addSubmission(event.data.data);
        }
      };
    }
  }
  
  loadSubmissions() {
    const stored = localStorage.getItem('nc-canvas-submissions');
    if (stored) {
      this.submissions = JSON.parse(stored);
    }
  }
  
  saveSubmissions() {
    localStorage.setItem('nc-canvas-submissions', JSON.stringify(this.submissions));
  }
  
  addSubmission(data) {
    this.submissions.push(data);
    this.saveSubmissions();
    this.renderCanvas();
  }
  
  filterByGroup(group) {
    this.currentFilter = group;
    this.renderCanvas();
  }
  
  renderCanvas() {
    const filter = this.currentFilter || 'all';
    const filtered = filter === 'all' 
      ? this.submissions 
      : this.submissions.filter(s => s.group === filter);
    
    // 清空所有投票和讨论
    document.querySelectorAll('.option-votes').forEach(el => el.innerHTML = '');
    document.querySelectorAll('.discussion-list').forEach(el => el.innerHTML = '');
    
    // 统计各组提交数
    const counts = {
      all: this.submissions.length,
      group1: this.submissions.filter(s => s.group === 'group1').length,
      group2: this.submissions.filter(s => s.group === 'group2').length,
      online: this.submissions.filter(s => s.group === 'online').length
    };
    
    document.getElementById('submit-count').textContent = counts.all;
    document.getElementById('group1-count').textContent = counts.group1;
    document.getElementById('group2-count').textContent = counts.group2;
    document.getElementById('online-count').textContent = counts.online;
    
    // 渲染每层的数据
    const layers = ['strategy', 'org', 'culture', 'tech', 'risk'];
    
    layers.forEach(layer => {
      // 统计该层的投票
      const votesByGroup = {};
      filtered.forEach(sub => {
        const vote = sub.layers?.[layer]?.vote;
        const group = sub.group;
        if (vote) {
          const key = `${vote}-${group}`;
          votesByGroup[key] = (votesByGroup[key] || 0) + 1;
        }
      });
      
      // 渲染投票标签
      Object.entries(votesByGroup).forEach(([key, count]) => {
        const [option, group] = key.split('-');
        const votesEl = document.querySelector(`.canvas-layer[data-layer="${layer}"] .option[data-option="${option}"] .option-votes`);
        if (votesEl) {
          for (let i = 0; i < count; i++) {
            const tag = document.createElement('span');
            tag.className = `vote-tag ${group}`;
            tag.textContent = '•';
            votesEl.appendChild(tag);
          }
        }
      });
      
      // 渲染讨论要点
      const listEl = document.querySelector(`.canvas-layer[data-layer="${layer}"] .discussion-list`);
      if (listEl) {
        filtered.forEach(sub => {
          const note = sub.layers?.[layer]?.note;
          if (note) {
            const item = document.createElement('div');
            item.className = 'discussion-item';
            item.innerHTML = `
              <div class="company">${sub.company}</div>
              <div>${note}</div>
            `;
            listEl.appendChild(item);
          }
        });
      }
    });
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new SceneManager();
});
