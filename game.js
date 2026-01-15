// Packet Network - Network Design Game

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ========== LOCALIZATION ==========
let currentLang = localStorage.getItem('pn_lang') || 'ja'; // Default to Japanese

const i18n = {
  ja: {
    appName: 'Packet Network',
    stages: 'ステージ',
    devices: '機器',
    tools: 'ツール',
    select: '選択/移動',
    cable: 'ケーブル',
    delete: '削除',
    cost: 'コスト',
    deviceCount: '機器数',
    linkCount: '接続数',
    evaluate: '設計を評価',
    connectivity: '接続性',
    speed: '速度',
    comfort: '快適性',
    redundancy: '冗長性',
    total: '総合',
    tweet: 'ツイート',
    retry: 'もう一度',
    nextStage: '次のステージ',
    stageClear: 'ステージクリア！',
    requirements: '要件',
    cableWarning: '⚠️ ケーブルが規格上限を超えています！速度低下の原因になります',
    time: 'タイム',
    bestTime: 'ベスト',
    newRecord: '🎉 新記録！',
    cableType: 'ケーブル種別',
    speedLabel: '速度',
    maxLength: '最大長',
    internetExit: '🌐 インターネット出口',
    // Stages
    stage1Name: '🏠 マイホーム',
    stage1Desc: '自宅をインターネットに接続しよう',
    stage2Name: '🏢 オフィス',
    stage2Desc: '20人のオフィスネットワークを構築',
    stage3Name: '🏭 データセンター',
    stage3Desc: '高可用性のデータセンターを設計',
    // Requirements
    reqInternet: 'インターネット接続',
    reqPCs: 'PC {n}台以上接続',
    reqSpeed: '全PCが{n}Mbps以上',
    reqRedundancy: '冗長パスあり',
    // Titles
    titleBeginner: '🌱 ネットワーク初心者',
    titleEngineer: '🔧 見習いエンジニア',
    titleDesigner: '💻 駆け出し設計士',
    titlePro: '🏆 実力派エンジニア',
    titleMaster: '👑 ネットワークマスター',
    titleCostSaver: '💰 コスト削減の鬼',
    titleRedundancy: '🛡️ 冗長性マスター',
    titleScale: '🚀 スケールアーキテクト',
    titleBalance: '⚖️ バランス設計師',
    titleSpeed: '⚡ スピードスター',
  },
  en: {
    appName: 'Packet Network',
    stages: 'Stages',
    devices: 'Devices',
    tools: 'Tools',
    select: 'Select/Move',
    cable: 'Cable',
    delete: 'Delete',
    cost: 'Cost',
    deviceCount: 'Devices',
    linkCount: 'Links',
    evaluate: 'Evaluate',
    connectivity: 'Connectivity',
    speed: 'Speed',
    comfort: 'Comfort',
    redundancy: 'Redundancy',
    total: 'Total',
    tweet: 'Tweet',
    retry: 'Retry',
    nextStage: 'Next Stage',
    stageClear: 'Stage Clear!',
    requirements: 'Requirements',
    cableWarning: '⚠️ Cable exceeds max length! Speed will degrade',
    time: 'Time',
    bestTime: 'Best',
    newRecord: '🎉 New Record!',
    cableType: 'Cable Type',
    speedLabel: 'Speed',
    maxLength: 'Max Length',
    internetExit: '🌐 Internet Exit',
    // Stages
    stage1Name: '🏠 My Home',
    stage1Desc: 'Connect your home to the internet',
    stage2Name: '🏢 Office',
    stage2Desc: 'Build a network for 20-person office',
    stage3Name: '🏭 Data Center',
    stage3Desc: 'Design a highly available data center',
    // Requirements
    reqInternet: 'Internet connection',
    reqPCs: '{n}+ PCs connected',
    reqSpeed: 'All PCs at {n}Mbps+',
    reqRedundancy: 'Redundant paths',
    // Titles
    titleBeginner: '🌱 Network Beginner',
    titleEngineer: '🔧 Junior Engineer',
    titleDesigner: '💻 Novice Designer',
    titlePro: '🏆 Pro Engineer',
    titleMaster: '👑 Network Master',
    titleCostSaver: '💰 Cost Optimizer',
    titleRedundancy: '🛡️ Redundancy Master',
    titleScale: '🚀 Scale Architect',
    titleBalance: '⚖️ Balance Designer',
    titleSpeed: '⚡ Speed Star',
  }
};

function t(key, params = {}) {
  let text = i18n[currentLang][key] || i18n['en'][key] || key;
  Object.keys(params).forEach(k => {
    text = text.replace(`{${k}}`, params[k]);
  });
  return text;
}

function toggleLang() {
  currentLang = currentLang === 'ja' ? 'en' : 'ja';
  localStorage.setItem('pn_lang', currentLang);
  updateUIText();
}

// ========== STAGES ==========
const stages = [
  {
    id: 1,
    name: 'stage1Name',
    desc: 'stage1Desc',
    icon: '🏠',
    gridSize: { w: 400, h: 300 },
    requirements: [
      { type: 'internet', desc: 'reqInternet' },
      { type: 'minPCs', value: 3, desc: 'reqPCs' },
    ],
    preplacedDevices: [
      { type: 'internet', x: 100, y: 150, label: 'Internet', fixed: true }
    ],
    availableDevices: ['pc', 'router', 'switch8'],
    passingScore: 60,
    budgetBonus: 200000
  },
  {
    id: 2,
    name: 'stage2Name',
    desc: 'stage2Desc',
    icon: '🏢',
    gridSize: { w: 800, h: 500 },
    requirements: [
      { type: 'internet', desc: 'reqInternet' },
      { type: 'minPCs', value: 10, desc: 'reqPCs' },
      { type: 'minSpeed', value: 100, desc: 'reqSpeed' },
    ],
    preplacedDevices: [
      { type: 'internet', x: 100, y: 250, label: 'Internet', fixed: true }
    ],
    availableDevices: ['pc', 'router', 'switch8', 'switch24'],
    passingScore: 65,
    budgetBonus: 1000000
  },
  {
    id: 3,
    name: 'stage3Name',
    desc: 'stage3Desc',
    icon: '🏭',
    gridSize: { w: 1000, h: 600 },
    requirements: [
      { type: 'internet', desc: 'reqInternet' },
      { type: 'minPCs', value: 20, desc: 'reqPCs' },
      { type: 'minSpeed', value: 1000, desc: 'reqSpeed' },
      { type: 'redundancy', desc: 'reqRedundancy' },
    ],
    preplacedDevices: [
      { type: 'internet', x: 100, y: 300, label: 'ISP-A', fixed: true },
      { type: 'internet', x: 100, y: 400, label: 'ISP-B', fixed: true }
    ],
    availableDevices: ['pc', 'server', 'router', 'switch8', 'switch24', 'switch48'],
    passingScore: 70,
    budgetBonus: 5000000
  }
];

