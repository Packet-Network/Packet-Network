// NetDesign - Network Design Game

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
const state = {
  devices: [],
  links: [],
  selectedTool: 'select',
  selectedDevices: [], // Multiple selection support
  dragging: null,
  dragOffset: null,
  cableStart: null,
  nextId: 1,
  // Selection box
  selectionBox: null,
  selectionStart: null
};

// Device costs (realistic prices in JPY)
const COSTS = {
  pc: 150000,        // 15万円 - 業務用PC
  switch8: 25000,    // 2.5万円 - L2スイッチ 8ポート
  switch24: 80000,   // 8万円 - L2スイッチ 24ポート  
  router: 350000,    // 35万円 - 企業向けルーター
  cable: 800         // 800円 - Cat6 LANケーブル
};

// Device colors
const COLORS = {
  pc: '#4ecdc4',
  switch8: '#ffe66d',
  switch24: '#ffa94d',
  router: '#ff6b6b'
};

// Device port limits
const PORT_LIMITS = {
  pc: 1,
  switch8: 8,
  switch24: 24,
  router: 4
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
      ctx.strokeStyle = '#00d9ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      
      // Draw link indicator
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      ctx.fillStyle = '#00d9ff';
      ctx.beginPath();
      ctx.arc(mx, my, 4, 0, Math.PI * 2);
      ctx.fill();
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
  const size = device.type === 'pc' ? 30 : 40;
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
        // Delete all selected if clicking on selected device
        if (state.selectedDevices.includes(clickedDevice.id)) {
          state.selectedDevices.forEach(id => deleteDevice(id));
          state.selectedDevices = [];
        } else {
          deleteDevice(clickedDevice.id);
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
    showHint(`${fromDevice.label}のポートが足りません`);
    return;
  }
  if (countPorts(toId) >= PORT_LIMITS[toDevice.type]) {
    showHint(`${toDevice.label}のポートが足りません`);
    return;
  }
  
  state.links.push({ from: fromId, to: toId });
}

function deleteDevice(id) {
  state.devices = state.devices.filter(d => d.id !== id);
  state.links = state.links.filter(l => l.from !== id && l.to !== id);
  const idx = state.selectedDevices.indexOf(id);
  if (idx >= 0) state.selectedDevices.splice(idx, 1);
}

