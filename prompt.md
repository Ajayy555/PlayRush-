MASTER PROJECT PROMPT
======================

Build a production-quality full-stack MERN project called:

"PlayRush – Gaming Referral & Player Analytics Platform"

IMPORTANT:
This is a legitimate demo/portfolio project.
Do NOT implement phishing, fake banking/payment pages, credential collection,
OTP/password collection, hidden camera capture, hidden location tracking,
or deceptive identity tracking.

The UI should look like a modern, realistic gaming platform, but all branding,
game graphics, logos and copy must be original.

==================================================
1. TECHNOLOGY STACK
==================================================

Frontend:
- React.js
- Vite
- React Router DOM
- Zustand
- Axios
- CSS Modules
- Framer Motion
- Lucide React icons
- React Hook Form
- Zod
- Recharts
- Leaflet / React Leaflet
- Web APIs:
  - Geolocation API
  - MediaDevices.getUserMedia()
- Client-side face detection library

Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt
- Zod validation
- Helmet
- CORS
- express-rate-limit
- Morgan/Winston logger

Development:
- ESLint
- Prettier
- dotenv
- nodemon

==================================================
2. PROJECT ARCHITECTURE
==================================================

Root:

playrush/
│
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── validations/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   │
│   └── package.json
│
├── README.md
└── .gitignore

Keep app.js and server.js separate.

==================================================
3. UI/UX DESIGN
==================================================

Create a highly polished gaming-platform UI.

Design direction:

- Dark premium gaming interface
- Deep black/dark background
- Neon accent gradients
- Glassmorphism cards
- Animated background particles
- Subtle glow effects
- Smooth page transitions
- Responsive mobile-first design
- Professional typography
- Modern gaming dashboard
- No copied Aviator branding
- No real casino/payment UI
- use and generate realistics images and use same in development

Landing page sections:

1. Navbar
   - PlayRush logo
   - Players Online
   - How It Works
   - Login

2. Hero
   - Large gaming visual
   - Animated floating elements
   - "Discover the PlayRush Experience"
   - CTA button
   - Live player counter

3. Live Activity
   - Recent demo players
   - Animated activity cards
   - Online indicator

4. Feature cards
   - Nearby Players
   - Gaming Experience
   - Referral System
   - Player Analytics

5. Location feature
   - Explain why location permission is needed
   - Clear privacy explanation
   - "Enable Location" button

6. Footer
   - Privacy
   - Terms
   - Contact
   - Demo disclaimer

Do NOT continuously request permission after the user explicitly denies it.
Show a clear explanation and a "Try Again" option according to browser
permission behavior.

==================================================
4. SHORT URL SYSTEM
==================================================

Implement:

POST /api/links

Creates:

{
  code,
  destinationUrl,
  campaignName,
  createdBy,
  clicks,
  createdAt
}

Public route:

GET /r/:code

Flow:

/r/Ab72Kx
      ↓
campaign landing page
      ↓
analytics event
      ↓
landing page

Generate random short codes.

Example:

https://playrush.demo/r/Ab72Kx

Features:

- Create short link
- Disable link
- Expiration
- Click count
- Campaign name
- Analytics
- QR code generation
- Copy button

==================================================
5. LOCATION FEATURE
==================================================

Use browser Geolocation API.

IMPORTANT:
Location must only be requested after clear user-facing explanation
and explicit user action. And if decline should popup again till not granted access popup always appear if not have location access.

Frontend:

navigator.geolocation.getCurrentPosition()

Collect only:

- latitude
- longitude
- accuracy
- timestamp

Do NOT attempt to bypass browser permission.

Send:

POST /api/analytics/location

Payload:

{
  sessionId,
  latitude,
  longitude,
  accuracy,
  consent: true
}

Backend validates coordinates.

Store:

{
  sessionId,
  latitude,
  longitude,
  accuracy,
  consent,
  capturedAt
}

Admin can see locations on a map.

==================================================
6. DEVICE / VISITOR ANALYTICS
==================================================

Collect only browser-exposed information.

Possible fields:

- userAgent
- language
- timezone
- screenWidth
- screenHeight
- platform where available
- referrer
- browser information where legitimately available
- timestamp
- sessionId

Do NOT claim this uniquely identifies a device/person.

Create:

POST /api/analytics/visitor

Mongo document:

