/**
 * HydroShine Main Application Orchestrator
 * Navigation, views, modals, toasts, testimonials & initialization.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Toast Helper
  window.showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const colors = {
      success: 'border-emerald-500/50 bg-slate-900/95 text-emerald-400',
      error: 'border-rose-500/50 bg-slate-900/95 text-rose-400',
      warning: 'border-amber-500/50 bg-slate-900/95 text-amber-400',
      info: 'border-cyan-500/50 bg-slate-900/95 text-cyan-400'
    };

    const icons = {
      success: 'fa-circle-check',
      error: 'fa-circle-exclamation',
      warning: 'fa-triangle-exclamation',
      info: 'fa-circle-info'
    };

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 text-xs font-semibold ${colors[type] || colors.info}`;
    toast.innerHTML = `
      <i class="fa-solid ${icons[type] || icons.info} text-base shrink-0"></i>
      <span class="text-white">${message}</span>
    `;

    container.appendChild(toast);

    // Animation frame
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  };

  // Initialize Modules
  window.bookingEngine = new window.BookingEngine();
  window.liveTracker = new window.LiveTracker();
  window.adminDashboard = new window.AdminDashboard();

  // Testimonials Rendering
  renderTestimonials();

  // Navigation & View Toggling
  setupNavigation();

  // Print Invoice Handler
  setupPrintHandler();

  // Contact form submission
  setupContactForm();
});

function renderTestimonials() {
  const container = document.getElementById('testimonials-container');
  if (!container) return;

  container.innerHTML = window.CarWashData.TESTIMONIALS.map(t => `
    <div class="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between">
      <div>
        <div class="flex items-center gap-1 text-amber-400 text-xs mb-3">
          ${Array(t.rating).fill('<i class="fa-solid fa-star"></i>').join('')}
        </div>
        <p class="text-slate-300 text-sm leading-relaxed mb-6 italic">"${t.comment}"</p>
      </div>

      <div class="flex items-center gap-3 pt-4 border-t border-slate-800/60">
        <img src="${t.avatar}" alt="${t.name}" class="w-11 h-11 rounded-full object-cover border border-cyan-500/30">
        <div>
          <h5 class="text-sm font-bold text-white">${t.name}</h5>
          <span class="text-xs text-cyan-400 block">${t.role}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function setupNavigation() {
  const navCustomer = document.getElementById('view-customer');
  const navAdmin = document.getElementById('view-admin');
  const toggleAdminBtns = document.querySelectorAll('.toggle-admin-btn');
  const toggleCustomerBtns = document.querySelectorAll('.toggle-customer-btn');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  // Mobile drawer toggle
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // View togglers
  toggleAdminBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (navCustomer && navAdmin) {
        navCustomer.classList.add('hidden');
        navAdmin.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.showToast('Switched to Staff Operator Portal', 'info');
      }
    });
  });

  toggleCustomerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (navCustomer && navAdmin) {
        navAdmin.classList.add('hidden');
        navCustomer.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.showToast('Switched to Customer Experience Portal', 'info');
      }
    });
  });
}

function setupPrintHandler() {
  window.printReceipt = (bookingId) => {
    const booking = window.carWashStore.getAllBookings().find(b => b.id === bookingId);
    if (!booking) {
      window.showToast?.('Booking not found', 'error');
      return;
    }

    const pkg = window.CarWashData.PACKAGES.find(p => p.id === booking.packageId);
    const addons = (booking.addOnIds || []).map(id => {
      return window.CarWashData.ADDONS.find(a => a.id === id);
    }).filter(Boolean);

    // Open print window
    const printWindow = window.open('', '_blank', 'width=750,height=800');
    if (!printWindow) {
      window.showToast?.('Pop-up blocked. Please allow popups to print receipt.', 'warning');
      return;
    }

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${booking.id} - HydroShine Auto Spa</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-start; }
          .logo { font-size: 24px; font-weight: 900; color: #0284c7; letter-spacing: -0.5px; }
          .meta-box { margin-bottom: 30px; background: #f8fafc; padding: 15px; border-radius: 8px; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0; font-size: 13px; text-transform: uppercase; color: #64748b; }
          td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          .total-row { font-size: 18px; font-weight: bold; border-top: 2px solid #0f172a; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">HYDROSHINE AUTO SPA</div>
            <div style="font-size: 13px; color: #64748b;">Eco-Friendly Touchless Car Detailing</div>
            <div style="font-size: 12px; color: #64748b;">404 Metro Boulevard, Suite 100 • (555) CAR-WASH</div>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; font-size: 20px; color: #0f172a;">RECEIPT / INVOICE</h2>
            <div style="font-size: 14px; font-weight: bold; color: #0284c7; margin-top: 4px;">#${booking.id}</div>
            <div style="font-size: 12px; color: #64748b;">Issued: ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="meta-box">
          <table style="margin: 0;">
            <tr>
              <td><strong>Customer:</strong> ${booking.customerName}</td>
              <td><strong>Vehicle:</strong> ${booking.vehicleModel}</td>
            </tr>
            <tr>
              <td><strong>Phone:</strong> ${booking.customerPhone}</td>
              <td><strong>License Plate:</strong> ${booking.licensePlate}</td>
            </tr>
            <tr>
              <td><strong>Scheduled:</strong> ${booking.bookingDate} at ${booking.timeSlot}</td>
              <td><strong>Bay / Tech:</strong> ${booking.bayNumber} (${booking.technician})</td>
            </tr>
          </table>
        </div>

        <table>
          <thead>
            <tr>
              <th>Service Item</th>
              <th>Category</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${pkg?.name || 'Wash Package'}</strong></td>
              <td>Core Package (${booking.vehicleType.toUpperCase()})</td>
              <td style="text-align: right;">$${(booking.totalPrice * 0.85).toFixed(2)}</td>
            </tr>
            ${addons.map(a => `
              <tr>
                <td>${a.name}</td>
                <td>Add-on Service</td>
                <td style="text-align: right;">$${a.price.toFixed(2)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="2" style="text-align: right; padding-top: 16px;">Total Paid / Due:</td>
              <td style="text-align: right; padding-top: 16px; color: #0284c7;">$${booking.totalPrice.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Thank you for choosing HydroShine Auto Spa! Your vehicle is protected with biodegradable ceramic formula.</p>
          <p>Track your wash live at <strong>www.hydroshine-spa.com/track</strong></p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  // Close receipt modal
  document.getElementById('close-receipt-modal-btn')?.addEventListener('click', () => {
    const modal = document.getElementById('booking-receipt-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  });
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      window.showToast('Thank you! Your inquiry has been sent to our bay concierge.', 'success');
      form.reset();
    });
  }
}
