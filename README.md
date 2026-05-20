# AutoDealerReact

A mobile-first, high-performance used car dealership website built with React, Vite, Tailwind CSS, and Firebase. Designed as a production-ready template that can be deployed for any dealership by editing a single configuration file.

**[Live Demo](https://autodealer-dev.web.app)** · Built for Auto Nation — Youngstown, OH

---

## Screenshots

### Homepage — Hero with Scroll Animation
The hero section features a scroll-driven SVG car animation on desktop and an infinite vertical inventory carousel showcasing live inventory.

### Inventory Page
Filterable grid of available vehicles with dynamic make filter, condition badges, and spec pills.

### Vehicle Detail Page
Full image gallery with lightbox, swipe gestures, spec breakdown, and test drive request form.

### Admin Dashboard
Mobile-friendly dashboard with Inventory, Leads, and Marketing tabs — designed for lot-side use on a phone.

---

## Features

### Customer-Facing
- **Responsive inventory grid** with real-time Firestore data
- **Dynamic make filter** — only shows makes currently in stock
- **Vehicle detail pages** with interactive image gallery, lightbox, swipe support, and thumbnail strip
- **Condition badges** (Excellent / Very Good / Good / Fair) with color coding
- **Spec pills** — Body Type, Engine, Transmission, Drivetrain
- **Test drive request form** with date/time picker that saves leads to Firestore
- **Featured vehicles** section on homepage (max 4)
- **Scroll-driven hero animation** with SVG car silhouettes (desktop only)
- **Infinite vertical inventory carousel** in hero section (desktop only)
- **SEO** via React Helmet Async with per-page Open Graph tags

### Admin Dashboard (`/admin`)
- **Protected route** with Firebase Email/Password authentication
- **Add vehicles** with VIN decoder (NHTSA API — free, no key required) that auto-populates make, model, year, trim, engine, transmission, drivetrain, and body type
- **Image upload** — up to 15 images per vehicle, compressed and converted to WebP client-side
- **Edit vehicles** with existing image management
- **Mark as Sold** — hides from public inventory, keeps record in database
- **Toggle Featured** — enforces max 4 featured vehicles
- **Delete vehicles** — removes Firestore document and Storage images
- **Leads tab** — view all test drive requests with New badge, formatted appointment times, delete with confirmation modal
- **Marketing tab** — Facebook Post Template editor with shortcodes and live preview, AIA Feed Preview with vehicle swap

### Marketing (Ready for Facebook Integration)
- **Post Template Editor** — write templates with shortcodes like `{{year}}`, `{{make}}`, `{{price}}`, `{{dealerPhone}}` — saved to Firestore
- **Live post preview** — debounced 0.8s preview using real inventory data styled as a Facebook post mockup
- **AIA Feed Preview** — shows featured vehicles formatted as Facebook Automotive Inventory Ads with vehicle swap
- **Feed URL** — copyable endpoint ready to submit to Facebook Business Manager

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Backend | Firebase (Firestore, Auth, Storage) |
| SEO | React Helmet Async |
| Icons | Lucide React |
| Image Processing | browser-image-compression (WebP conversion) |
| VIN Decoding | NHTSA vPIC API (free, no key) |
| Email Notifications | Firebase Trigger Email Extension |

---

## Project Structure

```
src/
├── main.jsx
├── App.jsx                          # Router + lazy loading + protected routes
├── firebase.config.js               # Firebase initialization
├── config/
│   └── business.js                  # ← Edit this for a new dealership
├── context/
│   ├── AuthContext.jsx              # Firebase Auth provider
│   └── GlobalContext.jsx            # Global filters + toast state
├── hooks/
│   ├── useInventory.js              # All Firestore inventory operations
│   ├── useLeadForm.js               # Test drive form submission + email
│   ├── useLeads.js                  # Admin leads management
│   └── usePostTemplate.js           # Marketing template Firestore sync
├── utils/
│   ├── constants.js                 # MAX_IMAGES, MAX_FEATURED, time slots
│   ├── formatters.js                # Currency, mileage, date formatters
│   ├── imageProcessor.js            # WebP compression utilities
│   ├── templateRenderer.js          # Shortcode substitution engine
│   └── vinDecoder.js                # NHTSA API integration
├── components/
│   ├── admin/
│   │   └── MarketingTab.jsx
│   ├── forms/
│   │   ├── CarForm.jsx
│   │   ├── ImageUpload.jsx          # Multi-file WebP upload with progress
│   │   └── TestDriveForm.jsx        # Lead gen with date/time picker
│   ├── inventory/
│   │   ├── CarCard.jsx
│   │   ├── CarGrid.jsx
│   │   ├── FilterBar.jsx
│   │   ├── HeroCarousel.jsx         # Infinite vertical scroll carousel
│   │   └── ImageGallery.jsx         # Swipeable gallery + lightbox
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ScrollToTop.jsx
│   ├── seo/
│   │   └── PageMeta.jsx
│   └── ui/
│       ├── Badge.jsx
│       ├── ConditionBadge.jsx
│       ├── Modal.jsx
│       └── Spinner.jsx
└── pages/
    ├── Home.jsx
    ├── Inventory.jsx
    ├── CarDetail.jsx
    ├── Admin.jsx
    └── NotFound.jsx
```

---

## Reusing This Template for a New Dealership

**Edit exactly one file:** `src/config/business.js`

```js
const business = {
  name: "Your Dealership",
  nameBold: "Auto Sales",
  fullName: "Your Dealership Auto Sales",
  tagline: "Your tagline here.",
  phone: "(555) 000-0000",
  phoneHref: "tel:+15550000000",
  email: "info@yourdealership.com",
  address: "123 Main Street",
  city: "Your City",
  state: "OH",
  zip: "00000",
  fullAddress: "123 Main Street, Your City, OH 00000",
  hours: [
    { days: "Mon – Sat", hours: "9:00 AM – 6:00 PM" },
    { days: "Sun", hours: "Closed" },
  ],
  social: {
    facebook: "https://facebook.com/yourdealership",
    instagram: null,
  },
  siteUrl: "https://yourdomain.com",
  metaDescription: "Your SEO description here.",
};
```

Every component pulls from this file — navbar, footer, SEO tags, email notifications, and marketing templates all update automatically.

---

## Local Development Setup

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- Java JDK 17+ (required for Firestore emulator)
- Firebase CLI

```bash
npm install -g firebase-tools
```

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/AutoDealerReact.git
cd AutoDealerReact
npm install
```

### 2. Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a project
2. Enable **Authentication** (Email/Password), **Firestore**, and **Storage**
3. Add a web app and copy the config

### 3. Environment Variables

Create a `.env` file in the project root:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_USE_EMULATOR=true
VITE_SITE_URL=http://localhost:5173
VITE_ADMIN_EMAIL=your-admin-email@gmail.com
```

### 4. Initialize Firebase Emulators

```bash
firebase login
firebase use --add
firebase init emulators
```

Select: Authentication, Firestore, Storage. Accept default ports.

### 5. Run the Development Environment

**Terminal 1 — Firebase Emulators:**
```bash
firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data
```

**Terminal 2 — Vite Dev Server:**
```bash
npm run dev
```

App runs at **http://localhost:5173**
Emulator UI at **http://localhost:4000**

### 6. Create Admin User

1. Open [http://localhost:4000](http://localhost:4000)
2. Click **Authentication → Add user**
3. Enter email and password
4. Go to [http://localhost:5173/admin](http://localhost:5173/admin) and sign in

---

## Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /inventory/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /leads/{docId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /mail/{docId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
    match /settings/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Firebase Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /inventory/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## Firestore Indexes

Create these composite indexes in Firebase Console → Firestore → Indexes:

| Collection | Fields | Order |
|---|---|---|
| `inventory` | `isSold` + `createdAt` + `__name__` | Asc, Desc, Asc |
| `inventory` | `isFeatured` + `isSold` + `createdAt` + `__name__` | Asc, Asc, Desc, Asc |

---

## Deployment

### Build

```bash
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

### Deploy Security Rules

```bash
firebase deploy --only firestore:rules,storage
```

### Environment for Production

Update `.env`:
```
VITE_USE_EMULATOR=false
VITE_SITE_URL=https://yourdomain.com
```

---

## Email Notifications

Test drive requests trigger admin email notifications via the **Firebase Trigger Email** extension.

### Setup
1. Upgrade Firebase project to **Blaze plan**
2. Install **Trigger Email from Firestore** extension in Firebase Console
3. Configure with Gmail SMTP:
   ```
   smtps://youraddress%40gmail.com:your-app-password@smtp.gmail.com:465
   ```
4. Set collection to `mail`

Gmail app passwords can be generated at **myaccount.google.com → Security → App passwords**.

---

## Roadmap

- [ ] **Facebook Page Auto-Posting** — automatically post new vehicles to Facebook Page when added to inventory (requires Facebook Business Manager approval)
- [ ] **Post Template Shortcodes** — wire shortcode template engine to Facebook Graph API for formatted posts
- [ ] **AIA XML Feed** — Firebase Cloud Function generating Facebook Automotive Inventory Ads XML feed at `/api/aia-feed.xml`
- [ ] **Test Drive Confirmation Emails** — send confirmation email to customer after admin confirms appointment
- [ ] **Calendar Integration** — add confirmed test drive appointments to admin calendar
- [ ] **Claude AI Description Generator** — use Anthropic API to generate marketing descriptions from decoded VIN specs
- [ ] **Self-hosted Fonts** — eliminate Google Fonts dependency for improved Lighthouse scores
- [ ] **Multi-location Support** — support dealership groups with multiple locations
- [ ] **Sold Vehicle Archive** — dedicated page showing recently sold vehicles

---

## Performance

Mobile PageSpeed Insights scores (Home page):

| Metric | Score |
|---|---|
| Performance | 91-92 |
| Accessibility | 95 |
| Best Practices | 96 |
| SEO | 92 |

Key optimizations:
- Firebase Auth only loads on `/admin` route — eliminates 90KB iframe from public pages
- Lazy-loaded routes with React Suspense
- WebP image compression client-side before upload
- Aggressive Firebase Hosting cache headers
- `requestAnimationFrame` throttled scroll listeners
- Firestore composite indexes for all queries

---

## License

MIT — free to use, modify, and deploy for any dealership.

---

## Acknowledgements

- [NHTSA vPIC API](https://vpic.nhtsa.dot.gov/api/) — free VIN decoding
- [Firebase](https://firebase.google.com) — backend, hosting, and email
- [Lucide React](https://lucide.dev) — icons
- [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) — client-side WebP conversion
- [Tailwind CSS](https://tailwindcss.com) — utility-first styling