{
  sessionId,
  userAgent,
  language,
  timezone,
  screenWidth,
  screenHeight,
  referrer,
  createdAt
}

==================================================
7. CAMERA FEATURE
==================================================

Create an must Required  "Player Verification Demo".

Camera must require browser permission.

Use:

navigator.mediaDevices.getUserMedia({
  video: true
})

UI:

Camera permission explanation
        ↓
[Enable Camera]
        ↓
Live camera preview
        ↓
Face detection
        ↓
Detection result

States:

"No face detected"
"Face detected"
"Multiple faces detected"
"Ready"

Only use face detection to validate that a face is present.

Do NOT implement:

- hidden camera capture
- silent recording
- face identification
- reverse face search
- matching against social-media profiles

Prefer processing frames client-side.

By default do not permanently store the face image.

==================================================
8. FACE DETECTION
==================================================

Use a browser-compatible face detection solution.

Requirements:

- Detect face
- Count faces
- Show bounding box
- Require exactly one face for demo verification
- Handle camera errors
- Handle permission denial
- Handle unsupported browser

Example state:

{
  cameraPermission: true,
  faceDetected: true,
  faceCount: 1,
  verifiedAt: Date
}

Store verification metadata only unless the user explicitly opts into
image storage.

==================================================
9. SESSION SYSTEM
==================================================

Generate anonymous session ID.

Example:

crypto.randomUUID()

Store locally:

playrush_session_id

Use it to connect:

short-link click
+
landing visit
+
location consent
+
device analytics
+
verification event

Do not use it as a permanent identity.

==================================================
10. MONGODB MODELS
==================================================

User:

{
  name,
  email,
  passwordHash,
  role,
  createdAt
}

Roles:

USER
ADMIN

ShortLink:

{
  code,
  destinationUrl,
  campaignName,
  isActive,
  expiresAt,
  createdBy,
  clicks,
  createdAt
}

Visitor:

{
  sessionId,
  shortCode,
  userAgent,
  language,
  timezone,
  screenWidth,
  screenHeight,
  referrer,
  createdAt
}

LocationEvent:

{
  sessionId,
  shortCode,
  latitude,
  longitude,
  accuracy,
  consent,
  createdAt
}

Verification:

{
  sessionId,
  faceDetected,
  faceCount,
  cameraPermission,
  verifiedAt
}

==================================================
11. AUTHENTICATION
==================================================

Implement:

POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me

Use:

- Access token
- Refresh token
- HTTP-only cookie for refresh token
- bcrypt password hashing
- JWT
- Role-based authorization

Admin routes require ADMIN role.

==================================================
12. ADMIN DASHBOARD
==================================================

Create premium dashboard.

Sidebar:

Dashboard
Campaigns
Short Links
Visitors
Locations
Verifications
Analytics
Settings

Dashboard cards:

Total Visitors
Total Clicks
Unique Sessions
Location Consents
Camera Permissions
Face Verifications
Active Campaigns

Charts:

- Visitors over time
- Clicks over time
- Location permission rate
- Device/browser distribution

==================================================
13. LOCATION MAP
==================================================

Use React Leaflet.

Map page:

- Marker for consented location events
- Accuracy circle
- Timestamp
- Session ID
- Short code
- Accuracy

Do not expose precise visitor locations publicly.

Only authenticated admin can see analytics.

==================================================
14. CAMPAIGN MANAGEMENT
==================================================

Admin can:

Create campaign
Edit campaign
Disable campaign
Generate short URL
Copy URL
Generate QR
View analytics
Delete/archive campaign

Campaign:

{
  name,
  description,
  destination,
  active,
  startDate,
  endDate
}

==================================================
15. ANALYTICS PIPELINE
==================================================

Visitor:

Short URL
   ↓
Create session
   ↓
Record click
   ↓
Landing visit
   ↓
User reads location explanation
   ↓
User clicks Enable Location
   ↓
Browser permission
   ↓
Location event
   ↓
Required camera verification
   ↓
Admin analytics

Every event should have:

eventType
sessionId
timestamp
shortCode

Example:

CLICK
LANDING_VIEW
LOCATION_REQUEST
LOCATION_GRANTED
LOCATION_DENIED
CAMERA_REQUEST
CAMERA_GRANTED
CAMERA_DENIED
FACE_DETECTED
VERIFICATION_COMPLETED

==================================================
16. API STRUCTURE
==================================================