// UI Updates
function updateUI() {
  const totalCost = calculateCost();
  document.getElementById('costValue').textContent = `¥${totalCost.toLocaleString()}`;
  document.getElementById('deviceCount').textContent = state.devices.length;
  document.getElementById('linkCount').textContent = state.links.length;
  
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
  cost += state.links.length * COSTS.cable;
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
  const pcs = state.devices.filter(d => d.type === 'pc');
  const switches = state.devices.filter(d => d.type === 'switch8' || d.type === 'switch24');
  const routers = state.devices.filter(d => d.type === 'router');
  
  // Scores
  let connectivity = 0;
  let efficiency = 0;
  let scalability = 0;
  let redundancy = 0;
  
  // 1. Connectivity (40%)
  if (pcs.length >= 2 && checkAllPCsConnected()) {
    connectivity = 100;
  } else if (pcs.length < 2) {
    connectivity = 0;
  } else {
    // Partial connectivity
    const connectedPCs = countConnectedPCs();
    connectivity = Math.floor((connectedPCs / pcs.length) * 100);
  }
  
  // 2. Efficiency (30%) - cost per connected PC
  if (pcs.length > 0 && connectivity > 0) {
    const costPerPC = calculateCost() / pcs.length;
    if (costPerPC < 30000) efficiency = 100;
    else if (costPerPC < 50000) efficiency = 80;
    else if (costPerPC < 80000) efficiency = 60;
    else if (costPerPC < 120000) efficiency = 40;
    else efficiency = 20;
  }
  
  // 3. Scalability (20%) - based on switch usage
  if (switches.length > 0) {
    const avgPortUsage = switches.reduce((sum, sw) => sum + countPorts(sw.id), 0) / switches.length;
    const avgCapacity = switches.reduce((sum, sw) => sum + countPorts(sw.id) / PORT_LIMITS[sw.type], 0) / switches.length;
    if (avgCapacity < 0.5) scalability = 100; // Room to grow
    else if (avgCapacity < 0.75) scalability = 70;
    else scalability = 40;
  } else if (pcs.length <= 2) {
    scalability = 50; // Direct connection is OK for 2 PCs
  } else {
    scalability = 20; // No switches but many PCs
  }
  
  // 4. Redundancy (10%) - multiple paths
  redundancy = calculateRedundancy();
  
  // Total score
  const total = Math.floor(
    connectivity * 0.4 +
    efficiency * 0.3 +
    scalability * 0.2 +
    redundancy * 0.1
  );
  
  // Grade
  let grade = 'D';
  if (total >= 90) grade = 'S';
  else if (total >= 80) grade = 'A';
  else if (total >= 70) grade = 'B';
  else if (total >= 60) grade = 'C';
  
  // Title based on design style
  const title = getDesignTitle(connectivity, efficiency, scalability, redundancy, pcs.length, calculateCost());
  
  // Store result for sharing
  lastEvalResult = {
    grade,
    total,
    connectivity,
    efficiency,
    scalability,
    redundancy,
    deviceCount: state.devices.length,
    cost: calculateCost(),
    title
  };
  
  // Show result
  const resultTitle = document.getElementById('resultTitle');
  const scoreDetail = document.getElementById('scoreDetail');
  
  // Update modal display
  const badges = { 'S': '👑', 'A': '🏆', 'B': '🥇', 'C': '🥈', 'D': '📝' };
  document.getElementById('resultBadge').textContent = badges[grade] || '🌐';
  document.getElementById('resultGrade').textContent = connectivity === 100 ? `${grade}ランク (${total}点)` : '未完成';
  document.getElementById('resultTitleText').textContent = title.name;
  
  scoreDetail.innerHTML = `
    <div class="score-row"><span>接続性</span><span>${connectivity}/100</span></div>
    <div class="score-row"><span>効率性</span><span>${efficiency}/100</span></div>
    <div class="score-row"><span>拡張性</span><span>${scalability}/100</span></div>
    <div class="score-row"><span>冗長性</span><span>${redundancy}/100</span></div>
    <div class="score-row" style="border-top:2px solid #00d9ff;margin-top:10px;padding-top:10px;">
      <span><strong>総合</strong></span>
      <span><strong>${total}/100</strong></span>
    </div>
    <div style="margin-top:15px;color:#888;font-size:0.9em;">
      ${getAdvice(connectivity, efficiency, scalability, redundancy)}
    </div>
  `;
  
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
function getDesignTitle(conn, eff, scale, redun, pcCount, cost) {
  // Incomplete
  if (conn < 100) {
    return { name: '🚧 工事中エンジニア', emoji: '🚧' };
  }
  
  // Special titles based on characteristics
  if (eff >= 90 && cost < pcCount * 50000) {
    return { name: '💰 コスト削減の鬼', emoji: '💰' };
  }
  if (redun >= 80) {
    return { name: '🛡️ 冗長性マスター', emoji: '🛡️' };
  }
  if (scale >= 90) {
    return { name: '🚀 スケールアーキテクト', emoji: '🚀' };
  }
  if (eff >= 80 && scale >= 80) {
    return { name: '⚖️ バランス設計師', emoji: '⚖️' };
  }
  if (pcCount >= 6 && conn === 100) {
    return { name: '🌐 大規模ネットワーカー', emoji: '🌐' };
  }
  if (eff >= 70) {
    return { name: '📊 効率重視派', emoji: '📊' };
  }
  if (scale >= 70) {
    return { name: '📈 未来志向設計士', emoji: '📈' };
  }
  
  // Default titles by grade
  const total = Math.floor(conn * 0.4 + eff * 0.3 + scale * 0.2 + redun * 0.1);
  if (total >= 90) return { name: '👑 ネットワークマスター', emoji: '👑' };
  if (total >= 80) return { name: '🏆 実力派エンジニア', emoji: '🏆' };
  if (total >= 70) return { name: '💻 駆け出し設計士', emoji: '💻' };
  if (total >= 60) return { name: '🔧 見習いエンジニア', emoji: '🔧' };
  return { name: '🌱 ネットワーク初心者', emoji: '🌱' };
}

function closeModal() {
  document.getElementById('resultModal').classList.remove('show');
}

// Twitter share
let lastEvalResult = null;

document.getElementById('tweetBtn').addEventListener('click', () => {
  if (!lastEvalResult) return;
  
  const { grade, total, connectivity, efficiency, scalability, redundancy, deviceCount, cost, title } = lastEvalResult;
  
  const badges = { 'S': '👑', 'A': '🏆', 'B': '🥇', 'C': '🥈', 'D': '📝' };
  
  const text = `${title.emoji} 私のネットワーク設計力は...

「${title.name}」

${badges[grade]} ${grade}ランク（${total}点）

■ 接続性: ${'★'.repeat(Math.ceil(connectivity/20))}${'☆'.repeat(5-Math.ceil(connectivity/20))}
■ 効率性: ${'★'.repeat(Math.ceil(efficiency/20))}${'☆'.repeat(5-Math.ceil(efficiency/20))}
■ 拡張性: ${'★'.repeat(Math.ceil(scalability/20))}${'☆'.repeat(5-Math.ceil(scalability/20))}
■ 冗長性: ${'★'.repeat(Math.ceil(redundancy/20))}${'☆'.repeat(5-Math.ceil(redundancy/20))}

#PacketNetwork #ネットワーク設計`;
  
  const url = 'https://packetnetwork.exe.xyz:8000/';
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  
  window.open(tweetUrl, '_blank', 'width=550,height=420');
});

// Initial UI update
updateUI();

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
