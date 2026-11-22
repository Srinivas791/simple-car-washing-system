/**
 * HydroShine State Store
 * Handles localStorage persistence, state synchronization, and custom pub/sub events.
 */

class CarWashStore {
  constructor() {
    this.STORAGE_KEY = 'HYDROSHINE_BOOKINGS_V1';
    this.listeners = new Map();
    this.init();
  }

  init() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(window.CarWashData.INITIAL_BOOKINGS));
    this.emit('bookings_updated', this.getAllBookings());
  }

  getAllBookings() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to parse bookings from localStorage', e);
      return [];
    }
  }

  getBookingByIdOrPlate(query) {
    if (!query) return null;
    const cleanQuery = query.trim().toUpperCase().replace(/[\s-]/g, '');
    const bookings = this.getAllBookings();

    return bookings.find(b => {
      const bId = (b.id || '').toUpperCase().replace(/[\s-]/g, '');
      const bPlate = (b.licensePlate || '').toUpperCase().replace(/[\s-]/g, '');
      const bPhone = (b.customerPhone || '').replace(/\D/g, '');
      const cleanQDigits = cleanQuery.replace(/\D/g, '');

      return bId === cleanQuery || 
             bPlate === cleanQuery || 
             (cleanQDigits.length >= 7 && bPhone.endsWith(cleanQDigits));
    }) || null;
  }

  createBooking(bookingInput) {
    const bookings = this.getAllBookings();
    
    // Generate unique ID like HS-4982
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `HS-${randomSuffix}`;

    const newBooking = {
      id: newId,
      createdAt: new Date().toISOString(),
      status: 'queued',
      bayNumber: 'Queue Bay 1',
      technician: 'Assigned on arrival',
      ...bookingInput
    };

    bookings.unshift(newBooking);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));
    this.emit('bookings_updated', bookings);
    this.emit('booking_created', newBooking);

    return newBooking;
  }

  updateBooking(id, partial) {
    const bookings = this.getAllBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) return null;

    bookings[index] = { ...bookings[index], ...partial, updatedAt: new Date().toISOString() };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));
    this.emit('bookings_updated', bookings);
    this.emit('booking_changed', bookings[index]);
    return bookings[index];
  }

  updateStatus(id, newStatus) {
    const current = this.getAllBookings().find(b => b.id === id);
    if (!current) return null;

    let bay = current.bayNumber;
    let tech = current.technician;

    if (newStatus === 'washing' && bay.includes('Queue')) {
      bay = 'Bay 1';
      tech = tech.includes('Assigned') ? 'Sam Chen' : tech;
    } else if (newStatus === 'detailing' && bay.includes('Queue')) {
      bay = 'Bay 2';
      tech = tech.includes('Assigned') ? 'Alex Rivera' : tech;
    } else if (newStatus === 'ready') {
      bay = 'Pickup Lounge';
    }

    return this.updateBooking(id, { status: newStatus, bayNumber: bay, technician: tech });
  }

  deleteBooking(id) {
    let bookings = this.getAllBookings();
    bookings = bookings.filter(b => b.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));
    this.emit('bookings_updated', bookings);
  }

  // Pub/Sub
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => {
      const list = this.listeners.get(event) || [];
      this.listeners.set(event, list.filter(cb => cb !== callback));
    };
  }

  emit(event, payload) {
    const list = this.listeners.get(event) || [];
    list.forEach(cb => {
      try {
        cb(payload);
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err);
      }
    });
  }
}

window.carWashStore = new CarWashStore();
