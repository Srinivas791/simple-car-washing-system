/**
 * HydroShine Booking Wizard Engine
 * Handles step navigation, reactive price calculation, validation & submission.
 */

class BookingEngine {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 4;
    
    // Booking Form State
    this.state = {
      vehicleType: 'sedan',
      packageId: 'deluxe',
      addOnIds: [],
      bookingDate: this.getDefaultDate(),
      timeSlot: '10:00 AM',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      vehicleModel: '',
      licensePlate: '',
      notes: ''
    };

    this.init();
  }

  getDefaultDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  init() {
    this.renderVehicleTypes();
    this.renderPackages();
    this.renderAddOns();
    this.renderTimeSlots();
    this.setupEventListeners();
    this.updateCalculation();
    this.updateStepUI();
  }

  setupEventListeners() {
    // Next/Prev buttons
    document.getElementById('wizard-next-btn')?.addEventListener('click', () => this.handleNext());
    document.getElementById('wizard-prev-btn')?.addEventListener('click', () => this.handlePrev());
    document.getElementById('wizard-submit-btn')?.addEventListener('click', () => this.handleSubmit());

    // Date picker
    const dateInput = document.getElementById('booking-date-input');
    if (dateInput) {
      dateInput.min = this.getDefaultDate();
      dateInput.value = this.state.bookingDate;
      dateInput.addEventListener('change', (e) => {
        this.state.bookingDate = e.target.value;
        this.updateCalculation();
      });
    }

    // Input fields for step 4
    const bindInput = (id, prop) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => {
          this.state[prop] = e.target.value;
        });
      }
    };

    bindInput('input-name', 'customerName');
    bindInput('input-phone', 'customerPhone');
    bindInput('input-email', 'customerEmail');
    bindInput('input-vehicle-model', 'vehicleModel');
    bindInput('input-license-plate', 'licensePlate');
    bindInput('input-notes', 'notes');
  }

  renderVehicleTypes() {
    const container = document.getElementById('vehicle-types-container');
    if (!container) return;

    container.innerHTML = window.CarWashData.VEHICLE_TYPES.map(vt => {
      const isSelected = this.state.vehicleType === vt.id;
      return `
        <div class="vehicle-card group cursor-pointer relative p-5 rounded-2xl border-2 transition-all duration-300 ${
          isSelected 
            ? 'border-cyan-500 bg-cyan-950/20 shadow-lg shadow-cyan-500/10' 
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
        }" data-vehicle-id="${vt.id}">
          <div class="flex items-center justify-between mb-3">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
              isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-cyan-400 group-hover:bg-slate-700'
            }">
              <i class="fa-solid ${vt.icon}"></i>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${
              vt.multiplier > 1.0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }">
              ${vt.multiplier === 1.0 ? 'Standard Size' : vt.multiplier < 1.0 ? '-10% Discount' : `+${Math.round((vt.multiplier - 1) * 100)}% Large`}
            </span>
          </div>
          <h4 class="font-bold text-white text-base mb-1">${vt.name}</h4>
          <p class="text-xs text-slate-400 leading-relaxed">${vt.description}</p>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.vehicle-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-vehicle-id');
        this.state.vehicleType = id;
        this.renderVehicleTypes();
        this.renderPackages();
        this.updateCalculation();
      });
    });
  }

  getVehicleMultiplier() {
    const v = window.CarWashData.VEHICLE_TYPES.find(item => item.id === this.state.vehicleType);
    return v ? v.multiplier : 1.0;
  }

  renderPackages() {
    const container = document.getElementById('packages-container');
    if (!container) return;

    const mult = this.getVehicleMultiplier();

    container.innerHTML = window.CarWashData.PACKAGES.map(pkg => {
      const isSelected = this.state.packageId === pkg.id;
      const adjustedPrice = (pkg.basePrice * mult).toFixed(2);

      return `
        <div class="package-card cursor-pointer relative p-5 rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between ${
          isSelected 
            ? 'border-cyan-400 bg-gradient-to-b from-cyan-950/40 to-slate-900 shadow-xl shadow-cyan-500/15' 
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
        }" data-pkg-id="${pkg.id}">
          <div>
            <div class="flex justify-between items-start mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-800/40">
                ${pkg.badge}
              </span>
              <span class="text-xs text-slate-400 flex items-center gap-1">
                <i class="fa-regular fa-clock"></i> ~${pkg.estimatedMinutes}m
              </span>
            </div>
            <h4 class="text-lg font-bold text-white mt-2">${pkg.name}</h4>
            <p class="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">${pkg.tagline}</p>
            
            <div class="flex items-baseline gap-1 my-3">
              <span class="text-3xl font-extrabold text-white tracking-tight">$${adjustedPrice}</span>
              <span class="text-xs text-slate-400">/ wash</span>
            </div>

            <ul class="space-y-2 mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
              ${pkg.features.map(f => `
                <li class="flex items-center gap-2">
                  <i class="fa-solid fa-check text-cyan-400 text-[11px] shrink-0"></i>
                  <span>${f}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div class="mt-6 pt-2">
            <button class="w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 ${
              isSelected 
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25 font-bold' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }">
              <i class="fa-solid ${isSelected ? 'fa-circle-check' : 'fa-circle'}"></i>
              ${isSelected ? 'Selected Package' : 'Choose Package'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.package-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-pkg-id');
        this.state.packageId = id;
        this.renderPackages();
        this.updateCalculation();
      });
    });
  }

  renderAddOns() {
    const container = document.getElementById('addons-container');
    if (!container) return;

    container.innerHTML = window.CarWashData.ADDONS.map(addon => {
      const isChecked = this.state.addOnIds.includes(addon.id);
      return `
        <label class="addon-item flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
          isChecked 
            ? 'border-cyan-500/70 bg-cyan-950/20 shadow-md shadow-cyan-500/5' 
            : 'border-slate-800/90 bg-slate-900/50 hover:border-slate-700'
        }">
          <input type="checkbox" value="${addon.id}" ${isChecked ? 'checked' : ''} class="addon-checkbox mt-1 w-4 h-4 rounded text-cyan-500 bg-slate-800 border-slate-700 focus:ring-cyan-500/40">
          <div class="flex-1">
            <div class="flex justify-between items-center mb-1">
              <span class="font-semibold text-sm text-white flex items-center gap-2">
                <i class="fa-solid ${addon.icon} text-cyan-400 text-xs"></i>
                ${addon.name}
              </span>
              <span class="text-xs font-bold text-cyan-300">+$${addon.price.toFixed(2)}</span>
            </div>
            <p class="text-xs text-slate-400 leading-snug">${addon.description}</p>
          </div>
        </label>
      `;
    }).join('');

    container.querySelectorAll('.addon-checkbox').forEach(input => {
      input.addEventListener('change', (e) => {
        const id = e.target.value;
        if (e.target.checked) {
          if (!this.state.addOnIds.includes(id)) this.state.addOnIds.push(id);
        } else {
          this.state.addOnIds = this.state.addOnIds.filter(x => x !== id);
        }
        this.renderAddOns();
        this.updateCalculation();
      });
    });
  }

  renderTimeSlots() {
    const container = document.getElementById('time-slots-container');
    if (!container) return;

    container.innerHTML = window.CarWashData.TIME_SLOTS.map(slot => {
      const isSelected = this.state.timeSlot === slot;
      return `
        <button type="button" class="timeslot-btn py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
          isSelected 
            ? 'border-cyan-400 bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' 
            : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
        }" data-slot="${slot}">
          ${slot}
        </button>
      `;
    }).join('');

    container.querySelectorAll('.timeslot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.state.timeSlot = btn.getAttribute('data-slot');
        this.renderTimeSlots();
        this.updateCalculation();
      });
    });
  }

  calculateTotal() {
    const mult = this.getVehicleMultiplier();
    const pkg = window.CarWashData.PACKAGES.find(p => p.id === this.state.packageId) || window.CarWashData.PACKAGES[0];
    const packageSubtotal = pkg.basePrice * mult;

    let addonsSubtotal = 0;
    let totalMinutes = pkg.estimatedMinutes;

    this.state.addOnIds.forEach(addonId => {
      const item = window.CarWashData.ADDONS.find(a => a.id === addonId);
      if (item) {
        addonsSubtotal += item.price;
        totalMinutes += item.duration;
      }
    });

    const tax = (packageSubtotal + addonsSubtotal) * 0.0825; // 8.25% standard service tax
    const grandTotal = packageSubtotal + addonsSubtotal + tax;

    return {
      packageSubtotal,
      addonsSubtotal,
      tax,
      grandTotal,
      totalMinutes,
      packageName: pkg.name
    };
  }

  updateCalculation() {
    const calc = this.calculateTotal();

    // Summary banner & side panel elements
    const elements = {
      'calc-pkg-name': calc.packageName,
      'calc-pkg-price': `$${calc.packageSubtotal.toFixed(2)}`,
      'calc-addons-price': `$${calc.addonsSubtotal.toFixed(2)}`,
      'calc-tax': `$${calc.tax.toFixed(2)}`,
      'calc-grand-total': `$${calc.grandTotal.toFixed(2)}`,
      'calc-estimated-time': `~${calc.totalMinutes} mins`,
      'summary-selected-vehicle': window.CarWashData.VEHICLE_TYPES.find(v => v.id === this.state.vehicleType)?.name || 'Sedan',
      'summary-selected-date': `${this.state.bookingDate} at ${this.state.timeSlot}`
    };

    for (const [id, val] of Object.entries(elements)) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    }
  }

  handleNext() {
    if (this.currentStep === 1) {
      if (!this.state.vehicleType) {
        window.showToast?.('Please select your vehicle type', 'warning');
        return;
      }
    } else if (this.currentStep === 2) {
      if (!this.state.packageId) {
        window.showToast?.('Please select a wash package', 'warning');
        return;
      }
    } else if (this.currentStep === 3) {
      if (!this.state.bookingDate || !this.state.timeSlot) {
        window.showToast?.('Please pick a date and time slot', 'warning');
        return;
      }
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.updateStepUI();
      // Scroll to wizard top
      document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  handlePrev() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateStepUI();
    }
  }

  updateStepUI() {
    // Hide all steps, show current
    for (let i = 1; i <= this.totalSteps; i++) {
      const stepEl = document.getElementById(`wizard-step-${i}`);
      const stepPill = document.getElementById(`step-indicator-${i}`);
      
      if (stepEl) {
        if (i === this.currentStep) {
          stepEl.classList.remove('hidden');
        } else {
          stepEl.classList.add('hidden');
        }
      }

      if (stepPill) {
        if (i === this.currentStep) {
          stepPill.className = 'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30';
        } else if (i < this.currentStep) {
          stepPill.className = 'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm bg-emerald-500 text-slate-950';
          stepPill.innerHTML = '<i class="fa-solid fa-check"></i>';
        } else {
          stepPill.className = 'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm bg-slate-800 text-slate-400 border border-slate-700';
          stepPill.textContent = `${i}`;
        }
      }
    }

    // Buttons visibility
    const prevBtn = document.getElementById('wizard-prev-btn');
    const nextBtn = document.getElementById('wizard-next-btn');
    const submitBtn = document.getElementById('wizard-submit-btn');

    if (prevBtn) {
      prevBtn.style.visibility = this.currentStep === 1 ? 'hidden' : 'visible';
    }

    if (this.currentStep === this.totalSteps) {
      if (nextBtn) nextBtn.classList.add('hidden');
      if (submitBtn) submitBtn.classList.remove('hidden');
      this.populateReviewStep();
    } else {
      if (nextBtn) nextBtn.classList.remove('hidden');
      if (submitBtn) submitBtn.classList.add('hidden');
    }
  }

  populateReviewStep() {
    const calc = this.calculateTotal();
    const pkg = window.CarWashData.PACKAGES.find(p => p.id === this.state.packageId);
    const vehicle = window.CarWashData.VEHICLE_TYPES.find(v => v.id === this.state.vehicleType);
    
    const reviewBox = document.getElementById('wizard-review-summary');
    if (!reviewBox) return;

    const addonsText = this.state.addOnIds.length > 0 
      ? this.state.addOnIds.map(id => {
          const a = window.CarWashData.ADDONS.find(item => item.id === id);
          return `<span class="inline-block bg-slate-800 border border-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-lg mr-1 mb-1">+ ${a.name} ($${a.price.toFixed(2)})</span>`;
        }).join('') 
      : '<span class="text-xs text-slate-500 italic">No add-ons selected</span>';

    reviewBox.innerHTML = `
      <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div class="flex justify-between items-center border-b border-slate-800/80 pb-3">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-car text-cyan-400"></i>
            <span class="text-xs text-slate-400 uppercase font-semibold">Service Details</span>
          </div>
          <span class="text-sm font-bold text-white">${pkg?.name}</span>
        </div>

        <div class="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span class="text-slate-400 block mb-0.5">Vehicle Category</span>
            <span class="text-white font-medium">${vehicle?.name}</span>
          </div>
          <div>
            <span class="text-slate-400 block mb-0.5">Slot Scheduled</span>
            <span class="text-cyan-400 font-semibold">${this.state.bookingDate} at ${this.state.timeSlot}</span>
          </div>
        </div>

        <div>
          <span class="text-slate-400 text-xs block mb-1.5">Selected Add-ons</span>
          <div class="flex flex-wrap">${addonsText}</div>
        </div>

        <div class="pt-3 border-t border-slate-800/80 flex justify-between items-center">
          <span class="text-xs text-slate-400">Estimated Duration: <strong class="text-white">~${calc.totalMinutes} mins</strong></span>
          <div class="text-right">
            <span class="text-xs text-slate-400 block">Total Payable on Site</span>
            <span class="text-2xl font-black text-cyan-400">$${calc.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  }

  handleSubmit() {
    // Validation
    if (!this.state.customerName.trim()) {
      window.showToast?.('Please enter your full name', 'error');
      document.getElementById('input-name')?.focus();
      return;
    }

    if (!this.state.customerPhone.trim() || this.state.customerPhone.length < 7) {
      window.showToast?.('Please enter a valid phone number', 'error');
      document.getElementById('input-phone')?.focus();
      return;
    }

    if (!this.state.licensePlate.trim()) {
      window.showToast?.('Please enter your vehicle license plate', 'error');
      document.getElementById('input-license-plate')?.focus();
      return;
    }

    const calc = this.calculateTotal();

    const bookingPayload = {
      customerName: this.state.customerName.trim(),
      customerPhone: this.state.customerPhone.trim(),
      customerEmail: this.state.customerEmail.trim() || 'Not provided',
      vehicleType: this.state.vehicleType,
      vehicleModel: this.state.vehicleModel.trim() || 'Customer Vehicle',
      licensePlate: this.state.licensePlate.trim().toUpperCase(),
      packageId: this.state.packageId,
      addOnIds: [...this.state.addOnIds],
      bookingDate: this.state.bookingDate,
      timeSlot: this.state.timeSlot,
      totalPrice: Number(calc.grandTotal.toFixed(2)),
      durationMinutes: calc.totalMinutes,
      notes: this.state.notes.trim()
    };

    const created = window.carWashStore.createBooking(bookingPayload);

    // Fire Confetti!
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    // Show Confirmation Modal
    this.showConfirmationModal(created);

    // Reset wizard
    this.resetWizard();
  }

  resetWizard() {
    this.currentStep = 1;
    this.state.addOnIds = [];
    this.state.customerName = '';
    this.state.customerPhone = '';
    this.state.customerEmail = '';
    this.state.vehicleModel = '';
    this.state.licensePlate = '';
    this.state.notes = '';

    ['input-name', 'input-phone', 'input-email', 'input-vehicle-model', 'input-license-plate', 'input-notes'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    this.renderAddOns();
    this.updateCalculation();
    this.updateStepUI();
  }

  showConfirmationModal(booking) {
    const modal = document.getElementById('booking-receipt-modal');
    if (!modal) return;

    const pkg = window.CarWashData.PACKAGES.find(p => p.id === booking.packageId);
    const vehicle = window.CarWashData.VEHICLE_TYPES.find(v => v.id === booking.vehicleType);

    document.getElementById('receipt-booking-id').textContent = booking.id;
    document.getElementById('receipt-customer-name').textContent = booking.customerName;
    document.getElementById('receipt-vehicle-info').textContent = `${booking.vehicleModel} (${booking.licensePlate})`;
    document.getElementById('receipt-package-name').textContent = pkg?.name || 'Wash Package';
    document.getElementById('receipt-slot-info').textContent = `${booking.bookingDate} at ${booking.timeSlot}`;
    document.getElementById('receipt-total-amount').textContent = `$${booking.totalPrice.toFixed(2)}`;
    document.getElementById('receipt-bay-info').textContent = booking.bayNumber;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Wire up buttons
    const trackNowBtn = document.getElementById('receipt-track-now-btn');
    if (trackNowBtn) {
      trackNowBtn.onclick = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        window.location.hash = '#tracker';
        const trackerInput = document.getElementById('tracker-search-input');
        if (trackerInput) {
          trackerInput.value = booking.id;
          window.liveTracker?.search(booking.id);
        }
      };
    }
  }
}

window.BookingEngine = BookingEngine;