// Game State
const state = {
  currentStage: 0,
  devices: [],
  links: [],
  selectedTool: 'select',
  selectedDevices: [],
  dragging: null,
  dragOffset: null,
  cableStart: null,
  nextId: 1,
  selectionBox: null,
  selectionStart: null,
  clearedStages: JSON.parse(localStorage.getItem('pn_cleared') || '[]'),
  // Timer
  startTime: null,
  elapsedTime: 0,
  timerInterval: null,
  bestTimes: JSON.parse(localStorage.getItem('pn_best_times') || '{}')
};

// Ethernet Standards
const ETHERNET_STANDARDS = {
  cat5e: { name: 'Cat5e', maxLength: 100, speed: 1000, color: '#4ecdc4' },
  cat6: { name: 'Cat6', maxLength: 100, speed: 1000, color: '#00d9ff' },
  cat6a: { name: 'Cat6a', maxLength: 100, speed: 10000, color: '#ffa94d' },
  fiber: { name: 'Fiber', maxLength: 2000, speed: 100000, color: '#a855f7' }
};

let currentCableType = 'cat6';

// Device costs (realistic prices in JPY)
const COSTS = {
  pc: 150000,         // 15万円 - 業務用PC
  server: 500000,     // 50万円 - サーバー
  switch8: 25000,     // 2.5万円 - L2スイッチ 8ポート
  switch24: 80000,    // 8万円 - L2スイッチ 24ポート
  switch48: 200000,   // 20万円 - L2スイッチ 48ポート
  router: 350000,     // 35万円 - 企業向けルーター
  internet: 0         // ISPノード(固定)
};

// Cable costs per meter
const CABLE_COSTS = {
  cat5e: 50,    // ¥50/m
  cat6: 80,     // ¥80/m  
  cat6a: 150,   // ¥150/m
  fiber: 500    // ¥500/m
};

// Device colors
const COLORS = {
  pc: '#4ecdc4',
  server: '#a855f7',
  switch8: '#ffe66d',
  switch24: '#ffa94d',
  switch48: '#f97316',
  router: '#ff6b6b',
  internet: '#22c55e'
};

// Device port limits
const PORT_LIMITS = {
  pc: 1,
  server: 2,
  switch8: 8,
  switch24: 24,
  switch48: 48,
  router: 4,
  internet: 1
};

// Speed per device type (Mbps)
const DEVICE_SPEED = {
  pc: 1000,
  server: 10000,
  switch8: 1000,
  switch24: 1000,
  switch48: 10000,
  router: 1000,
  internet: 1000
};

// Resize canvas
function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  draw();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Drawing functions
function draw() {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid
  ctx.strokeStyle = '#2a2a4e';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  
  // Draw links
  state.links.forEach(link => {
    const from = state.devices.find(d => d.id === link.from);
    const to = state.devices.find(d => d.id === link.to);
    if (from && to) {
      const standard = ETHERNET_STANDARDS[link.type] || ETHERNET_STANDARDS.cat6;
      
      // Color based on cable type and degradation
      ctx.strokeStyle = link.degraded ? '#ff6b6b' : standard.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      
      // Draw cable info label
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      
      // Background for label
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(mx - 35, my - 20, 70, 32);
      
      // Cable length and type
      ctx.fillStyle = link.degraded ? '#ff6b6b' : '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${link.length}m`, mx, my - 7);
      
      // Speed indicator
      const speedText = link.actualSpeed >= 1000 
        ? `${(link.actualSpeed/1000).toFixed(1)}Gbps` 
        : `${link.actualSpeed}Mbps`;
      ctx.fillStyle = link.degraded ? '#ff6b6b' : '#4ecdc4';
      ctx.font = '9px monospace';
      ctx.fillText(speedText, mx, my + 6);
      
      // Warning icon for degraded cables
      if (link.degraded) {
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '12px sans-serif';
        ctx.fillText('⚠️', mx + 30, my - 5);
      }
    }
  });
  
  // Draw cable in progress
  if (state.cableStart) {
    const from = state.devices.find(d => d.id === state.cableStart);
    if (from && state.mousePos) {
      ctx.strokeStyle = '#00d9ff88';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(state.mousePos.x, state.mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  
  // Draw devices
  state.devices.forEach(device => {
    drawDevice(device);
  });
  
  // Draw selection box
  if (state.selectionBox) {
    ctx.strokeStyle = '#00d9ff';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]);
    ctx.fillStyle = 'rgba(0, 217, 255, 0.1)';
    ctx.beginPath();
    ctx.rect(state.selectionBox.x, state.selectionBox.y, state.selectionBox.w, state.selectionBox.h);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawDevice(device) {
  let size = 40;
  if (device.type === 'pc') size = 30;
  if (device.type === 'internet') size = 50;
  if (device.type === 'server') size = 45;
  
  const isSelected = state.selectedDevices.includes(device.id);
  
  // Glow effect for selected
  if (isSelected) {
    ctx.shadowColor = '#00d9ff';
    ctx.shadowBlur = 15;
  }
  
  // Device body
  ctx.fillStyle = COLORS[device.type];
  ctx.strokeStyle = isSelected ? '#00d9ff' : '#fff';
  ctx.lineWidth = 2;
  
  if (device.type === 'pc') {
    // PC - rectangle
    ctx.beginPath();
    ctx.roundRect(device.x - size/2, device.y - size/2, size, size, 5);
    ctx.fill();
    ctx.stroke();
  } else if (device.type === 'switch8' || device.type === 'switch24') {
    // Switch - rounded rectangle
    const w = device.type === 'switch24' ? size * 1.3 : size;
    ctx.beginPath();
    ctx.roundRect(device.x - w/2, device.y - size/4, w, size/2, 5);
    ctx.fill();
    ctx.stroke();
    // Ports indicator
    const usedPorts = countPorts(device.id);
    ctx.fillStyle = '#1a1a2e';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${usedPorts}/${PORT_LIMITS[device.type]}`, device.x, device.y + 4);
  } else if (device.type === 'router') {
    // Router - circle
    ctx.beginPath();
    ctx.arc(device.x, device.y, size/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Ports indicator
    const usedPorts = countPorts(device.id);
    ctx.fillStyle = '#1a1a2e';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${usedPorts}/${PORT_LIMITS.router}`, device.x, device.y + 4);
  } else if (device.type === 'internet') {
    // Internet/ISP - prominent cloud with glow
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 20;
    
    // Outer ring
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(device.x, device.y, size/2 + 5, 0, Math.PI * 2);
    ctx.stroke();
    
    // Main circle
    ctx.beginPath();
    ctx.arc(device.x, device.y, size/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    
    // Globe icon
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌐', device.x, device.y + 7);
    
    // "EXIT" label
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('EXIT', device.x, device.y - size/2 - 8);
  } else if (device.type === 'server') {
    // Server - tall rectangle
    ctx.beginPath();
    ctx.roundRect(device.x - size/3, device.y - size/2, size*0.66, size, 4);
    ctx.fill();
    ctx.stroke();
    // Rack lines
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const y = device.y - size/2 + 8 + i * 10;
      ctx.beginPath();
      ctx.moveTo(device.x - size/3 + 4, y);
      ctx.lineTo(device.x + size/3 - 4, y);
      ctx.stroke();
    }
  }
  
  ctx.shadowBlur = 0;
  
  // Label
  ctx.fillStyle = '#fff';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(device.label, device.x, device.y + size/2 + 15);
}

function countPorts(deviceId) {
  return state.links.filter(l => l.from === deviceId || l.to === deviceId).length;
}

// Tool selection
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.selectedTool = btn.dataset.tool;
    state.cableStart = null;
    canvas.style.cursor = state.selectedTool === 'cable' ? 'crosshair' : 
                          state.selectedTool === 'delete' ? 'not-allowed' : 'default';
    draw();
  });
});

