# 🚗 HydroShine™ Auto Spa & Detailing System

A complete, high-performance web application for a modern **Car Washing & Auto Detailing System**. Features an interactive multi-step booking engine, real-time live wash bay telemetry tracker, and a comprehensive Staff/Operator Admin Console.

---

## 🌟 Key Features

### 1. 🧼 Customer Experience Portal
- **Service Package Catalog**:
  - Express Foam Wash (~20 min)
  - Deluxe Interior & Exterior (~45 min)
  - Ceramic Shield & Wax (~70 min)
  - Royal Concierge Detailing (~120 min)
- **Interactive Multi-Step Booking Wizard**:
  - **Step 1: Vehicle Dimensions**: Dynamic pricing adjustments for Sedans, Hatchbacks, SUVs, and Heavy Trucks.
  - **Step 2: Service & Add-Ons**: Live subtotal calculator with options like Engine Bay Steam, Heavy Pet Hair Removal, Ozone Sanitization, Rain-X Treatment, and Undercarriage Mud Blast.
  - **Step 3: Scheduling**: Real-time date picker and morning/afternoon/evening time slots.
  - **Step 4: Contact & Car Information**: Customer name, phone, license plate, color, and custom paint/wrap instructions.
  - **Instant Booking Confirmation**: Generates a unique reference code (`HS-XXXX`) and triggers confetti feedback with an interactive digital booking pass.

### 2. 📡 Live Bay Status Tracker
- Allows vehicle owners to enter their **Booking Reference** or **License Plate**.
- Visual interactive progress timeline through all 5 service stages:
  1. *Queued & Inspection*
  2. *Pre-Rinse & Snow Foam Bath*
  3. *Interior Vacuum & Detailing*
  4. *Ceramic Sealant & Warm Blow Dry*
  5. *Quality Inspected & Ready for Pickup*
- Live display of **Assigned Bay**, **Lead Detailing Specialist**, and **Estimated Duration**.
- Quick one-click testing pills (`HS-7841`, `HS-7842`, `HS-7843`, `HS-7844`).

### 3. 🛠️ Staff & Operator Management Console
- Easily accessible via the **"Staff Portal"** button in the header and footer.
- **Real-Time Bay Queue Table**:
  - View all queued, active, and completed cars.
  - Change stage status in real-time (instant synchronization with the customer live tracker).
  - Search by customer name, plate number, or booking reference.
  - Filter by stage (*All, Queued, Washing, Detailing, Ready*).
- **Quick Walk-In Drive-Through Modal**: Rapidly check in drive-up customers directly into Bay 1.
- **KPI Metrics**: Total Orders, Active Wash Bays, Ready for Pickup, and Today's Gross Revenue.
- **Analytics Charts**: Gross revenue breakdown by package and bay volume distribution powered by Chart.js.
- **Export to CSV**: Download the complete operational log for accounting.
- **Reset Demo Data**: Easily restore initial realistic sample bookings.

### 4. 🧾 Printable Invoice & Receipts
- Generate clean, formatted printable invoices with breakdown of services, taxes, vehicle details, and technician notes.

---

## 📁 File Structure

```
car washing system/
├── index.html            # Main Single-Page Application (Customer & Admin views)
├── css/
│   └── styles.css        # Custom styles, glow effects, glassmorphism, animations
├── js/
│   ├── data.js           # Packages, add-ons, vehicle types, and initial demo data
│   ├── store.js          # LocalStorage persistence, state manager, and pub/sub events
│   ├── booking.js        # Multi-step booking wizard engine & price calculator
│   ├── tracker.js        # Real-time customer bay status tracking engine
│   ├── admin.js          # Staff operator console, KPI metrics, charts & CSV export
│   └── app.js            # Main application coordinator, modals, toasts & navigation
└── README.md             # Project documentation
```

---

## 🚀 How to Run

No build step, Node.js, or complex server setup is required!

1. Open the project folder:
   ```
   c:\Users\Srinivas\OneDrive\Documents\Desktop\car washing system
   ```
2. Double-click **`index.html`** to launch it in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Safari).
3. Enjoy the complete interactive experience!
