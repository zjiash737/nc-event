// 提交表单状态
let formData = {
  group: null,
  company: null,
  layers: {},
  discussions: {}
};

let currentLayerIndex = 0;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
});

// 绑定事件
function bindEvents() {
  // 公司选择
  document.getElementById('company-select').addEventListener('change', (e) => {
    formData.company = e.target.value;
    checkCanStart();
  });
  
  // 组别选择
  document.querySelectorAll('.group-btn-inline').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.group-btn-inline').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      formData.group = btn.dataset.group;
      checkCanStart();
    });
  });
}

// 检查是否可以开始
function checkCanStart() {
  const startBtn = document.getElementById('start-btn');
  startBtn.disabled = !(formData.company && formData.group);
}

// 步骤切换
function goToStep(stepId) {
  document.querySelectorAll('.step').forEach(step => {
    step.classList.add('hidden');
  });
  document.getElementById(`step-${stepId}`).classList.remove('hidden');
}

// 开始填写
function startSubmit() {
  if (!formData.company || !formData.group) {
    alert('请选择公司和组别');
    return;
  }
  
  // 显示用户信息
  document.getElementById('display-company').textContent = formData.company;
  const groupBadge = document.getElementById('display-group');
  groupBadge.textContent = GROUP_NAMES[formData.group];
  groupBadge.className = `group-badge ${formData.group}`;
  
  currentLayerIndex = 0;
  goToStep('content');
  renderLayer();
}

// 渲染当前层级
function renderLayer() {
  const layer = LAYERS[currentLayerIndex];
  
  // 更新进度
  const progress = ((currentLayerIndex + 1) / LAYERS.length) * 100;
  document.getElementById('progress-fill').style.width = `${progress}%`;
  document.getElementById('current-layer').textContent = currentLayerIndex + 1;
  
  // 更新按钮文字
  const nextBtn = document.getElementById('next-layer-btn');
  nextBtn.textContent = currentLayerIndex === LAYERS.length - 1 ? '提交' : '下一题';
  
  const prevBtn = document.getElementById('prev-layer-btn');
  prevBtn.style.visibility = currentLayerIndex === 0 ? 'hidden' : 'visible';
  
  // 渲染内容
  const container = document.getElementById('layer-content');
  container.innerHTML = `
    <div class="layer-question-text">${layer.question}</div>
    <div class="options-grid">
      ${layer.options.map(opt => `
        <div class="option-radio ${formData.layers[layer.id] === opt.id ? 'selected' : ''}" 
             data-option="${opt.id}" onclick="selectOption('${layer.id}', '${opt.id}')">
          <span class="option-radio-title">${opt.name}</span>
          <span class="option-radio-desc">${opt.desc}</span>
        </div>
      `).join('')}
    </div>
    <textarea class="discussion-input" 
              placeholder="填写你的讨论要点（可选）"
              id="discussion-input">${formData.discussions[layer.id] || ''}</textarea>
  `;
}

// 选择选项
function selectOption(layerId, optionId) {
  formData.layers[layerId] = optionId;
  
  // 更新UI
  document.querySelectorAll('.option-radio').forEach(el => {
    el.classList.remove('selected');
    if (el.dataset.option === optionId) {
      el.classList.add('selected');
    }
  });
}

// 保存当前层讨论
function saveCurrentDiscussion() {
  const input = document.getElementById('discussion-input');
  if (input && input.value.trim()) {
    formData.discussions[LAYERS[currentLayerIndex].id] = input.value.trim();
  }
}

// 上一题
function prevLayer() {
  if (currentLayerIndex > 0) {
    saveCurrentDiscussion();
    currentLayerIndex--;
    renderLayer();
  }
}

// 下一题
function nextLayer() {
  const layer = LAYERS[currentLayerIndex];
  
  // 检查是否已选择
  if (!formData.layers[layer.id]) {
    alert('请选择一个选项');
    return;
  }
  
  saveCurrentDiscussion();
  
  if (currentLayerIndex < LAYERS.length - 1) {
    currentLayerIndex++;
    renderLayer();
  } else {
    submitForm();
  }
}

// 提交表单
function submitForm() {
  CanvasData.add(formData);
  
  // 显示成功页面
  goToStep('success');
}

// 重置表单
function resetForm() {
  formData = {
    group: null,
    company: null,
    layers: {},
    discussions: {}
  };
  currentLayerIndex = 0;
  
  // 重置UI
  document.getElementById('company-select').value = '';
  document.querySelectorAll('.group-btn-inline').forEach(b => b.classList.remove('selected'));
  document.getElementById('start-btn').disabled = true;
  
  goToStep('info');
}
