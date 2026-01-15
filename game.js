// NetDesign - Network Design Game

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
const state = {
  devices: [],
  links: [],
  selectedTool: 'select',
  selectedDevice: null,
  dragging: null,
  cableStart: null,
  nextId: 1
};

// Device costs
const COSTS = {
  pc: 10000,
  switch: 50000,
  router: 100000,
  cable: 1000
};

// Device colors
const COLORS = {
  pc: '#4ecdc4',
  switch: '#ffe66d',
  router: '#ff6b6b'
};

// Device port limits
const PORT_LIMITS = {
  pc: 1,
  switch: 8,
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
}

function drawDevice(device) {
  const size = device.type === 'pc' ? 30 : 40;
  const isSelected = state.selectedDevice === device.id;
  
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
  } else if (device.type === 'switch') {
    // Switch - rounded rectangle
    ctx.beginPath();
    ctx.roundRect(device.x - size/2, device.y - size/4, size, size/2, 5);
    ctx.fill();
    ctx.stroke();
    // Ports indicator
    const usedPorts = countPorts(device.id);
    ctx.fillStyle = '#1a1a2e';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${usedPorts}/${PORT_LIMITS.switch}`, device.x, device.y + 4);
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
    draw();
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
        state.selectedDevice = clickedDevice.id;
        state.dragging = clickedDevice.id;
      } else {
        state.selectedDevice = null;
      }
      break;
      
    case 'pc':
    case 'switch':
    case 'router':
      if (!clickedDevice) {
        addDevice(state.selectedTool, x, y);
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
        deleteDevice(clickedDevice.id);
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
  
  if (state.dragging) {
    const device = state.devices.find(d => d.id === state.dragging);
    if (device) {
      device.x = x;
      device.y = y;
    }
  }
  
  // Tooltip
  const hoverDevice = findDeviceAt(x, y);
  const tooltip = document.getElementById('tooltip');
  if (hoverDevice && state.selectedTool === 'select') {
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
  state.dragging = null;
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
  if (device.type === 'switch') {
    content += `<span style="color:#888;font-size:0.85em">💡 L2スイッチ (レイヤー2)</span>`;
  } else if (device.type === 'router') {
    content += `<span style="color:#888;font-size:0.85em">💡 L3ルーター (レイヤー3)</span>`;
  }
  
  return content;
}

function getTypeName(type) {
  const names = { pc: 'PC', switch: 'スイッチ', router: 'ルーター' };
  return names[type];
}

// Device/Link management
function addDevice(type, x, y) {
  const count = state.devices.filter(d => d.type === type).length + 1;
  const prefix = { pc: 'PC', switch: 'SW', router: 'RT' };
  
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
  if (state.selectedDevice === id) state.selectedDevice = null;
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
  state.devices.forEach(d => cost += COSTS[d.type]);
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
  const switches = state.devices.filter(d => d.type === 'switch');
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
    const avgCapacity = avgPortUsage / PORT_LIMITS.switch;
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
  
  // Show result
  const resultTitle = document.getElementById('resultTitle');
  const scoreDetail = document.getElementById('scoreDetail');
  
  resultTitle.textContent = connectivity === 100 ? `評価: ${grade} (${total}点)` : '未完成';
  
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

function closeModal() {
  document.getElementById('resultModal').classList.remove('show');
}

// Initial UI update
updateUI();