// Drag & Drop from toolbar
document.querySelectorAll('.device-btn').forEach(btn => {
  btn.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('device-type', btn.dataset.device);
    e.dataTransfer.effectAllowed = 'copy';
  });
});

canvas.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
});

canvas.addEventListener('drop', (e) => {
  e.preventDefault();
  const deviceType = e.dataTransfer.getData('device-type');
  if (deviceType) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addDevice(deviceType, x, y);
    updateUI();
    draw();
  }
});

// Cable type selection
document.querySelectorAll('.cable-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.cable-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    currentCableType = opt.dataset.cable;
  });
});

// Canvas interactions
canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const clickedDevice = findDeviceAt(x, y);
  
  switch (state.selectedTool) {
    case 'select':
      if (clickedDevice) {
        // Shift+click for multi-select
        if (e.shiftKey) {
          const idx = state.selectedDevices.indexOf(clickedDevice.id);
          if (idx >= 0) {
            state.selectedDevices.splice(idx, 1);
          } else {
            state.selectedDevices.push(clickedDevice.id);
          }
        } else {
          // Check if clicking on already selected device (for group drag)
          if (!state.selectedDevices.includes(clickedDevice.id)) {
            state.selectedDevices = [clickedDevice.id];
          }
          state.dragging = true;
          state.dragOffset = { x, y };
          // Store original positions for all selected devices
          state.dragStartPositions = {};
          state.selectedDevices.forEach(id => {
            const d = state.devices.find(dev => dev.id === id);
            if (d) state.dragStartPositions[id] = { x: d.x, y: d.y };
          });
        }
      } else {
        // Start selection box
        state.selectedDevices = [];
        state.selectionStart = { x, y };
        state.selectionBox = { x, y, w: 0, h: 0 };
      }
      break;
      
    case 'cable':
      if (clickedDevice) {
        if (!state.cableStart) {
          state.cableStart = clickedDevice.id;
        } else if (state.cableStart !== clickedDevice.id) {
          addLink(state.cableStart, clickedDevice.id);
          state.cableStart = null;
        }
      } else {
        state.cableStart = null;
      }
      break;
      
    case 'delete':
      if (clickedDevice) {
        // Don't delete fixed devices (like Internet)
        if (clickedDevice.fixed) {
          showHint(currentLang === 'ja' ? 'この機器は削除できません' : 'Cannot delete this device');
          break;
        }
        // Delete all selected if clicking on selected device
        if (state.selectedDevices.includes(clickedDevice.id)) {
          state.selectedDevices.forEach(id => {
            const d = state.devices.find(dev => dev.id === id);
            if (d && !d.fixed) deleteDevice(id);
          });
          state.selectedDevices = [];
        } else {
          deleteDevice(clickedDevice.id);
        }
      } else {
        // Check if clicking on a cable
        const clickedLink = findLinkAt(x, y);
        if (clickedLink) {
          state.links = state.links.filter(l => l !== clickedLink);
        }
      }
      break;
  }
  
  updateUI();
  draw();
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  state.mousePos = { x, y };
  
  // Dragging selected devices
  if (state.dragging && state.selectedDevices.length > 0) {
    const dx = x - state.dragOffset.x;
    const dy = y - state.dragOffset.y;
    state.selectedDevices.forEach(id => {
      const device = state.devices.find(d => d.id === id);
      const startPos = state.dragStartPositions[id];
      if (device && startPos) {
        device.x = startPos.x + dx;
        device.y = startPos.y + dy;
      }
    });
    // Recalculate cable lengths
    recalculateCableLengths();
  }
  
  // Selection box
  if (state.selectionStart) {
    const sx = state.selectionStart.x;
    const sy = state.selectionStart.y;
    state.selectionBox = {
      x: Math.min(sx, x),
      y: Math.min(sy, y),
      w: Math.abs(x - sx),
      h: Math.abs(y - sy)
    };
  }
  
  // Tooltip
  const hoverDevice = findDeviceAt(x, y);
  const tooltip = document.getElementById('tooltip');
  if (hoverDevice && state.selectedTool === 'select' && !state.dragging && !state.selectionStart) {
    tooltip.innerHTML = getTooltipContent(hoverDevice);
    tooltip.style.left = (e.clientX + 15) + 'px';
    tooltip.style.top = (e.clientY + 15) + 'px';
    tooltip.style.display = 'block';
  } else {
    tooltip.style.display = 'none';
  }
  
  draw();
});

