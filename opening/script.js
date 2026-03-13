// 企业数据
const companies = {
  shanghai: [
    { name: '云快充', ceo: 'Frank N Chen' },
    { name: '博云科技', ceo: '花磊' },
    { name: '零一汽车', ceo: '黄泽铧' },
    { name: '苏度科技', ceo: '韩铮' },
    { name: 'XREAL', ceo: '徐驰' },
    { name: '灵猴机器人', ceo: '董浩' },
    { name: '恩井智控', ceo: '连晓刚' },
    { name: '图达通', ceo: '鲍君威' }
  ],
  beijing: [
    { name: '车小多', ceo: '郑伟' },
    { name: '主线', ceo: '张天雷' },
    { name: '能链', ceo: '戴震、王阳' },
    { name: '车林子', ceo: '刘辉' },
    { name: '海微', ceo: '李林峰' },
    { name: '思特光学', ceo: '丁兵' }
  ]
};

// 场景管理
class SceneManager {
  constructor() {
    this.scenes = document.querySelectorAll('.scene');
    this.currentScene = 0;
    this.totalScenes = this.scenes.length;
    
    this.init();
  }
  
  init() {
    this.updateNavButtons();
    this.renderCompanies();
    this.bindEvents();
    this.showScene(0);
  }
  
  bindEvents() {
    document.getElementById('prevBtn').addEventListener('click', () => this.prevScene());
    document.getElementById('nextBtn').addEventListener('click', () => this.nextScene());
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        this.nextScene();
      } else if (e.key === 'ArrowLeft') {
        this.prevScene();
      }
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
    
    // 触发场景特定动画
    this.triggerSceneAnimations(index);
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
  
  triggerSceneAnimations(index) {
    switch(index) {
      case 1: // 数字场景
        this.animateNumbers();
        break;
      case 3: // 物种场景
        this.animateSpecies();
        break;
      case 4: // 企业场景
        this.animateCompanies();
        break;
    }
  }
  
  animateNumbers() {
    const cards = document.querySelectorAll('.number-card');
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.classList.add('show');
      }, i * 300);
    });
  }
  
  animateSpecies() {
    const cards = document.querySelectorAll('.species-card');
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.classList.add('show');
      }, i * 200);
    });
  }
  
  animateCompanies() {
    const cards = document.querySelectorAll('.company-card');
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.classList.add('show');
      }, i * 100);
    });
  }
  
  renderCompanies() {
    // 渲染上海企业
    const shanghaiContainer = document.getElementById('shanghai-companies');
    companies.shanghai.forEach(company => {
      shanghaiContainer.appendChild(this.createCompanyCard(company));
    });
    
    // 渲染北京企业
    const beijingContainer = document.getElementById('beijing-companies');
    companies.beijing.forEach(company => {
      beijingContainer.appendChild(this.createCompanyCard(company));
    });
  }
  
  createCompanyCard(company) {
    const card = document.createElement('div');
    card.className = 'company-card';
    card.innerHTML = `
      <div class="company-name">${company.name}</div>
      <div class="company-ceo">${company.ceo}</div>
    `;
    return card;
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new SceneManager();
});
