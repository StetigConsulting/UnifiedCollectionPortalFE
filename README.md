## NPM modules list

- **Next.js 15.2.4** - Frontend framework
- **React 19** - UI library
- **TypeScript** - Programming language for type safety
- **Tailwind CSS** - Styling framework
- **shadcn/ui** - UI component library
- **lucide-react** - Icons library
- **NextAuth.js v5** - Authentication
- **Axios** - HTTP client
- **React Hook Form + Zod** - Form handling and validation
- **Chart.js/Recharts** - Charts and graphs
- **XLSX** - File handling

## Directory Structure

### 📁 Pages & Routes ( Managed by scopes maintained in helper.ts)
```
src/app/
├── admin/                    # pages
├── agency/                   # pages
├── department/               # pages
├── report/                   # Report pages
├── auth/                     # Authentication page (Sign in)
├── dashboard/                # Dashboard page
├── add-news/                 # News management page
├── new-notices/              # Not Used
└── page.tsx                  # Home page (Landing page)
```

### 🔧 API & Backend Integration
```
src/app/
├── api/                      # Next.js API routes
├── api-calls/                # Backend API functions
└── actions/                  # Server actions
```

### ⚙️ Core Configuration
```
src/app/
├── auth.ts                   # NextAuth configuration
├── layout.tsx                # Root layout
└── globals.css               # Global styles
```

### 🧩 Components
```
src/components/
├── ui/                       # shadcn/ui components
├── AppSidebar.tsx            # Main sidebar
├── AuthUserReusableCode.tsx  # Auth wrapper
├── ReactTable.tsx            # Data table
└── ...                       # Other Reusable components (Inputs, Tables, etc)
```

### 🎣 Custom Hooks
```
src/hooks/
├── use-logout.tsx            # Logout functionality 
├── use-mobile.tsx            # Mobile detection (Not Used)
└── use-token-manager.tsx     # Token management hooks
```

### 📚 Utilities & Libraries
```
src/lib/
├── axios.ts                  # Axios interceptor
├── interface.ts              # TypeScript types
├── token-manager.ts          # Token management
├── utils.ts                  # Helper functions
└── logout-utils.ts           # Logout utilities

src/
└── helper.ts                 # Permission and access control helpers
```

### 🛡️ Middleware
```
src/middleware.ts             # Next.js middleware
```

## Important Configuration Files

### Package.json

- **Scripts:** 
  - `npm run dev` - Start development server
  - `npm run build` - Build for production
  - `npm run start` - Start production server
  - `npm run export` - Export static files

### Next.js Configuration (next.config.ts)
This file configures how Next.js behaves:
- **Security Headers:** We've added security headers like HSTS, X-Frame-Options, CSP to keep the app secure
- **Image Optimization:** Supports AWS S3 images and modern formats like WebP/AVIF
- **React Strict Mode:** Enabled to catch potential issues early

### TypeScript Configuration (tsconfig.json)
Our TypeScript setup:
- **Target:** ES2017 (modern JavaScript features)
- **Path Mapping:** `@/*` points to `./src/*` (so you can import like `@/components/Button`)