canvas.addEventListener('mouseup', () => {
  // Finish selection box
  if (state.selectionBox && state.selectionBox.w > 5 && state.selectionBox.h > 5) {
    const box = state.selectionBox;
    state.selectedDevices = state.devices
      .filter(d => {
        return d.x >= box.x && d.x <= box.x + box.w &&
               d.y >= box.y && d.y <= box.y + box.h;
      })
      .map(d => d.id);
  }
  
  // Recalculate cable lengths after drag
  if (state.dragging) {
    recalculateCableLengths();
    updateUI();
  }
  
  state.dragging = false;
  state.selectionStart = null;
  state.selectionBox = null;
  state.dragStartPositions = null;
  draw();
});

canvas.addEventListener('mouseleave', () => {
  state.dragging = null;
  document.getElementById('tooltip').style.display = 'none';
});

function findDeviceAt(x, y) {
  for (let i = state.devices.length - 1; i >= 0; i--) {
    const d = state.devices[i];
    const size = d.type === 'pc' ? 30 : 40;
    if (Math.abs(d.x - x) < size/2 + 5 && Math.abs(d.y - y) < size/2 + 5) {
      return d;
    }
  }
  return null;
}

function findLinkAt(x, y) {
  const threshold = 15;
  for (const link of state.links) {
    const from = state.devices.find(d => d.id === link.from);
    const to = state.devices.find(d => d.id === link.to);
    if (!from || !to) continue;
    
    // Distance from point to line segment
    const dist = pointToLineDistance(x, y, from.x, from.y, to.x, to.y);
    if (dist < threshold) {
      return link;
    }
  }
  return null;
}

function pointToLineDistance(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) param = dot / lenSq;
  
  let xx, yy;
  if (param < 0) { xx = x1; yy = y1; }
  else if (param > 1) { xx = x2; yy = y2; }
  else { xx = x1 + param * C; yy = y1 + param * D; }
  
  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

function getTooltipContent(device) {
  const ports = countPorts(device.id);
  const maxPorts = PORT_LIMITS[device.type];
  let content = `<strong>${device.label}</strong><br>`;
  content += `種類: ${getTypeName(device.type)}<br>`;
  content += `ポート: ${ports}/${maxPorts}<br>`;
  
  // Real terminology hint
  if (device.type === 'switch8' || device.type === 'switch24') {
    content += `<span style="color:#888;font-size:0.85em">💡 L2スイッチ (レイヤー2)</span>`;
  } else if (device.type === 'router') {
    content += `<span style="color:#888;font-size:0.85em">💡 L3ルーター (レイヤー3)</span>`;
  }
  
  return content;
}

function getTypeName(type) {
  const names = { pc: 'PC', switch8: 'L2スイッチ(8p)', switch24: 'L2スイッチ(24p)', router: 'ルーター' };
  return names[type];
}

// Device/Link management
function addDevice(type, x, y) {
  const prefix = { pc: 'PC', switch8: 'SW', switch24: 'SW', router: 'RT' };
  const countTypes = type.startsWith('switch') ? ['switch8', 'switch24'] : [type];
  const count = state.devices.filter(d => countTypes.includes(d.type)).length + 1;
  
  state.devices.push({
    id: state.nextId++,
    type,
    x,
    y,
    label: `${prefix[type]}${count}`
  });
}

function addLink(fromId, toId) {
  // Check if link already exists
  const exists = state.links.some(l => 
    (l.from === fromId && l.to === toId) || 
    (l.from === toId && l.to === fromId)
  );
  if (exists) return;
  
  // Check port limits
  const fromDevice = state.devices.find(d => d.id === fromId);
  const toDevice = state.devices.find(d => d.id === toId);
  
  if (countPorts(fromId) >= PORT_LIMITS[fromDevice.type]) {
    showHint(`${fromDevice.label}: Port limit reached`);
    return;
  }
  if (countPorts(toId) >= PORT_LIMITS[toDevice.type]) {
    showHint(`${toDevice.label}: Port limit reached`);
    return;
  }
  
  // Calculate cable length (1 pixel = 0.1 meter = 10cm)
  // This means 1000px canvas width = 100m (Cat6 max length)
  const distance = Math.sqrt(
    Math.pow(fromDevice.x - toDevice.x, 2) + 
    Math.pow(fromDevice.y - toDevice.y, 2)
  );
  const cableLength = Math.round(distance * 0.1);
  
  const standard = ETHERNET_STANDARDS[currentCableType];
  const degraded = cableLength > standard.maxLength;
  
  // Calculate actual speed
  let actualSpeed = standard.speed;
  if (degraded) {
    // Speed drops significantly over max length
    const overLength = cableLength - standard.maxLength;
    actualSpeed = Math.max(10, standard.speed * Math.pow(0.5, overLength / 50));
  }
  
  state.links.push({ 
    from: fromId, 
    to: toId, 
    length: cableLength,
    type: currentCableType,
    maxSpeed: standard.speed,
    actualSpeed: Math.round(actualSpeed),
    degraded
  });
  
  // Warn if cable too long
  if (degraded) {
    showHint(t('cableWarning'));
  }
}

function getCableLength(link) {
  return link.length || 0;
}

function getTotalCableLength() {
  return state.links.reduce((sum, l) => sum + getCableLength(l), 0);
}

