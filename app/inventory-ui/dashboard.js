const BASE = window.location.origin + '/odata/v4/inventory';

async function loadDashboard() {
  try {
    const [movRes, prodRes, orderRes, whRes] = await Promise.all([
      fetch(`${BASE}/StockMovements?$expand=product,warehouse`),
      fetch(`${BASE}/Products`),
      fetch(`${BASE}/PurchaseOrders?$filter=status eq 'PENDING'`),
      fetch(`${BASE}/Warehouses`)
    ]);

    const movements  = (await movRes.json()).value;
    const products   = (await prodRes.json()).value;
    const orders     = (await orderRes.json()).value;
    const warehouses = (await whRes.json()).value;

    // Calculate stock per product
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

    // KPIs
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
  new Chart(document.getElementById('stockChart'), {
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
  const byDate = {};
  movements.forEach(m => {
    const date = m.movedAt?.split('T')[0];
    if (!date) return;
    if (!byDate[date]) byDate[date] = { IN: 0, OUT: 0 };
    byDate[date][m.type] += m.quantity;
  });

  const labels = Object.keys(byDate).sort();

  new Chart(document.getElementById('trendChart'), {
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

loadDashboard();