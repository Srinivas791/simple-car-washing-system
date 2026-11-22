/**
 * HydroShine Admin & Bay Operations Dashboard
 * Handles live bay management, status transitions, KPI metrics, charts, and CSV export.
 */

class AdminDashboard {
  constructor() {
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.revenueChart = null;
    this.volumeChart = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderKPIs();
    this.renderQueueTable();
    this.initCharts();

    // Re-render when store updates
    window.carWashStore.subscribe('bookings_updated', () => {
      this.renderKPIs();
      this.renderQueueTable();
      this.updateCharts();
    });
  }

  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('admin-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.renderQueueTable();
      });
    }

    // Filter pills
    document.querySelectorAll('.admin-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.admin-filter-btn').forEach(b => {
          b.classList.remove('bg-cyan-500', 'text-slate-950', 'font-bold');
          b.classList.add('bg-slate-800', 'text-slate-300');
        });
        btn.classList.add('bg-cyan-500', 'text-slate-950', 'font-bold');
        btn.classList.remove('bg-slate-800', 'text-slate-300');

        this.currentFilter = btn.getAttribute('data-status') || 'all';
        this.renderQueueTable();
      });
    });

    // Reset Demo Data
    document.getElementById('admin-reset-demo-btn')?.addEventListener('click', () => {
      if (confirm('Reset queue and demo bookings back to initial defaults?')) {
        window.carWashStore.resetToDefaults();
        window.showToast?.('System reset to demo data', 'info');
      }
    });

    // Export CSV
    document.getElementById('admin-export-csv-btn')?.addEventListener('click', () => {
      this.exportCSV();
    });

    // Quick Walk-In Booking modal triggers
    const openWalkinBtn = document.getElementById('admin-open-walkin-btn');
    const closeWalkinBtn = document.getElementById('admin-close-walkin-btn');
    const walkinModal = document.getElementById('admin-walkin-modal');
    const walkinForm = document.getElementById('admin-walkin-form');

    if (openWalkinBtn && walkinModal) {
      openWalkinBtn.addEventListener('click', () => {
        walkinModal.classList.remove('hidden');
        walkinModal.classList.add('flex');
      });
    }

    if (closeWalkinBtn && walkinModal) {
      closeWalkinBtn.addEventListener('click', () => {
        walkinModal.classList.add('hidden');
        walkinModal.classList.remove('flex');
      });
    }

    if (walkinForm) {
      walkinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleWalkinSubmit();
      });
    }
  }

  handleWalkinSubmit() {
    const name = document.getElementById('walkin-name').value.trim();
    const plate = document.getElementById('walkin-plate').value.trim().toUpperCase();
    const model = document.getElementById('walkin-model').value.trim() || 'Drive-in Vehicle';
    const pkgId = document.getElementById('walkin-package').value;
    const vehicleType = document.getElementById('walkin-vehicle-type').value;

    if (!name || !plate) {
      window.showToast?.('Please fill name and license plate', 'warning');
      return;
    }

    const pkg = window.CarWashData.PACKAGES.find(p => p.id === pkgId);
    const vehicle = window.CarWashData.VEHICLE_TYPES.find(v => v.id === vehicleType);
    const mult = vehicle ? vehicle.multiplier : 1.0;
    const basePrice = (pkg ? pkg.basePrice : 29.99) * mult;
    const total = basePrice * 1.0825;

    const newBooking = window.carWashStore.createBooking({
      customerName: name,
      customerPhone: '+1 (Walk-In)',
      customerEmail: 'walkin@hydroshine.internal',
      vehicleType: vehicleType,
      vehicleModel: model,
      licensePlate: plate,
      packageId: pkgId,
      addOnIds: [],
      bookingDate: new Date().toISOString().split('T')[0],
      timeSlot: 'Walk-In Now',
      bayNumber: 'Bay 1',
      technician: 'Sam Chen',
      totalPrice: Number(total.toFixed(2)),
      status: 'washing',
      notes: 'Quick drive-up customer'
    });

    // Close modal
    const modal = document.getElementById('admin-walkin-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    // Reset form
    document.getElementById('admin-walkin-form')?.reset();
    window.showToast?.(`Walk-in added directly to Bay 1 (${newBooking.id})`, 'success');
  }

  renderKPIs() {
    const bookings = window.carWashStore.getAllBookings();

    const totalCount = bookings.length;
    const activeInBay = bookings.filter(b => ['washing', 'detailing', 'drying'].includes(b.status)).length;
    const readyCount = bookings.filter(b => b.status === 'ready').length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const updateEl = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    updateEl('kpi-total-orders', totalCount);
    updateEl('kpi-active-bays', `${activeInBay} Active`);
    updateEl('kpi-ready-pickup', readyCount);
    updateEl('kpi-revenue', `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  }

  renderQueueTable() {
    const tbody = document.getElementById('admin-queue-tbody');
    if (!tbody) return;

    let bookings = window.carWashStore.getAllBookings();

    // Filter by status
    if (this.currentFilter !== 'all') {
      bookings = bookings.filter(b => b.status === this.currentFilter);
    }

    // Search query
    if (this.searchQuery) {
      bookings = bookings.filter(b => 
        (b.id || '').toLowerCase().includes(this.searchQuery) ||
        (b.customerName || '').toLowerCase().includes(this.searchQuery) ||
        (b.licensePlate || '').toLowerCase().includes(this.searchQuery) ||
        (b.vehicleModel || '').toLowerCase().includes(this.searchQuery)
      );
    }

    if (bookings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-12 text-center text-slate-500 text-sm">
            <i class="fa-solid fa-folder-open text-2xl block mb-2 opacity-50"></i>
            No bookings found matching current filters.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = bookings.map(b => {
      const pkg = window.CarWashData.PACKAGES.find(p => p.id === b.packageId);
      const statusMeta = window.CarWashData.WASH_STATUSES[b.status.toUpperCase()] || window.CarWashData.WASH_STATUSES.QUEUED;

      return `
        <tr class="border-b border-slate-800/80 hover:bg-slate-800/30 transition text-xs">
          <!-- Booking ID & Date -->
          <td class="py-4 px-4 font-mono font-bold text-cyan-400">
            ${b.id}
            <span class="block text-[10px] text-slate-500 font-sans font-normal mt-0.5">${b.timeSlot}</span>
          </td>

          <!-- Customer -->
          <td class="py-4 px-4">
            <span class="font-bold text-white block">${b.customerName}</span>
            <span class="text-slate-400 text-[11px]">${b.customerPhone}</span>
          </td>

          <!-- Vehicle -->
          <td class="py-4 px-4">
            <span class="text-white font-medium block truncate max-w-[180px]">${b.vehicleModel}</span>
            <span class="inline-block mt-0.5 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] tracking-wider border border-slate-700">
              ${b.licensePlate}
            </span>
          </td>

          <!-- Service Package & Price -->
          <td class="py-4 px-4">
            <span class="font-semibold text-slate-200 block">${pkg?.name || 'Wash Package'}</span>
            <span class="font-mono text-cyan-400 font-bold">$${b.totalPrice?.toFixed(2)}</span>
          </td>

          <!-- Bay & Tech -->
          <td class="py-4 px-4">
            <span class="text-slate-300 block font-medium">${b.bayNumber || 'Queue'}</span>
            <span class="text-[11px] text-slate-500">${b.technician || 'Staff'}</span>
          </td>

          <!-- Status Dropdown Selector -->
          <td class="py-4 px-4">
            <select class="status-selector bg-slate-900 border border-slate-700 text-xs rounded-xl px-2.5 py-1.5 font-semibold text-slate-200 focus:outline-none focus:border-cyan-500 transition" data-id="${b.id}">
              <option value="queued" ${b.status === 'queued' ? 'selected' : ''}>⏳ In Queue</option>
              <option value="washing" ${b.status === 'washing' ? 'selected' : ''}>🧼 Washing Bay</option>
              <option value="detailing" ${b.status === 'detailing' ? 'selected' : ''}>🖌️ Detailing</option>
              <option value="drying" ${b.status === 'drying' ? 'selected' : ''}>💨 Ceramic & Dry</option>
              <option value="ready" ${b.status === 'ready' ? 'selected' : ''}>✅ Ready for Pickup</option>
              <option value="completed" ${b.status === 'completed' ? 'selected' : ''}>🏁 Delivered</option>
            </select>
          </td>

          <!-- Action Buttons -->
          <td class="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
            <button onclick="window.printReceipt('${b.id}')" title="Print Invoice" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
              <i class="fa-solid fa-print"></i>
            </button>
            <button onclick="window.adminDashboard.deleteRecord('${b.id}')" title="Remove" class="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach listeners to status dropdowns
    tbody.querySelectorAll('.status-selector').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = sel.getAttribute('data-id');
        const newStatus = e.target.value;
        window.carWashStore.updateStatus(id, newStatus);
        window.showToast?.(`Booking ${id} status updated to: ${newStatus}`, 'success');
      });
    });
  }

  deleteRecord(id) {
    if (confirm(`Are you sure you want to delete booking ${id}?`)) {
      window.carWashStore.deleteBooking(id);
      window.showToast?.(`Deleted booking ${id}`, 'info');
    }
  }

  initCharts() {
    if (typeof Chart === 'undefined') return;

    const ctxRev = document.getElementById('chart-revenue');
    const ctxVol = document.getElementById('chart-volume');

    if (ctxRev) {
      this.revenueChart = new Chart(ctxRev, {
        type: 'doughnut',
        data: this.getRevenueChartData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#94a3b8', font: { size: 11 } }
            }
          },
          cutout: '70%'
        }
      });
    }

    if (ctxVol) {
      this.volumeChart = new Chart(ctxVol, {
        type: 'bar',
        data: this.getVolumeChartData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: { color: '#94a3b8' },
              grid: { color: 'rgba(51, 65, 85, 0.3)' }
            },
            y: {
              ticks: { color: '#94a3b8', stepSize: 1 },
              grid: { color: 'rgba(51, 65, 85, 0.3)' },
              beginAtZero: true
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  }

  getRevenueChartData() {
    const bookings = window.carWashStore.getAllBookings();
    const pkgRevenue = {};

    window.CarWashData.PACKAGES.forEach(p => { pkgRevenue[p.name] = 0; });

    bookings.forEach(b => {
      const pkg = window.CarWashData.PACKAGES.find(p => p.id === b.packageId);
      if (pkg) {
        pkgRevenue[pkg.name] = (pkgRevenue[pkg.name] || 0) + (b.totalPrice || 0);
      }
    });

    return {
      labels: Object.keys(pkgRevenue),
      datasets: [{
        data: Object.values(pkgRevenue),
        backgroundColor: [
          '#06b6d4', // cyan-500
          '#14b8a6', // teal-500
          '#f59e0b', // amber-500
          '#8b5cf6'  // violet-500
        ],
        borderWidth: 0
      }]
    };
  }

  getVolumeChartData() {
    const bookings = window.carWashStore.getAllBookings();
    const statusCounts = {
      'Queued': 0,
      'Washing': 0,
      'Detailing': 0,
      'Drying': 0,
      'Ready': 0,
      'Delivered': 0
    };

    bookings.forEach(b => {
      if (b.status === 'queued') statusCounts['Queued']++;
      else if (b.status === 'washing') statusCounts['Washing']++;
      else if (b.status === 'detailing') statusCounts['Detailing']++;
      else if (b.status === 'drying') statusCounts['Drying']++;
      else if (b.status === 'ready') statusCounts['Ready']++;
      else if (b.status === 'completed') statusCounts['Delivered']++;
    });

    return {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: '#06b6d4',
        borderRadius: 8
      }]
    };
  }

  updateCharts() {
    if (this.revenueChart) {
      this.revenueChart.data = this.getRevenueChartData();
      this.revenueChart.update();
    }
    if (this.volumeChart) {
      this.volumeChart.data = this.getVolumeChartData();
      this.volumeChart.update();
    }
  }

  exportCSV() {
    const bookings = window.carWashStore.getAllBookings();
    if (!bookings.length) {
      window.showToast?.('No records to export', 'warning');
      return;
    }

    const headers = ['Booking ID', 'Date', 'Time Slot', 'Customer', 'Phone', 'Vehicle', 'Plate', 'Package', 'Bay', 'Tech', 'Total USD', 'Status'];
    const rows = bookings.map(b => {
      const pkg = window.CarWashData.PACKAGES.find(p => p.id === b.packageId);
      return [
        b.id,
        b.bookingDate,
        b.timeSlot,
        `"${b.customerName}"`,
        `"${b.customerPhone}"`,
        `"${b.vehicleModel}"`,
        `"${b.licensePlate}"`,
        `"${pkg ? pkg.name : ''}"`,
        `"${b.bayNumber}"`,
        `"${b.technician}"`,
        b.totalPrice,
        b.status
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HydroShine_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.showToast?.('Exported bookings to CSV file', 'success');
  }
}

window.AdminDashboard = AdminDashboard;