function recalculateCableLengths() {
  state.links.forEach(link => {
    const from = state.devices.find(d => d.id === link.from);
    const to = state.devices.find(d => d.id === link.to);
    if (from && to) {
      const distance = Math.sqrt(
        Math.pow(from.x - to.x, 2) + 
        Math.pow(from.y - to.y, 2)
      );
      link.length = Math.round(distance * 0.1);
      
      const standard = ETHERNET_STANDARDS[link.type] || ETHERNET_STANDARDS.cat6;
      link.degraded = link.length > standard.maxLength;
      
      if (link.degraded) {
        const overLength = link.length - standard.maxLength;
        link.actualSpeed = Math.max(10, Math.round(standard.speed * Math.pow(0.5, overLength / 50)));
      } else {
        link.actualSpeed = standard.speed;
      }
    }
  });
}

function deleteDevice(id) {
  const device = state.devices.find(d => d.id === id);
  // Don't delete fixed devices
  if (device && device.fixed) {
    return false;
  }
  state.devices = state.devices.filter(d => d.id !== id);
  state.links = state.links.filter(l => l.from !== id && l.to !== id);
  const idx = state.selectedDevices.indexOf(id);
  if (idx >= 0) state.selectedDevices.splice(idx, 1);
  return true;
}

// UI Updates
function updateUI() {
  const totalCost = calculateCost();
  document.getElementById('costValue').textContent = `¥${totalCost.toLocaleString()}`;
  document.getElementById('deviceCount').textContent = state.devices.length;
  
  const totalCable = getTotalCableLength();
  const cableLengthEl = document.getElementById('cableLength');
  if (cableLengthEl) {
    cableLengthEl.textContent = `${totalCable}m`;
    cableLengthEl.style.color = state.links.some(l => l.degraded) ? '#ff6b6b' : '#fff';
  }
  
  // Update requirements
  updateRequirements();
  
  // Check connectivity
  const pcs = state.devices.filter(d => d.type === 'pc');
  if (pcs.length < 2) {
    document.getElementById('connectivityStatus').textContent = '接続状態: PCを2台以上配置してください';
    document.getElementById('connectivityStatus').style.color = '#888';
  } else {
    const allConnected = checkAllPCsConnected();
    if (allConnected) {
      document.getElementById('connectivityStatus').textContent = '✓ 全PC接続済み';
      document.getElementById('connectivityStatus').style.color = '#4ecdc4';
    } else {
      document.getElementById('connectivityStatus').textContent = '✗ 未接続のPCがあります';
      document.getElementById('connectivityStatus').style.color = '#ff6b6b';
    }
  }
}

function calculateCost() {
  let cost = 0;
  state.devices.forEach(d => {
    cost += COSTS[d.type] || 0;
  });
  // Cable cost per meter based on type
  state.links.forEach(link => {
    const cableCost = CABLE_COSTS[link.type] || CABLE_COSTS.cat6;
    cost += link.length * cableCost;
  });
  return cost;
}

function checkAllPCsConnected() {
  const pcs = state.devices.filter(d => d.type === 'pc');
  if (pcs.length < 2) return false;
  
  // BFS from first PC
  const visited = new Set();
  const queue = [pcs[0].id];
  visited.add(pcs[0].id);
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    // Find all connected devices
    state.links.forEach(link => {
      let neighbor = null;
      if (link.from === current) neighbor = link.to;
      if (link.to === current) neighbor = link.from;
      
      if (neighbor && !visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    });
  }
  
  // Check if all PCs are visited
  return pcs.every(pc => visited.has(pc.id));
}

function showHint(message) {
  document.querySelector('.status-bar .hint').textContent = `⚠️ ${message}`;
  setTimeout(() => {
    document.querySelector('.status-bar .hint').textContent = '💡 ヒント: すべてのPCが通信できるようにネットワークを構築しよう';
  }, 3000);
}

// Evaluation
document.getElementById('checkBtn').addEventListener('click', evaluate);

