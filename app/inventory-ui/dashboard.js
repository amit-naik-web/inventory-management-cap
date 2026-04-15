const BASE = 'https://994ae882trial-dev-dev-project-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/inventory';
let stockChartInstance = null;
let trendChartInstance = null;
let productsCache = [];
let warehousesCache = [];

async function loadDashboard() {
  try {
    const [movRes, prodRes, orderRes, whRes] = await Promise.all([
      fetch(`${BASE}/StockMovements`),
      fetch(`${BASE}/Products`),
      fetch(`${BASE}/PurchaseOrders?$filter=status eq 'PENDING'`),
      fetch(`${BASE}/Warehouses`)
    ]);

    const movements  = movRes.ok   ? (await movRes.json()).value   : [];
    const products   = prodRes.ok  ? (await prodRes.json()).value  : [];
    const orders     = orderRes.ok ? (await orderRes.json()).value : [];
    const warehouses = whRes.ok    ? (await whRes.json()).value    : [];

    productsCache   = products;
    warehousesCache = warehouses;

    const stockMap = {};
    products.forEach(p => {
      stockMap[p.ID] = { name: p.name, stock: 0, threshold: p.threshold };
    });
    movements.forEach(m => {
      if (stockMap[m.product_ID]) {
        stockMap[m.product_ID].stock += m.type === 'IN' ? m.quantity : -m.quantity;
      }
    });

    const stockList = Object.values(stockMap);
    const lowStock  = stockList.filter(p => p.stock < p.threshold);

    document.getElementById('kpi-total').innerText      = products.length;
    document.getElementById('kpi-low').innerText        = lowStock.length;
    document.getElementById('kpi-reorders').innerText   = orders.length;
    document.getElementById('kpi-warehouses').innerText = warehouses.length;

    renderStockChart(stockList);
    renderTrendChart(movements);

  } catch (err) {
    console.error('Failed to load dashboard:', err);
  }
}

function renderStockChart(stockList) {
  if (stockChartInstance) stockChartInstance.destroy();
  stockChartInstance = new Chart(document.getElementById('stockChart'), {
    type: 'bar',
    data: {
      labels: stockList.map(p => p.name),
      datasets: [{
        label: 'Current Stock',
        data: stockList.map(p => p.stock),
        backgroundColor: stockList.map(p =>
          p.stock < p.threshold ? '#E24B4A' : '#378ADD'
        )
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}

function renderTrendChart(movements) {
  if (trendChartInstance) trendChartInstance.destroy();
  const byDate = {};
  movements.forEach(m => {
    const date = m.movedAt?.split('T')[0];
    if (!date) return;
    if (!byDate[date]) byDate[date] = { IN: 0, OUT: 0 };
    byDate[date][m.type] += m.quantity;
  });

  const labels = Object.keys(byDate).sort();

  trendChartInstance = new Chart(document.getElementById('trendChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Stock In',
          data: labels.map(d => byDate[d].IN),
          borderColor: '#1D9E75',
          tension: 0.3,
          fill: false
        },
        {
          label: 'Stock Out',
          data: labels.map(d => byDate[d].OUT),
          borderColor: '#E24B4A',
          tension: 0.3,
          fill: false
        }
      ]
    },
    options: { responsive: true }
  });
}

async function openModal() {
  document.getElementById('modalOverlay').classList.add('open');

  if (productsCache.length === 0) {
    const [p, w] = await Promise.all([
      fetch(`${BASE}/Products`),
      fetch(`${BASE}/Warehouses`)
    ]);
    productsCache   = (await p.json()).value;
    warehousesCache = (await w.json()).value;
  }

  document.getElementById('m-product').innerHTML =
    productsCache.map(p => `<option value="${p.ID}">${p.name}</option>`).join('');
  document.getElementById('m-warehouse').innerHTML =
    warehousesCache.map(w => `<option value="${w.ID}">${w.name}</option>`).join('');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('m-quantity').value = '';
  document.getElementById('m-movedBy').value  = '';
}

async function submitMovement() {
  const quantity = parseInt(document.getElementById('m-quantity').value);
  const movedBy  = document.getElementById('m-movedBy').value;

  if (!quantity || quantity < 1) return alert('Enter a valid quantity');
  if (!movedBy)                  return alert('Enter your name');

  const body = {
    product_ID:   document.getElementById('m-product').value,
    warehouse_ID: document.getElementById('m-warehouse').value,
    type:         document.getElementById('m-type').value,
    quantity,
    movedBy
  };

  const res = await fetch(`${BASE}/StockMovements`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body)
  });

  if (res.ok) {
    closeModal();
    loadDashboard();
  } else {
    const err = await res.json();
    alert(err.error?.message || 'Failed to add movement');
  }
}

loadDashboard();