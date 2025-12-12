# QRDatMon Project Structure

## 🏗️ System Architecture

```
QRDatMon Restaurant Management System

📱 Mobile Apps (Kotlin)           🌐 Web Admin (Next.js)           🔧 Backend (Node.js API)
├── Customer App                   ├── Dashboard                   ├── REST API
└── Staff App                      ├── Menu Management             ├── WebSocket Server
                                   ├── Order Tracking              └── MongoDB Database
                                   └── Reports & Analytics
```

## 🛠️ Technology Stack

### Frontend
- **📱 Mobile Apps**: Kotlin + Jetpack Compose (Customer & Staff)
- **🌐 Web Admin**: Next.js + TypeScript + Tailwind CSS

### Backend
- **🔧 API Server**: Node.js + Express + TypeScript
- **📡 Real-time**: Socket.io (for KDS and live updates)
- **🗄️ Database**: MongoDB + Mongoose ODM
- **🔑 Authentication**: Firebase Auth (Google Login only)

## 📂 Current Project Structure

```
QRDatMon/                          # ✅ Complete System
│
├── mobile/                        # 📱 Android Project (Kotlin)
│   │
│   ├── app-customer/              # ✅ Customer Android App
│   │   ├── src/main/
│   │   │   ├── java/com/qrdatmon/customer/
│   │   │   │   ├── MainActivity.kt
│   │   │   │   ├── QRDatMonApp.kt
│   │   │   │   └── ui/theme/
│   │   │   ├── res/
│   │   │   └── AndroidManifest.xml
│   │   ├── build.gradle.kts
│   │   └── proguard-rules.pro
│   │
│   ├── app-staff/                 # ✅ Staff Android App
│   │   ├── src/main/
│   │   ├── build.gradle.kts
│   │   └── proguard-rules.pro
│   │
│   ├── feature/                   # 🎯 Feature Modules
│   │   ├── auth/                  # Firebase Google Authentication
│   │   │   ├── src/main/java/com/qrdatmon/feature/auth/
│   │   │   │   ├── domain/       # Use cases
│   │   │   │   └── presentation/ # UI + ViewModels
│   │   │   └── build.gradle.kts
│   │   │
│   │   ├── qr/                    # QR Code Scanning
│   │   │   ├── src/main/java/com/qrdatmon/feature/qr/
│   │   │   └── build.gradle.kts
│   │   │
│   │   ├── menu/                  # Menu Display & Browse
│   │   │   ├── src/main/java/com/qrdatmon/feature/menu/
│   │   │   │   ├── domain/
│   │   │   │   │   ├── model/
│   │   │   │   │   ├── usecase/
│   │   │   │   │   │   ├── GetMenuUseCase.kt
│   │   │   │   │   │   └── SearchMenuUseCase.kt
│   │   │   │   │   └── repository/
│   │   │   │   └── presentation/
│   │   │   │       ├── MenuScreen.kt
│   │   │   │       ├── MenuViewModel.kt
│   │   │   │       ├── MenuState.kt
│   │   │   │       └── MenuIntent.kt
│   │   │   └── build.gradle.kts
│   │   │
│   │   ├── order/                 # Order Management
│   │   │   ├── src/main/java/com/qrdatmon/feature/order/
│   │   │   └── build.gradle.kts
│   │   │
│   │   ├── payment/               # Payment Integration
│   │   │   ├── src/main/java/com/qrdatmon/feature/payment/
│   │   │   └── build.gradle.kts
│   │   │
│   │   ├── table/                 # Table Management (Staff)
│   │   │   ├── src/main/java/com/qrdatmon/feature/table/
│   │   │   └── build.gradle.kts
│   │   │
│   │   ├── review/                # Review & Rating
│   │   │   ├── src/main/java/com/qrdatmon/feature/review/
│   │   │   └── build.gradle.kts
│   │   │
│   │   └── notification/          # Push Notifications
│   │       ├── src/main/java/com/qrdatmon/feature/notification/
│   │       └── build.gradle.kts
│   │
│   ├── core/                      # 🔧 Core Infrastructure
│   │   │
│   │   ├── common/                # Shared Utilities
│   │   │   ├── src/main/java/com/qrdatmon/core/common/
│   │   │   │   ├── util/
│   │   │   │   │   ├── Result.kt         # ✅ Created
│   │   │   │   │   ├── Constants.kt      # ✅ Created
│   │   │   │   │   └── Extensions.kt
│   │   │   │   ├── model/
│   │   │   │   └── error/
│   │   │   └── build.gradle.kts
│   │   │
│   │   ├── domain/                # Domain Models & Contracts
│   │   │   ├── src/main/java/com/qrdatmon/core/domain/
│   │   │   │   ├── model/
│   │   │   │   │   ├── MenuItem.kt        # ✅ Created
│   │   │   │   │   ├── Order.kt           # ✅ Created
│   │   │   │   │   ├── Table.kt
│   │   │   │   │   ├── User.kt
│   │   │   │   │   └── Payment.kt
│   │   │   │   └── repository/
│   │   │   │       ├── MenuRepository.kt  # ✅ Created
│   │   │   │       ├── OrderRepository.kt
│   │   │   │       ├── TableRepository.kt
│   │   │   │       └── UserRepository.kt
│   │   │   └── build.gradle.kts
│   │   │
│   │   ├── data/                  # Repository Implementations
│   │   │   ├── src/main/java/com/qrdatmon/core/data/
│   │   │   │   ├── repository/
│   │   │   │   │   ├── MenuRepositoryImpl.kt
│   │   │   │   │   └── OrderRepositoryImpl.kt
│   │   │   │   ├── mapper/        # API DTO ↔ Domain mapping
│   │   │   │   └── di/            # Data layer DI
│   │   │   └── build.gradle.kts
│   │   │
│   │   ├── network/               # Network Layer (Node.js API)
│   │   │   ├── src/main/java/com/qrdatmon/core/network/
│   │   │   │   ├── api/
│   │   │   │   │   ├── MenuApi.kt
│   │   │   │   │   ├── OrderApi.kt
│   │   │   │   │   └── AuthApi.kt
│   │   │   │   ├── websocket/
│   │   │   │   │   ├── OrderWebSocket.kt
│   │   │   │   │   └── WebSocketManager.kt
│   │   │   │   ├── interceptor/
│   │   │   │   │   ├── AuthInterceptor.kt (Firebase JWT)
│   │   │   │   │   └── LoggingInterceptor.kt
│   │   │   │   ├── dto/           # API response models
│   │   │   │   └── di/            # Network DI
│   │   │   │       └── NetworkModule.kt
│   │   │   └── build.gradle.kts
│   │   │
│   │   ├── database/              # Local Cache (Room) 
│   │   │   ├── src/main/java/com/qrdatmon/core/database/
│   │   │   │   ├── dao/
│   │   │   │   │   ├── MenuDao.kt
│   │   │   │   │   ├── OrderDao.kt
│   │   │   │   │   └── CartDao.kt
│   │   │   │   ├── entity/
│   │   │   │   │   ├── MenuItemEntity.kt
│   │   │   │   │   ├── OrderEntity.kt
│   │   │   │   │   └── CartItemEntity.kt
│   │   │   │   ├── QRDatMonDatabase.kt
│   │   │   │   └── di/            # Database DI
│   │   │   │       └── DatabaseModule.kt
│   │   │   └── build.gradle.kts
│   │   │
│   │   └── ui/                    # Shared UI Components
│   │       ├── src/main/java/com/qrdatmon/core/ui/
│   │       │   ├── components/
│   │       │   │   ├── QRButton.kt
│   │       │   │   ├── QRTextField.kt
│   │       │   │   ├── QRCard.kt
│   │       │   │   └── LoadingIndicator.kt
│   │       │   ├── theme/
│   │       │   │   ├── Theme.kt
│   │       │   │   ├── Color.kt
│   │       │   │   └── Type.kt
│   │       │   └── navigation/
│   │       │       ├── NavGraph.kt
│   │       │       └── Screen.kt
│   │       └── build.gradle.kts
│   │
│   ├── buildSrc/                  # 🔨 Convention Plugins
│   │   ├── src/main/kotlin/
│   │   │   ├── AndroidLibraryConventionPlugin.kt      # ✅ Created
│   │   │   ├── AndroidFeatureConventionPlugin.kt      # ✅ Created
│   │   │   └── AndroidComposeConventionPlugin.kt      # ✅ Created
│   │   └── build.gradle.kts                           # ✅ Created
│   │
│   ├── gradle/
│   │   ├── libs.versions.toml     # ✅ Version Catalog
│   │   └── wrapper/
│   │
│   ├── build.gradle.kts
│   ├── gradle.properties          # ✅ Performance optimized
│   ├── settings.gradle.kts        # ✅ All modules included
│   ├── .gitignore
│   └── README.md                  # ✅ Android project docs
│
├── backend/                       # ✅ Node.js API Server (Initialized)
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── web-admin/                     # ✅ Next.js Web Admin (Initialized)
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── tsconfig.json
│
└── docs/
    ├── PROJECT_STRUCTURE.md       # ✅ This file  
    ├── STRUCTURE_VALIDATION.md
    ├── API_DOCUMENTATION.md
    └── DEPLOYMENT_GUIDE.md
```