function evaluate() {
  const stage = stages[state.currentStage];
  const pcs = state.devices.filter(d => d.type === 'pc' || d.type === 'server');
  const switches = state.devices.filter(d => d.type.startsWith('switch'));
  
  // New scoring categories
  let connectivity = 0;  // 接続性
  let speed = 0;         // 速度
  let comfort = 0;       // 快適性
  let redundancy = 0;    // 冗長性
  
  // 1. Connectivity (30%) - Are all requirements met?
  if (stage) {
    const reqsMet = stage.requirements.filter(r => checkRequirement(r)).length;
    connectivity = Math.floor((reqsMet / stage.requirements.length) * 100);
  } else {
    connectivity = checkAllPCsConnected() ? 100 : 0;
  }
  
  // 2. Speed (25%) - Based on cable lengths and bottlenecks
  const degradedLinks = state.links.filter(l => l.degraded).length;
  if (state.links.length === 0) {
    speed = 0;
  } else if (degradedLinks === 0) {
    speed = 100;
  } else {
    speed = Math.max(0, 100 - (degradedLinks * 30));
  }
  
  // 3. Comfort (25%) - Cost efficiency & port availability
  if (pcs.length > 0) {
    const costPerPC = calculateCost() / pcs.length;
    let costScore = 0;
    if (costPerPC < 100000) costScore = 100;
    else if (costPerPC < 200000) costScore = 80;
    else if (costPerPC < 350000) costScore = 60;
    else if (costPerPC < 500000) costScore = 40;
    else costScore = 20;
    
    // Port availability bonus
    let portScore = 50;
    if (switches.length > 0) {
      const avgCapacity = switches.reduce((sum, sw) => sum + countPorts(sw.id) / PORT_LIMITS[sw.type], 0) / switches.length;
      portScore = avgCapacity < 0.5 ? 100 : avgCapacity < 0.75 ? 70 : 40;
    }
    
    comfort = Math.floor((costScore + portScore) / 2);
  }
  
  // 4. Redundancy (20%) - Multiple paths
  redundancy = calculateRedundancy();
  
  // Total score
  const total = Math.floor(
    connectivity * 0.3 +
    speed * 0.25 +
    comfort * 0.25 +
    redundancy * 0.2
  );
  
  // Grade
  let grade = 'D';
  if (total >= 90) grade = 'S';
  else if (total >= 80) grade = 'A';
  else if (total >= 70) grade = 'B';
  else if (total >= 60) grade = 'C';
  
  // Title based on design style
  const title = getDesignTitle(connectivity, speed, comfort, redundancy, pcs.length, calculateCost());
  
  // Stop timer and check for record
  stopTimer();
  let isNewRecord = false;
  let stagePassed = false;
  if (stage && total >= stage.passingScore) {
    isNewRecord = saveBestTime(stage.id, state.elapsedTime);
    stagePassed = true;
    
    // Unlock this stage as cleared
    if (!state.clearedStages.includes(stage.id)) {
      state.clearedStages.push(stage.id);
      localStorage.setItem('pn_cleared', JSON.stringify(state.clearedStages));
    }
  }
  
  // Store result for sharing
  lastEvalResult = {
    grade,
    total,
    connectivity,
    speed,
    comfort,
    redundancy,
    deviceCount: state.devices.length,
    cost: calculateCost(),
    cableLength: getTotalCableLength(),
    minSpeed: getMinSpeed(),
    title,
    stageName: stage ? t(stage.name) : 'Sandbox',
    time: state.elapsedTime,
    isNewRecord
  };
  
  // Show result
  const resultTitle = document.getElementById('resultTitle');
  const scoreDetail = document.getElementById('scoreDetail');
  
  // Update modal display
  const badges = { 'S': '👑', 'A': '🏆', 'B': '🥇', 'C': '🥈', 'D': '📝' };
  document.getElementById('resultBadge').textContent = badges[grade] || '🌐';
  document.getElementById('resultGrade').textContent = connectivity === 100 ? `${grade}ランク (${total}点)` : '未完成';
  document.getElementById('resultTitleText').textContent = title.name;
  
  const minSpd = getMinSpeed();
  const spdText = minSpd >= 1000 ? `${(minSpd/1000).toFixed(1)}Gbps` : `${minSpd}Mbps`;
  
  scoreDetail.innerHTML = `
    <div class="score-row"><span>🔗 ${t('connectivity')}</span><span>${connectivity}/100</span></div>
    <div class="score-row"><span>⚡ ${t('speed')}</span><span>${speed}/100</span></div>
    <div class="score-row"><span>🏠 ${t('comfort')}</span><span>${comfort}/100</span></div>
    <div class="score-row"><span>🛡️ ${t('redundancy')}</span><span>${redundancy}/100</span></div>
    <div class="score-row" style="border-top:2px solid #00d9ff;margin-top:10px;padding-top:10px;">
      <span><strong>${t('total')}</strong></span>
      <span><strong>${total}/100</strong></span>
    </div>
    <div style="margin-top:10px;font-size:0.85em;color:#888;">
      ⏱ ${formatTime(state.elapsedTime)} ${isNewRecord ? '<span style="color:#ffd700">' + t('newRecord') + '</span>' : ''}
    </div>
    <div style="margin-top:5px;font-size:0.85em;color:#888;">
      💰 ¥${calculateCost().toLocaleString()} | 📦 ${getTotalCableLength()}m | ⚡ ${spdText}
    </div>
  `;
  
  // Show/hide next stage button
  const nextBtn = document.getElementById('nextStageBtn');
  if (nextBtn) {
    if (stagePassed && state.currentStage < stages.length - 1) {
      nextBtn.style.display = 'inline-block';
    } else {
      nextBtn.style.display = 'none';
    }
  }
  
  document.getElementById('resultModal').classList.add('show');
}