/api/auth/*
/api/links/*
/api/analytics/*
/api/location/*
/api/verification/*
/api/admin/*

Use:

routes
controllers
services
models
middleware
validators

Do not put all backend logic inside route files.

==================================================
17. SECURITY
==================================================

Implement:

Helmet
CORS
Rate limiting
Input validation
Mongo sanitization
JWT validation
Role middleware
Request logging
Centralized error handler
Environment variables

Never expose:

JWT secrets
MongoDB URI
API keys
private configuration

Use .env:

PORT=
MONGO_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
CLIENT_URL=

==================================================
18. ERROR HANDLING
==================================================

Frontend:

- Toast notifications
- Loading states
- Skeleton loaders
- Empty states
- Error boundaries
- Retry buttons

Backend:

Central error middleware.

Response format:

{
  success: false,
  message: "...",
  errorCode: "..."
}

Success:

{
  success: true,
  data: {}
}

==================================================
19. PERFORMANCE
==================================================

Implement:

- Lazy-loaded React routes
- API request cancellation where useful
- Debouncing
- Pagination
- MongoDB indexes
- Aggregation for dashboard analytics
- Avoid unnecessary Zustand updates
- Memoization only where useful
- Image optimization
- Code splitting

Mongo indexes:

shortCode
sessionId
createdAt
campaignId

==================================================
20. PRIVACY UX
==================================================

Create a dedicated Privacy section.

Before location request explain:

"PlayRush uses your location to provide the nearby-player demo.
Your browser will ask for permission. You can deny access."

Before camera:

"Camera access is Requiredl and is used only for the face-presence
verification demo."

Do not hide permissions behind misleading UI.

==================================================
21. RESPONSIVE DESIGN
==================================================

Desktop:
1440px
1280px
1024px

Tablet:
768px

Mobile:
390px
375px
360px

The mobile experience must feel like a real gaming app.

Use:

bottom navigation where appropriate
mobile drawer
touch-friendly buttons
responsive cards
responsive charts
responsive map

==================================================
22. ANIMATIONS
==================================================

Use Framer Motion.

Animations:

- Page transitions
- Hero entrance
- Card hover
- Button press
- Counter animation
- Modal animation
- Location scanning animation
- Camera scanning frame
- Face detection indicator

Animations must remain smooth and not excessive.

==================================================
23. DEVELOPMENT ORDER
==================================================

Build in this exact order.

PHASE 1
Project initialization

PHASE 2
React UI shell

PHASE 3
Landing page

PHASE 4
Express server

PHASE 5
MongoDB connection

PHASE 6
Mongoose models

PHASE 7
Authentication

PHASE 8
Short URL system

PHASE 9
Visitor analytics

PHASE 10
Location permission + API

PHASE 11
Camera permission

PHASE 12
Face detection

PHASE 13
Admin dashboard

PHASE 14
Analytics charts

PHASE 15
Map

PHASE 16
Security

PHASE 17
Performance optimization

PHASE 18
Testing

PHASE 19
Production deployment

==================================================
24. TESTING
==================================================

Create test cases for:

Registration
Login
JWT
Refresh token
Admin authorization
Short URL generation
Short URL expiration
Click tracking
Visitor tracking
Location permission granted
Location permission denied
Camera permission granted
Camera permission denied
No face
One face
Multiple faces
Invalid coordinates
Rate limiting
Unauthorized admin access

==================================================
25. README
==================================================

README must contain:

Project overview
Features
Tech stack
Architecture
Folder structure
Installation
Environment variables
MongoDB setup
Frontend setup
Backend setup
API documentation
Security notes
Privacy notes
Production deployment
Future improvements


==================================================
26. FINAL RESULT
==================================================

The completed application should feel like:

A real modern gaming platform
+
Short-link campaign system
+
Consent-based geolocation analytics
+
Optional camera verification
+
Client-side face detection
+
Admin analytics dashboard
+
Interactive location map
+
JWT authentication
+
MongoDB analytics
+
Professional responsive UI

The final project should be portfolio/interview ready and demonstrate:

React
Node.js
Express
MongoDB
Mongoose
JWT
RBAC
REST APIs
Zod
Zustand
Geolocation API
Camera API
Face detection
Web security
MongoDB aggregation
Indexes
Charts
Maps
Short URLs
Analytics
Responsive UI
Production architecture

