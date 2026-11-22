/**
 * HydroShine Live Wash Tracker
 * Allows customers to track vehicle progress in real-time across wash bays.
 */

class LiveTracker {
  constructor() {
    this.currentTrackedId = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    
    // Auto-listen to store changes
    window.carWashStore.subscribe('bookings_updated', () => {
      if (this.currentTrackedId) {
        this.search(this.currentTrackedId, false);
      }
    });

    // Default search with first active booking if available
    const firstActive = window.carWashStore.getAllBookings()[0];
    if (firstActive) {
      this.search(firstActive.id, false);
      const input = document.getElementById('tracker-search-input');
      if (input) input.value = firstActive.id;
    }
  }

  setupEventListeners() {
    const searchBtn = document.getElementById('tracker-search-btn');
    const searchInput = document.getElementById('tracker-search-input');

    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', () => {
        this.search(searchInput.value.trim());
      });

      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.search(searchInput.value.trim());
        }
      });
    }

    // Demo pills
    document.querySelectorAll('.demo-track-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const query = pill.getAttribute('data-query');
        if (query) {
          if (searchInput) searchInput.value = query;
          this.search(query);
        }
      });
    });
  }

  search(query, showFeedback = true) {
    if (!query) {
      if (showFeedback) window.showToast?.('Please enter a Booking ID or License Plate', 'warning');
      return;
    }

    const booking = window.carWashStore.getBookingByIdOrPlate(query);
    const resultContainer = document.getElementById('tracker-result-card');
    const emptyState = document.getElementById('tracker-empty-state');

    if (!booking) {
      if (resultContainer) resultContainer.classList.add('hidden');
      if (emptyState) {
        emptyState.classList.remove('hidden');
        emptyState.innerHTML = `
          <div class="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-3xl">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h4 class="text-lg font-bold text-white mb-1">No Active Booking Found</h4>
            <p class="text-sm text-slate-400 max-w-md mx-auto">We couldn't locate any vehicle with reference "<strong class="text-amber-400">${query}</strong>". Please verify your booking ID or license plate.</p>
          </div>
        `;
      }
      return;
    }

    this.currentTrackedId = booking.id;
    if (emptyState) emptyState.classList.add('hidden');
    if (resultContainer) {
      resultContainer.classList.remove('hidden');
      this.renderTrackerDetails(booking);
    }
  }

  renderTrackerDetails(booking) {
    const pkg = window.CarWashData.PACKAGES.find(p => p.id === booking.packageId);
    const vehicle = window.CarWashData.VEHICLE_TYPES.find(v => v.id === booking.vehicleType);
    const statusMeta = window.CarWashData.WASH_STATUSES[booking.status.toUpperCase()] || window.CarWashData.WASH_STATUSES.QUEUED;

    // Define the sequence of wash stages
    const stages = [
      { key: 'queued', label: 'Queued & Inspection', icon: 'fa-clipboard-check', desc: 'Pre-wash check & queue assignment' },
      { key: 'washing', label: 'Foam Bath & Rinse', icon: 'fa-soap', desc: 'High-pressure wash & wheel scrub' },
      { key: 'detailing', label: 'Interior & Detailing', icon: 'fa-brush', desc: 'Deep vacuum & surface treat' },
      { key: 'drying', label: 'Ceramic Seal & Buff', icon: 'fa-wind', desc: 'Hydrophobic gloss & streak-free dry' },
      { key: 'ready', label: 'Ready for Pickup', icon: 'fa-circle-check', desc: 'Vehicle in inspection lounge' }
    ];

    const currentStageIndex = stages.findIndex(s => s.key === booking.status);
    const isCompleted = booking.status === 'completed';

    // Calculate stage completion percentage
    let progressPercent = 10;
    if (isCompleted) {
      progressPercent = 100;
    } else if (currentStageIndex >= 0) {
      progressPercent = Math.round(((currentStageIndex + 1) / stages.length) * 100);
    }

    const container = document.getElementById('tracker-result-card');
    if (!container) return;

    container.innerHTML = `
      <div class="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <!-- Accent Glow -->
        <div class="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 relative z-10">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <span class="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                ${booking.id}
              </span>
              <span class="text-xs font-semibold px-3 py-1 rounded-lg border ${statusMeta.color} flex items-center gap-1.5">
                <i class="fa-solid ${statusMeta.icon}"></i>
                ${statusMeta.label}
              </span>
            </div>
            <h3 class="text-2xl font-black text-white">${booking.vehicleModel}</h3>
            <p class="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Plate: <strong class="text-slate-200 tracking-wider">${booking.licensePlate}</strong></span>
              <span>•</span>
              <span>Owner: <strong class="text-slate-200">${booking.customerName}</strong></span>
            </p>
          </div>

          <div class="flex items-center gap-3">
            <div class="bg-slate-800/70 border border-slate-700/60 rounded-2xl px-4 py-2.5 text-right">
              <span class="text-[11px] text-slate-400 block">Assigned Bay</span>
              <span class="text-sm font-bold text-cyan-400 flex items-center justify-end gap-1.5">
                <i class="fa-solid fa-warehouse text-xs"></i>
                ${booking.bayNumber || 'Bay 1'}
              </span>
            </div>
            <div class="bg-slate-800/70 border border-slate-700/60 rounded-2xl px-4 py-2.5 text-right">
              <span class="text-[11px] text-slate-400 block">Lead Specialist</span>
              <span class="text-sm font-bold text-white flex items-center justify-end gap-1.5">
                <i class="fa-solid fa-user-gear text-xs text-cyan-400"></i>
                ${booking.technician || 'Staff'}
              </span>
            </div>
          </div>
        </div>

        <!-- Progress Bar & Timeline -->
        <div class="py-8 relative z-10">
          <div class="flex items-center justify-between mb-3 text-xs">
            <span class="font-bold text-white flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Live Service Stage Progress
            </span>
            <span class="font-mono text-cyan-400 font-bold">${progressPercent}% Completed</span>
          </div>

          <!-- Horizontal Progress Track -->
          <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-8 p-0.5">
            <div class="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-700 ease-out" style="width: ${progressPercent}%;"></div>
          </div>

          <!-- Step Nodes -->
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            ${stages.map((st, idx) => {
              const isPast = currentStageIndex > idx || isCompleted;
              const isCurrent = currentStageIndex === idx && !isCompleted;
              
              let nodeStyle = 'border-slate-800 bg-slate-900/60 text-slate-500';
              let iconStyle = 'bg-slate-800 text-slate-400';
              
              if (isPast) {
                nodeStyle = 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400';
                iconStyle = 'bg-emerald-500 text-slate-950 font-bold';
              } else if (isCurrent) {
                nodeStyle = 'border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/20';
                iconStyle = 'bg-cyan-400 text-slate-950 font-bold animate-bounce';
              }

              return `
                <div class="p-3.5 rounded-2xl border transition-all ${nodeStyle}">
                  <div class="flex items-center gap-3 md:flex-col md:text-center md:gap-2">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconStyle}">
                      <i class="fa-solid ${isPast ? 'fa-check' : st.icon} text-sm"></i>
                    </div>
                    <div>
                      <h5 class="text-xs font-bold leading-tight ${isCurrent ? 'text-white' : ''}">${st.label}</h5>
                      <p class="text-[10px] text-slate-400 mt-0.5 leading-snug hidden sm:block">${st.desc}</p>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Service Specs Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 text-xs">
          <div class="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <span class="text-slate-400 block text-[11px] mb-1">Package Selected</span>
            <span class="font-bold text-white text-sm">${pkg?.name || 'Wash Package'}</span>
          </div>

          <div class="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <span class="text-slate-400 block text-[11px] mb-1">Total Bill</span>
            <span class="font-bold text-cyan-400 text-sm">$${booking.totalPrice?.toFixed(2)}</span>
          </div>

          <div class="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <span class="text-slate-400 block text-[11px] mb-1">Scheduled Time</span>
            <span class="font-bold text-white text-sm">${booking.bookingDate} @ ${booking.timeSlot}</span>
          </div>
        </div>

        ${booking.notes ? `
          <div class="mt-4 p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-300 flex items-start gap-2.5">
            <i class="fa-regular fa-message text-cyan-400 mt-0.5"></i>
            <div>
              <span class="font-bold text-slate-400 block text-[10px] uppercase tracking-wider">Customer Instructions</span>
              <p class="text-slate-300 italic">${booking.notes}</p>
            </div>
          </div>
        ` : ''}

        <!-- Actions -->
        <div class="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button onclick="window.printReceipt('${booking.id}')" class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-2">
            <i class="fa-solid fa-print"></i>
            Print Service Invoice
          </button>

          <a href="tel:+15551234567" class="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 transition flex items-center gap-2">
            <i class="fa-solid fa-phone"></i>
            Call Bay Advisor (+1 555-CAR-WASH)
          </a>
        </div>
      </div>
    `;
  }
}

window.LiveTracker = LiveTracker;