## 📝 Implementation Notes

> **Project Restructuring Completed:** The project has been successfully reorganized into a monorepo structure with `mobile/`, `backend/`, and `web-admin/` folders. The Android project now resides in the `mobile/` directory with all its modules properly organized.

### Backend Structure Details (Node.js + TypeScript + Express)
- **controllers/** - Request handlers for each domain (auth, menu, order, table, payment)
- **models/** - MongoDB/Mongoose schema definitions
- **routes/** - API route definitions and Express routers
- **middleware/** - Authentication, CORS, error handling, logging
- **services/** - Business logic (Firebase Admin, Payment gateway, WebSocket)
- **utils/** - Database connection, validation helpers, logger configuration

### Web Admin Structure Details (Next.js 13+ App Router)
- **app/** - Next.js App Router pages (dashboard, menu, orders, tables, staff, analytics)
- **components/** - Reusable UI components (shadcn/ui, layout, forms)
- **lib/** - Utility functions (Firebase Admin SDK, MongoDB client, API client)
- **types/** - TypeScript type definitions shared across the admin panel

## 🎯 App Modules & Features

### 📱 Mobile Apps (Kotlin)

#### Customer App Features:
- ✅ **Firebase Google Auth** - Google login only
- ✅ **QR Code Scanning** - Table assignment via QR
- ✅ **Menu Browsing** - Digital menu with search & filters
- ✅ **Order Management** - Add to cart, customize items
- ✅ **Payment Integration** - Razorpay payment gateway
- ✅ **Reviews & Ratings** - Post-meal feedback

#### Staff App Features:
- ✅ **Firebase Google Auth** - Staff authentication
- ✅ **Table Management** - Real-time table status
- ✅ **Order Processing** - Kitchen communication
- ✅ **Payment Handling** - Bill generation & payments

### 🌐 Web Admin (Next.js)

#### Dashboard Features:
- ✅ **Real-time Analytics** - Sales, orders, performance
- ✅ **Menu Management** - CRUD operations for menu items
- ✅ **Order Tracking** - Live order status monitoring
- ✅ **Table Management** - Table layouts & QR generation
- ✅ **Staff Management** - User roles & permissions
- ✅ **Reports & Insights** - Revenue, customer analytics

### 🔧 Backend (Node.js API)

#### API Endpoints:
```typescript
// Authentication (Firebase)
POST   /api/auth/google        # Google OAuth login
GET    /api/auth/verify        # JWT verification

// Menu Management
GET    /api/menu              # Get all menu items
POST   /api/menu              # Create menu item (Admin only)
PUT    /api/menu/:id          # Update menu item (Admin only)
DELETE /api/menu/:id          # Delete menu item (Admin only)

// Order Management
GET    /api/orders            # Get orders (filtered by user/table)
POST   /api/orders            # Create new order
PUT    /api/orders/:id        # Update order status
DELETE /api/orders/:id        # Cancel order

// Table Management
GET    /api/tables            # Get all tables
PUT    /api/tables/:id        # Update table status
POST   /api/tables/:id/qr     # Generate QR code for table

// Payment
POST   /api/payment/create    # Create Razorpay order
POST   /api/payment/verify    # Verify payment signature
```

#### Real-time Features (Socket.io):
```typescript
// Order Events
order:created              # New order notification
order:updated              # Order status change
order:completed            # Order ready notification

// Table Events  
table:occupied             # Table status change
table:available            # Table becomes available

// Kitchen Events
kitchen:new-order          # New order to kitchen
kitchen:order-ready        # Order ready for serving
```

## 🗄️ Database Architecture (MongoDB)

### Collections Structure:
```typescript
// Users Collection
{
  _id: ObjectId,
  uid: string,              // Firebase UID
  email: string,
  name: string,
  photoURL?: string,
  role: 'customer' | 'staff' | 'admin',
  createdAt: Date,
  lastLoginAt: Date
}

// MenuItems Collection
{
  _id: ObjectId,
  name: string,
  description: string,
  price: number,
  category: string,
  imageUrl?: string,
  isAvailable: boolean,
  toppings?: Array<{
    name: string,
    price: number
  }>,
  createdAt: Date,
  updatedAt: Date
}

// Orders Collection
{
  _id: ObjectId,
  tableId: ObjectId,
  customerId: ObjectId,
  items: Array<{
    menuItemId: ObjectId,
    quantity: number,
    toppings: Array<string>,
    specialInstructions?: string,
    unitPrice: number
  }>,
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed',
  totalAmount: number,
  paymentStatus: 'pending' | 'paid' | 'failed',
  paymentMethod?: string,
  razorpayOrderId?: string,
  createdAt: Date,
  updatedAt: Date
}

// Tables Collection
{
  _id: ObjectId,
  number: number,
  capacity: number,
  status: 'available' | 'occupied' | 'reserved' | 'cleaning',
  qrCode: string,
  currentOrderId?: ObjectId,
  location?: string,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Data Flow Architecture

```
📱 Mobile Apps (Kotlin)
        ↓ HTTP/WebSocket
🔧 Node.js API Server  
        ↓ Mongoose ODM
🗄️ MongoDB Database

🌐 Next.js Web Admin
        ↓ HTTP API calls
🔧 Node.js API Server
        ↓ Real-time updates
📡 Socket.io WebSocket
```

## 📊 Dependency Graph

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   app-customer  │    │   app-staff     │    │   web-admin     │
│    (Kotlin)     │    │    (Kotlin)     │    │   (Next.js)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Node.js API Server    │
                    │   (Express + Socket.io)   │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │      MongoDB Database     │
                    │   (Mongoose ODM Models)   │
                    └───────────────────────────┘

          ┌─────────────────┐
          │  Firebase Auth  │ ← Google OAuth only
          │ (JWT Tokens)    │
          └─────────────────┘
```

## ✅ Implementation Status

### Completed ✅

#### Mobile App (Android - Kotlin)
- ✅ Multi-module Android structure
- ✅ Convention Plugins setup
- ✅ Version Catalog configuration
- ✅ Gradle optimization
- ✅ Core modules architecture (common, domain, data, network, database, ui)
- ✅ Feature modules structure (auth, qr, menu, order, payment, table, review, notification)
- ✅ Customer & Staff app templates
- ✅ Domain models & repositories
- ✅ Project moved to `mobile/` directory

#### Backend (Node.js + TypeScript)
- ✅ Project structure initialized
- ✅ Folder structure created (controllers, models, routes, middleware, services, utils)
- ✅ TypeScript configuration setup

#### Web Admin (Next.js 16)
- ✅ Project initialized with `create-next-app@latest`
- ✅ TypeScript, Tailwind CSS v4, App Router enabled
- ✅ Folder structure: app/, components/ (ui, layout, forms), lib/, types/
- ✅ Dependencies installed: Firebase Admin, MongoDB, shadcn/ui deps, form libraries
- ✅ 561 npm packages installed

#### Documentation
- ✅ Project structure documentation
- ✅ Architecture diagrams
- ✅ Technology stack documentation

### Next Steps 🚧

#### Phase 1: Backend Development 🔧
- [ ] Implement MongoDB models (User, MenuItem, Order, Table, Payment)
- [ ] Create API controllers and routes
- [ ] Setup Firebase Admin SDK for authentication
- [ ] Implement middleware (auth, CORS, error handling)
- [ ] Setup Socket.io for real-time features
- [ ] Create database connection utilities
- [ ] Implement payment service (Razorpay integration)

#### Phase 2: Web Admin Implementation 🌐
- [ ] Setup Firebase Auth integration
- [ ] Create shadcn/ui component library
- [ ] Build dashboard layout and navigation
- [ ] Implement menu management pages (CRUD)
- [ ] Create order tracking interface
- [ ] Build table management with QR code generation
- [ ] Add staff management and permissions
- [ ] Implement analytics and reports

#### Phase 3: Mobile App Implementation 📱
- [ ] Implement Repository layers and API integration
- [ ] Create UI screens with Jetpack Compose
- [ ] Integrate Firebase Auth (Google Sign-In)
- [ ] Implement QR code scanning functionality
- [ ] Build menu browsing and search
- [ ] Create order management flow
- [ ] Integrate Razorpay payment gateway
- [ ] Implement real-time updates via WebSocket
- [ ] Add push notifications

#### Phase 4: Integration & Testing 🧪
- [ ] Connect mobile apps to backend API
- [ ] Connect web admin to backend API
- [ ] End-to-end testing
- [ ] Real-time order tracking testing
- [ ] Payment flow testing
- [ ] Performance optimization
- [ ] Security auditing

#### Phase 5: Deployment & DevOps 🚀
- [ ] Setup production environment
- [ ] Configure MongoDB Atlas
- [ ] Deploy backend to cloud (AWS/GCP/Azure)
- [ ] Deploy web admin (Vercel/Netlify)
- [ ] Setup CI/CD pipeline
- [ ] Configure monitoring and logging
- [ ] Implement backup strategies

---

**Last Updated:** 2025-12-10  
**Status:** ✅ Project Restructured - All 3 Components Initialized  
**Current Phase:** Backend & Web Admin Implementation  
**Next:** API Development + Admin Dashboard + Mobile UI Implementation
