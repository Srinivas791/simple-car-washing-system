/**
 * HydroShine Auto Spa & Detailing System
 * Central Mock Data & Configuration
 */

const VEHICLE_TYPES = [
  {
    id: 'sedan',
    name: 'Sedan / Coupe',
    icon: 'fa-car-side',
    multiplier: 1.0,
    description: 'Standard 4-door passenger cars and sports coupes'
  },
  {
    id: 'hatchback',
    name: 'Hatchback / Compact',
    icon: 'fa-car',
    multiplier: 0.9,
    description: 'Compact cars, mini crossovers and city vehicles'
  },
  {
    id: 'suv',
    name: 'SUV / Crossover',
    icon: 'fa-truck-monster',
    multiplier: 1.25,
    description: 'Compact to mid-size SUVs, station wagons'
  },
  {
    id: 'truck',
    name: 'Truck / Large Van',
    icon: 'fa-truck-pickup',
    multiplier: 1.45,
    description: 'Heavy duty pickups, 7-seater large SUVs, minivans'
  }
];

const PACKAGES = [
  {
    id: 'express',
    name: 'Express Foam Wash',
    tagline: 'Quick exterior refresh for daily drivers',
    basePrice: 24.99,
    estimatedMinutes: 20,
    popular: false,
    badge: 'Quick & Clean',
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Touchless high-pressure pre-rinse',
      'pH-balanced snow foam shampoo wash',
      'Wheel face degreasing & tire rinse',
      'Spot-free reverse osmosis rinse',
      'Warm air blow dry & microfiber buff'
    ]
  },
  {
    id: 'deluxe',
    name: 'Deluxe Interior & Exterior',
    tagline: 'Complete in-and-out care for high comfort',
    basePrice: 49.99,
    estimatedMinutes: 45,
    popular: true,
    badge: 'Most Popular',
    color: 'from-cyan-500 to-teal-500',
    features: [
      'Everything in Express Foam Wash',
      'Deep interior cabin & trunk vacuum',
      'Dashboard, console & vinyl wipe down',
      'Interior & exterior crystal glass polish',
      'Tire dress & deep wet gloss shine',
      'Fresh scented cabin air freshener'
    ]
  },
  {
    id: 'ceramic',
    name: 'Ceramic Shield & Wax',
    tagline: 'Long-lasting hydrophobic gloss and UV shield',
    basePrice: 89.99,
    estimatedMinutes: 70,
    popular: false,
    badge: 'Ultimate Gloss',
    color: 'from-amber-500 to-orange-500',
    features: [
      'Everything in Deluxe Package',
      'Hand-applied synthetic ceramic spray wax',
      'Rim iron decontaminant & inner barrel scrub',
      'Door jambs, boot hinges cleaned & dried',
      'Floor mats pressure washed & dried',
      '60-day hydrophobic water beading shield'
    ]
  },
  {
    id: 'royal',
    name: 'Royal Concierge Detailing',
    tagline: 'Showroom perfection: deep extraction & restoration',
    basePrice: 159.99,
    estimatedMinutes: 120,
    popular: false,
    badge: 'Showroom Level',
    color: 'from-purple-500 to-indigo-600',
    features: [
      'Everything in Ceramic Shield & Wax',
      'Full upholstery steam cleaning & shampoo',
      'Leather deep cleanse & restorative conditioner',
      'Engine bay degreasing & plastic dressing',
      'Headlight clarity touch-up polish',
      'Ozone interior anti-microbial disinfection'
    ]
  }
];

const ADDONS = [
  {
    id: 'engine_bay',
    name: 'Engine Bay Detailing',
    price: 29.99,
    icon: 'fa-cogs',
    duration: 15,
    description: 'Safe steam clean, oil residue degrease and silicone satin dress'
  },
  {
    id: 'pet_hair',
    name: 'Heavy Pet Hair Extraction',
    price: 24.99,
    icon: 'fa-paw',
    duration: 20,
    description: 'Specialized rubber combs and dual-motor vacuum for deep pet fur removal'
  },
  {
    id: 'ozone',
    name: 'Ozone Sanitization & Odor Kill',
    price: 19.99,
    icon: 'fa-shield-virus',
    duration: 15,
    description: 'Hospital-grade gas cycle that neutralizes bacteria, mold & smoke odors'
  },
  {
    id: 'rain_repel',
    name: 'Rain-X Ultra Glass Treatment',
    price: 14.99,
    icon: 'fa-cloud-rain',
    duration: 10,
    description: 'Repels heavy rain, sleet and bugs for crystal-clear storm driving'
  },
  {
    id: 'leather_care',
    name: 'Nourishing Leather Treatment',
    price: 22.99,
    icon: 'fa-couch',
    duration: 15,
    description: 'UV protection cream that restores soft touch and prevents cracking'
  },
  {
    id: 'undercarriage',
    name: 'Undercarriage Salt & Mud Blast',
    price: 12.99,
    icon: 'fa-water',
    duration: 10,
    description: 'High-pressure chassis wash removing road salts, winter brine and grit'
  }
];

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:00 PM', '06:00 PM'
];