function countConnectedPCs() {
  const pcs = state.devices.filter(d => d.type === 'pc');
  if (pcs.length === 0) return 0;
  
  const visited = new Set();
  const queue = [pcs[0].id];
  visited.add(pcs[0].id);
  
  while (queue.length > 0) {
    const current = queue.shift();
    state.links.forEach(link => {
      let neighbor = null;
      if (link.from === current) neighbor = link.to;
      if (link.to === current) neighbor = link.from;
      if (neighbor && !visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    });
  }
  
  return pcs.filter(pc => visited.has(pc.id)).length;
}

function calculateRedundancy() {
  // Check if there are multiple paths between any two PCs
  const pcs = state.devices.filter(d => d.type === 'pc');
  if (pcs.length < 2) return 0;
  
  // Simple check: if total links > devices - 1, there might be redundancy
  const minLinks = state.devices.length - 1;
  if (state.links.length > minLinks) {
    return Math.min(100, (state.links.length - minLinks) * 30 + 40);
  }
  return 0;
}

function getAdvice(conn, eff, scale, redun) {
  if (conn < 100) return '💡 まずはすべてのPCを接続しましょう';
  if (eff < 60) return '💡 コスト効率を改善できます。スイッチを活用しましょう';
  if (scale < 50) return '💡 スイッチのポートに余裕を持たせると拡張性が上がります';
  if (redun < 50) return '💡 冗長パスを追加すると耐障害性が上がります';
  return '🎉 素晴らしい設計です！';
}

// Design title generator - makes sharing fun!
function getDesignTitle(conn, speed, comfort, redun, pcCount, cost) {
  // Incomplete
  if (conn < 50) {
    return { name: t('titleBeginner'), emoji: '🌱' };
  }
  
  // Special titles based on characteristics
  if (speed >= 95) {
    return { name: t('titleSpeed'), emoji: '⚡' };
  }
  if (comfort >= 90 && cost < pcCount * 100000) {
    return { name: t('titleCostSaver'), emoji: '💰' };
  }
  if (redun >= 80) {
    return { name: t('titleRedundancy'), emoji: '🛡️' };
  }
  if (comfort >= 80 && speed >= 80) {
    return { name: t('titleBalance'), emoji: '⚖️' };
  }
  if (pcCount >= 10) {
    return { name: t('titleScale'), emoji: '🚀' };
  }
  
  // Default titles by grade
  const total = Math.floor(conn * 0.3 + speed * 0.25 + comfort * 0.25 + redun * 0.2);
  if (total >= 90) return { name: t('titleMaster'), emoji: '👑' };
  if (total >= 80) return { name: t('titlePro'), emoji: '🏆' };
  if (total >= 70) return { name: t('titleDesigner'), emoji: '💻' };
  if (total >= 60) return { name: t('titleEngineer'), emoji: '🔧' };
  return { name: t('titleBeginner'), emoji: '🌱' };
}

function closeModal() {
  document.getElementById('resultModal').classList.remove('show');
  // Restart timer
  if (state.currentStage >= 0) {
    startTimer();
  }
}

function goNextStage() {
  document.getElementById('resultModal').classList.remove('show');
  const nextStageIndex = state.currentStage + 1;
  if (nextStageIndex < stages.length) {
    startStage(nextStageIndex);
  } else {
    showStageSelect();
  }
}

// Twitter share
let lastEvalResult = null;

document.getElementById('tweetBtn').addEventListener('click', () => {
  if (!lastEvalResult) return;
  
  const { grade, total, connectivity, speed, comfort, redundancy, cost, cableLength, minSpeed, title, stageName, time, isNewRecord } = lastEvalResult;
  
  const badges = { 'S': '👑', 'A': '🏆', 'B': '🥇', 'C': '🥈', 'D': '📝' };
  const stars = (score) => '★'.repeat(Math.ceil(score/20)) + '☆'.repeat(5-Math.ceil(score/20));
  const spdText = minSpeed >= 1000 ? `${(minSpeed/1000).toFixed(1)}Gbps` : `${minSpeed}Mbps`;
  const timeText = formatTime(time);
  
  const text = currentLang === 'ja' 
    ? `${title.emoji} ${stageName}をクリア！

「${title.name}」
${badges[grade]} ${grade}ランク（${total}点）
⏱ ${timeText}${isNewRecord ? ' 🎉新記録!' : ''}

🔗 ${stars(connectivity)}
⚡ ${stars(speed)} (${spdText})
🏠 ${stars(comfort)}
🛡 ${stars(redundancy)}

#PacketNetwork`
    : `${title.emoji} Cleared ${stageName}!

"${title.name}"
${badges[grade]} Rank ${grade} (${total}pts)
⏱ ${timeText}${isNewRecord ? ' 🎉 New Record!' : ''}

🔗 ${stars(connectivity)}
⚡ ${stars(speed)} (${spdText})
🏠 ${stars(comfort)}
🛡 ${stars(redundancy)}

#PacketNetwork`;
  
  const url = 'https://packetnetwork.exe.xyz:8000/';
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  
  window.open(tweetUrl, '_blank', 'width=550,height=420');
});

// ========== STAGE MANAGEMENT ==========
function renderStageSelect() {
  const grid = document.getElementById('stageGrid');
  grid.innerHTML = '';
  
  stages.forEach((stage, idx) => {
    const cleared = state.clearedStages.includes(stage.id);
    const locked = idx > 0 && !state.clearedStages.includes(stages[idx-1].id);
    
    const card = document.createElement('div');
    card.className = `stage-card ${cleared ? 'cleared' : ''} ${locked ? 'locked' : ''}`;
    card.innerHTML = `
      <div class="icon">${stage.icon}</div>
      <div class="name">${t(stage.name)}</div>
      <div class="desc">${t(stage.desc)}</div>
      ${cleared ? '<div class="badge">✓ Clear</div>' : ''}
    `;
    
    if (!locked) {
      card.onclick = () => startStage(idx);
    }
    
    grid.appendChild(card);
  });
}

function startStage(stageIndex) {
  state.currentStage = stageIndex;
  const stage = stages[stageIndex];
  
  // Reset game state
  state.devices = [];
  state.links = [];
  state.nextId = 1;
  state.selectedDevices = [];
  
  // Start timer
  startTimer();
  
  // Add preplaced devices
  stage.preplacedDevices.forEach(d => {
    state.devices.push({
      id: state.nextId++,
      type: d.type,
      x: d.x,
      y: d.y,
      label: d.label,
      fixed: d.fixed || false
    });
  });
  
  // Update UI
  document.getElementById('stageSelectModal').classList.remove('show');
  document.getElementById('stageInfo').style.display = 'flex';
  document.getElementById('reqPanel').style.display = 'block';
  document.getElementById('stageIcon').textContent = stage.icon;
  document.getElementById('stageName').textContent = t(stage.name);
  
  // Show best time
  const bestTimeEl = document.getElementById('bestTimeDisplay');
  const bestTime = getBestTime(stage.id);
  if (bestTime) {
    bestTimeEl.textContent = `${t('bestTime')}: ${formatTime(bestTime)}`;
  } else {
    bestTimeEl.textContent = '';
  }
  
  updateRequirements();
  updateUI();
  draw();
}

function showStageSelect() {
  document.getElementById('stageSelectModal').classList.add('show');
  document.getElementById('stageInfo').style.display = 'none';
  document.getElementById('reqPanel').style.display = 'none';
  stopTimer();
  state.currentStage = -1;
  renderStageSelect();
}

// Timer functions
function startTimer() {
  state.startTime = Date.now();
  state.elapsedTime = 0;
  
  if (state.timerInterval) clearInterval(state.timerInterval);
  
  state.timerInterval = setInterval(() => {
    state.elapsedTime = Date.now() - state.startTime;
    updateTimerDisplay();
  }, 100);
  
  updateTimerDisplay();
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function updateTimerDisplay() {
  const timerEl = document.getElementById('timerDisplay');
  if (timerEl) {
    timerEl.textContent = formatTime(state.elapsedTime);
  }
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const tenth = Math.floor((ms % 1000) / 100);
  return `${min}:${sec.toString().padStart(2, '0')}.${tenth}`;
}

function getBestTime(stageId) {
  return state.bestTimes[stageId] || null;
}

function saveBestTime(stageId, time) {
  const current = state.bestTimes[stageId];
  if (!current || time < current) {
    state.bestTimes[stageId] = time;
    localStorage.setItem('pn_best_times', JSON.stringify(state.bestTimes));
    return true; // New record
  }
  return false;
}

function updateRequirements() {
  const stage = stages[state.currentStage];
  if (!stage) return;
  
  const list = document.getElementById('reqList');
  list.innerHTML = '';
  
  stage.requirements.forEach(req => {
    const met = checkRequirement(req);
    const div = document.createElement('div');
    div.className = `req-item ${met ? 'met' : ''}`;
    div.textContent = t(req.desc, { n: req.value });
    list.appendChild(div);
  });
}

function checkRequirement(req) {
  const pcs = state.devices.filter(d => d.type === 'pc' || d.type === 'server');
  const internet = state.devices.find(d => d.type === 'internet');
  
  switch(req.type) {
    case 'internet':
      return internet && isConnectedToInternet();
    case 'minPCs':
      return pcs.length >= req.value && pcs.every(pc => isDeviceConnected(pc.id));
    case 'minSpeed':
      return getMinSpeed() >= req.value;
    case 'redundancy':
      return hasRedundantPaths();
    default:
      return false;
  }
}

function isConnectedToInternet() {
  const internet = state.devices.find(d => d.type === 'internet');
  if (!internet) return false;
  
  const pcs = state.devices.filter(d => d.type === 'pc' || d.type === 'server');
  return pcs.length > 0 && pcs.every(pc => canReach(internet.id, pc.id));
}

function isDeviceConnected(deviceId) {
  const internet = state.devices.find(d => d.type === 'internet');
  if (!internet) return false;
  return canReach(internet.id, deviceId);
}

function canReach(fromId, toId) {
  const visited = new Set();
  const queue = [fromId];
  visited.add(fromId);
  
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === toId) return true;
    
    state.links.forEach(link => {
      let neighbor = null;
      if (link.from === current) neighbor = link.to;
      if (link.to === current) neighbor = link.from;
      if (neighbor && !visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    });
  }
  return false;
}

function getMinSpeed() {
  if (state.links.length === 0) return 0;
  
  // Find bottleneck - minimum speed across all links
  const minLinkSpeed = Math.min(...state.links.map(l => l.actualSpeed || 1000));
  return minLinkSpeed;
}

function hasRedundantPaths() {
  // Check if there are multiple paths (more links than devices - 1)
  return state.links.length > state.devices.length - 1;
}

function updateUIText() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.getElementById('langLabel').textContent = currentLang.toUpperCase();
  
  // Update specific buttons
  const checkBtn = document.getElementById('checkBtn');
  if (checkBtn) checkBtn.textContent = t('evaluate');
  
  // Update toolbar section labels
  const sections = document.querySelectorAll('.toolbar-section');
  if (sections[0]) sections[0].textContent = t('devices');
  if (sections[1]) sections[1].textContent = t('tools');
  
  renderStageSelect();
}