### Tailwind Configuration (tailwind.config.ts)
Our styling setup:
- **Custom Colors:** 
  - `themeColor` (#6183C3) - Dark theme color
  - `lightThemeColor` (#E6EDF6) - A lighter version of theme color
- **Custom Components:** We've added custom styles for sidebar, charts, etc.

## How Authentication Works 🔐

This is probably one of the most important parts to understand. Let me break it down:

### NextAuth Configuration (auth.ts)
This is where we set up how users log in:
- **Provider:** We use credentials-based authentication
- **Session Strategy:** JWT tokens (stored in cookies)
- **Token Management:** We use both access tokens and refresh tokens
- **User Data:** We store extra info in the session:
  - `userId`, `userName` - Basic user info
  - `accessToken`, `refreshToken` - For API calls
  - `discomId`, `roleId` - User's discom and role Id
  - `userScopes` - What the user can do (permissions)
  - `tokenExpiry` - When the token expires

### Middleware (middleware.ts)
This runs before every page loads and decides who can access what:
- **Route Protection:** All pages are protected except the login page
- **Scope-based Access:** Each URL is mapped to specific permissions
- **Smart Redirects:** Users get redirected to the right page based on their permissions
- **Debug Routes:** `/debug-env` and `/decrypt-params` are unprotected (for debugging)

### Token Management (lib/token-manager.ts)
This handles the token lifecycle:
- **Local Storage:** We cache tokens for faster access
- **Cache Management:** We clear everything when users log out

### Axios Configuration (lib/axios.ts)
This is our HTTP client setup:
- **Base URL:** Changes based on environment (dev/staging/prod)
- **Interceptors:** Automatically adds auth tokens to requests and handles responses
- **Token Refresh:** When we get a 401 (unauthorized), it automatically tries to refresh the token

### API Call Organization
We've organized our API calls by feature:
- **admin/api.ts:** Apis related to admin routes
- **agency/api.ts:** Apis related to agency routes
- **department/api.ts:** Apis related to department routes
- **other/api.ts:** Miscellaneous APIs (news, resources, etc.)
- **report/api.ts:** All the report APIs

## Component Architecture 🧩

### Layout Components
These are the big building blocks:
- **AppSidebar.tsx:** The main navigation sidebar (shows different menus based on user role)
- **AuthUserReusableCode.tsx:** Wraps authenticated pages with sidebar, Breadscrum and session management
- **SessionWrapper.tsx:** Handles the loading state

### UI Components (components/ui/)
These are our basic building blocks (mostly from Radix UI):
- **Shad CN UI:** Alert dialogs, dropdowns, tooltips, etc.
- **Custom Components:** Tables, pagination, modals 
- **Reusable Forms:** Labeled inputs, selects, checkboxes (consistent styling)

### Business Components
These are more complex, feature-specific components:
- **ReactTable.tsx:** Advanced data table with sorting, filtering, pagination
- **DualListTransfer.tsx:** Component for moving items between two lists

## How Pages Are Organized 🗺️

### Route Protection
- **Middleware-based:** Every route is automatically protected (except login)
- **Scope-based:** Fine-grained permissions (users can only see what they're allowed to)

## State Management 📊

### Session Management
- **NextAuth Session:** Global user state (available everywhere)
- **Token Management:** Local storage + session (for performance)
- **Scope Management:** User permissions (what they can do managed in nextauth)

## Styling & Theming 🎨

### Tailwind CSS
- **Custom Colors:** Brand colors (themeColor, lightThemeColor)
- **Component Variants:** Button, card, input variants (consistent styling)

## File Handling 📁

### Import/Export
- **Excel Files:** XLSX library for .xlsx files (Creating Excel files)

### Data Processing
- **File Validation:** Client-side validation (check files before upload)

## Security Features 🔒

### Authentication Security
- **JWT Tokens:** Secure token-based authentication (industry standard)
- **Session Timeout:** Inactivity-based logout (15 minutes of inactivity)

### Request Security
- **CSRF Protection:** Token-based CSRF protection (prevents cross-site attacks)
- **XSS Prevention:** Content Security Policy (blocks malicious scripts)
- **HTTPS Enforcement:** HSTS headers (forces secure connections)

## Performance Optimizations ⚡

### Token Optimization
- **Caching:** Local storage token caching (faster access)
- **Reduced API Calls:** Cached user data (less network requests)
- **Efficient Refresh:** Smart token refresh logic (seamless experience)

## Development Workflow 🛠️

### Scripts
- **Development:** `npm run dev` (dev server)
- **Build:** `npm run build` (create production build)
- **Production:** `npm run start` (start production server)

### Environment Variables
- **API URLs:** Frontend and backend API endpoints (different for dev/staging/prod)
- **Authentication:** NextAuth configuration, MMI creds