const WASH_STATUSES = {
  QUEUED: { key: 'queued', label: 'In Queue', icon: 'fa-clock', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  WASHING: { key: 'washing', label: 'Pre-Rinse & Foam Bath', icon: 'fa-soap', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  DETAILING: { key: 'detailing', label: 'Interior & Detailing', icon: 'fa-brush', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  DRYING: { key: 'drying', label: 'Ceramic Coat & Drying', icon: 'fa-wind', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  READY: { key: 'ready', label: 'Ready for Pickup', icon: 'fa-circle-check', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  COMPLETED: { key: 'completed', label: 'Completed & Delivered', icon: 'fa-flag-checkered', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' }
};

const INITIAL_BOOKINGS = [
  {
    id: 'HS-7841',
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    customerName: 'Marcus Vance',
    customerPhone: '+1 (555) 234-8901',
    customerEmail: 'm.vance@example.com',
    vehicleType: 'suv',
    vehicleModel: 'Porsche Cayenne Turbo (Sapphire Blue)',
    licensePlate: '7XYZ890',
    packageId: 'ceramic',
    addOnIds: ['rain_repel', 'engine_bay'],
    bookingDate: new Date().toISOString().split('T')[0],
    timeSlot: '02:00 PM',
    bayNumber: 'Bay 2',
    technician: 'Alex Rivera',
    totalPrice: 157.48,
    status: 'detailing',
    notes: 'Please pay extra attention to brake dust on 21-inch rims.'
  },
  {
    id: 'HS-7842',
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    customerName: 'Elena Rostova',
    customerPhone: '+1 (555) 678-1234',
    customerEmail: 'elena.rostova@example.com',
    vehicleType: 'sedan',
    vehicleModel: 'Tesla Model 3 Long Range (Pearl White)',
    licensePlate: 'TES-2024',
    packageId: 'deluxe',
    addOnIds: ['pet_hair'],
    bookingDate: new Date().toISOString().split('T')[0],
    timeSlot: '03:00 PM',
    bayNumber: 'Bay 1',
    technician: 'Sam Chen',
    totalPrice: 74.98,
    status: 'washing',
    notes: 'Pet golden retriever fur in rear seating.'
  },
  {
    id: 'HS-7843',
    createdAt: new Date(Date.now() - 80 * 60000).toISOString(),
    customerName: 'David K. Miller',
    customerPhone: '+1 (555) 901-4567',
    customerEmail: 'dkmiller@example.com',
    vehicleType: 'truck',
    vehicleModel: 'Ford F-150 Raptor (Magnetic Gray)',
    licensePlate: 'RAP-991',
    packageId: 'royal',
    addOnIds: ['undercarriage', 'leather_care'],
    bookingDate: new Date().toISOString().split('T')[0],
    timeSlot: '11:00 AM',
    bayNumber: 'Bay 3',
    technician: 'Leo Martinez',
    totalPrice: 267.97,
    status: 'ready',
    notes: 'Muddy undercarriage from trail run.'
  },
  {
    id: 'HS-7844',
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    customerName: 'Sarah Jenkins',
    customerPhone: '+1 (555) 432-8765',
    customerEmail: 'sarah.j@example.com',
    vehicleType: 'hatchback',
    vehicleModel: 'Volkswagen Golf R (Lapiz Blue)',
    licensePlate: 'VW-404',
    packageId: 'express',
    addOnIds: [],
    bookingDate: new Date().toISOString().split('T')[0],
    timeSlot: '04:00 PM',
    bayNumber: 'Queue Area',
    technician: 'Pending Assignment',
    totalPrice: 22.49,
    status: 'queued',
    notes: 'Quick touch-up before airport trip.'
  }
];

const TESTIMONIALS = [
  {
    name: 'Julian Sterling',
    role: 'BMW M4 Competition Owner',
    rating: 5,
    comment: 'The touchless ceramic wash is genuinely second to none. Not a single swirl mark on my mineral gray paint, and the live status tracker let me sip coffee across the street without wondering when it was done.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    date: 'Yesterday'
  },
  {
    name: 'Melissa Thorne',
    role: 'Audi Q7 Family SUV',
    rating: 5,
    comment: 'With 3 kids and a Golden Retriever, my interior was chaotic. The Royal Concierge detail completely erased two years of spills and pet hair. It feels like driving off the dealership lot again!',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    date: '3 days ago'
  },
  {
    name: 'Robert C. Nguyen',
    role: 'Mercedes AMG GT-C',
    rating: 5,
    comment: 'Precision, punctuality, and eco-conscious water reclamation. As someone who is obsessive about car detailing, HydroShine is the only place in the metro area I trust with my vehicle.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    date: '1 week ago'
  }
];

// Export to window
window.CarWashData = {
  VEHICLE_TYPES,
  PACKAGES,
  ADDONS,
  TIME_SLOTS,
  WASH_STATUSES,
  INITIAL_BOOKINGS,
  TESTIMONIALS
};