// Initial setup
state.currentStage = -1; // No stage selected
renderStageSelect();
updateUIText();

// Hide stage info and requirements on initial load
document.getElementById('stageInfo').style.display = 'none';
document.getElementById('reqPanel').style.display = 'none';

// ========== TUTORIAL SYSTEM ==========
const tutorial = {
  currentStep: 0,
  steps: [
    {
      title: '🎉 Packet Networkへようこそ！',
      text: 'ネットワーク設計をゲームで学びましょう。\nまずは基本操作を説明します！',
      target: null,
      position: 'center'
    },
    {
      title: '💻 機器を配置しよう',
      text: '左の「PC」をキャンバスに\nドラッグ&ドロップしてください。',
      target: '[data-device="pc"]',
      position: 'right'
    },
    {
      title: '🔳 スイッチを追加',
      text: '複数のPCをつなぐには\nスイッチが必要です。\nL2SWもドラッグしてみましょう。',
      target: '[data-device="switch8"]',
      position: 'right'
    },
    {
      title: '🔗 ケーブルで接続',
      text: '「ケーブル」ツールを選んで\n機器をクリックして接続します。\n全てのPCをつなげましょう！',
      target: '[data-tool="cable"]',
      position: 'right'
    },
    {
      title: '🏆 設計を評価！',
      text: '完成したら「設計を評価」ボタンで\nスコアをチェック！\n結果をTwitterでシェアしよう🚀',
      target: '#checkBtn',
      position: 'top'
    }
  ]
};

function showTutorial() {
  const overlay = document.getElementById('tutorialOverlay');
  overlay.classList.add('show');
  showTutorialStep(0);
}

function showTutorialStep(stepIndex) {
  tutorial.currentStep = stepIndex;
  const step = tutorial.steps[stepIndex];
  if (!step) {
    skipTutorial();
    return;
  }
  
  document.getElementById('tutorialStep').textContent = `${stepIndex + 1}/${tutorial.steps.length}`;
  document.getElementById('tutorialTitle').textContent = step.title;
  document.getElementById('tutorialText').textContent = step.text;
  
  const box = document.getElementById('tutorialBox');
  const highlight = document.getElementById('tutorialHighlight');
  
  if (step.target) {
    const target = document.querySelector(step.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      highlight.style.display = 'block';
      highlight.style.left = (rect.left - 5) + 'px';
      highlight.style.top = (rect.top - 5) + 'px';
      highlight.style.width = (rect.width + 10) + 'px';
      highlight.style.height = (rect.height + 10) + 'px';
      
      // Position tutorial box
      if (step.position === 'right') {
        box.style.left = (rect.right + 20) + 'px';
        box.style.top = rect.top + 'px';
      } else if (step.position === 'top') {
        box.style.left = (rect.left - 100) + 'px';
        box.style.top = (rect.top - 180) + 'px';
      }
    }
  } else {
    highlight.style.display = 'none';
    box.style.left = '50%';
    box.style.top = '50%';
    box.style.transform = 'translate(-50%, -50%)';
  }
  
  document.getElementById('tutorialNext').textContent = 
    stepIndex === tutorial.steps.length - 1 ? '始める！' : '次へ';
}

function skipTutorial() {
  document.getElementById('tutorialOverlay').classList.remove('show');
  localStorage.setItem('packetnetwork_tutorial_done', 'true');
}

document.getElementById('tutorialNext').addEventListener('click', () => {
  if (tutorial.currentStep < tutorial.steps.length - 1) {
    showTutorialStep(tutorial.currentStep + 1);
  } else {
    skipTutorial();
  }
});

// Show tutorial on first visit
if (!localStorage.getItem('packetnetwork_tutorial_done')) {
  setTimeout(showTutorial, 500);
}
