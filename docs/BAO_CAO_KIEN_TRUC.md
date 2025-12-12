# BAO CAO KIEN TRUC DU AN QRDATMON

## He Thong Quan Ly Nha Hang Thong Minh

> **Tài liệu chuẩn bị cho báo cáo đợt 1**  
> **Ngày:** 13/12/2024

---

## MUC LUC

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Kiến Trúc Hệ Thống](#2-kiến-trúc-hệ-thống)
3. [Kiến Trúc Mobile App (Android)](#3-kiến-trúc-mobile-app-android)
4. [Kiến Trúc Web Admin (Next.js)](#4-kiến-trúc-web-admin-nextjs)
5. [Kiến Trúc Backend (Node.js)](#5-kiến-trúc-backend-nodejs)
6. [Kiến Thức Chuyên Môn Cần Có](#6-kiến-thức-chuyên-môn-cần-có)
7. [Các Design Patterns Áp Dụng](#7-các-design-patterns-áp-dụng)
8. [Câu Hỏi Thường Gặp Khi Báo Cáo](#8-câu-hỏi-thường-gặp-khi-báo-cáo)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Mô Tả Dự Án
**QRDatMon** là hệ thống quản lý nhà hàng toàn diện, cho phép:
- Khách hàng quét QR để đặt món trực tiếp từ bàn
- Nhân viên quản lý bàn và xử lý đơn hàng real-time
- Quản lý theo dõi doanh thu, menu và vận hành qua web admin

### 1.2. Các Thành Phần Hệ Thống

```
┌─────────────────────────────────────────────────────────────────┐
│                    QRDATMON SYSTEM ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   MOBILE APPS                 WEB ADMIN            BACKEND      │
│   ┌─────────────┐            ┌──────────┐        ┌──────────┐   │
│   │ Customer App│            │ Next.js  │        │ Node.js  │   │
│   │ (Kotlin)    │◄──────────►│ React    │◄──────►│ Express  │   │
│   └─────────────┘            └──────────┘        └────┬─────┘   │
│   ┌─────────────┐                                     │         │
│   │ Staff App   │                                     ▼         │
│   │ (Kotlin)    │◄───────────────────────────►  ┌──────────┐   │
│   └─────────────┘                               │ MongoDB  │   │
│                                                  └──────────┘   │
│                         ┌──────────────┐                        │
│                         │ Firebase Auth│ (Google OAuth)         │
│                         └──────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3. Technology Stack

| Layer | Technology | Mục đích |
|-------|------------|----------|
| **Mobile** | Kotlin + Jetpack Compose | UI native Android hiện đại |
| **Web Admin** | Next.js 16 + TypeScript | Server-side rendering, SEO |
| **Backend** | Node.js + Express + TypeScript | REST API + WebSocket |
| **Database** | MongoDB + Mongoose | NoSQL linh hoạt |
| **Auth** | Firebase Authentication | Google OAuth |
| **Real-time** | Socket.io | Cập nhật đơn hàng real-time |

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1. Kiến Trúc Tổng Thể: Monorepo Structure

```
QRDatMon/
├── mobile/          # Android Multi-module Project
├── web-admin/       # Next.js Web Application  
├── backend/         # Node.js API Server
└── docs/            # Documentation
```

**Lý do chọn Monorepo:**
- Quan ly code tap trung, de maintain
- Chia se types/models giua cac project
- Dong bo version dependencies
- CI/CD pipeline don gian hon

### 2.2. Data Flow Architecture

```
┌──────────────┐     HTTP/REST      ┌──────────────┐
│  Mobile App  │◄──────────────────►│   Backend    │
│  (Kotlin)    │                    │  (Node.js)   │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       │ WebSocket (Socket.io)             │ Mongoose ODM
       │                                   │
       ▼                                   ▼
┌──────────────┐                    ┌──────────────┐
│  Real-time   │                    │   MongoDB    │
│   Updates    │                    │  Database    │
└──────────────┘                    └──────────────┘
```

---

## 3. KIẾN TRÚC MOBILE APP (ANDROID)

### 3.1. Multi-Module Clean Architecture

Đây là **điểm nhấn kỹ thuật quan trọng nhất** của dự án.

```
mobile/
├── app-customer/          # App khach hang
├── app-staff/             # App nhan vien
│
├── feature/               # Feature Modules (theo tinh nang)
│   ├── auth/              # Đăng nhập Google
│   ├── qr/                # Quét mã QR
│   ├── menu/              # Xem menu
│   ├── order/             # Đặt món
│   ├── payment/           # Thanh toán
│   ├── table/             # Quản lý bàn
│   ├── review/            # Đánh giá
│   └── notification/      # Thông báo
│
├── core/                  # Core Modules (chia se)
│   ├── common/            # Utilities, Extensions
│   ├── domain/            # Domain Models, Repository Interfaces
│   ├── data/              # Repository Implementations
│   ├── network/           # Retrofit, WebSocket
│   ├── database/          # Room Database
│   └── ui/                # Shared UI Components
│
└── buildSrc/              # Convention Plugins
```

### 3.2. Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Screen    │  │  ViewModel  │  │   State + Intent    │  │
│  │  (Compose)  │◄─┤    (MVI)    │◄─┤  (Unidirectional)   │  │
│  └─────────────┘  └──────┬──────┘  └─────────────────────┘  │
├──────────────────────────┼──────────────────────────────────┤
│                    DOMAIN LAYER                              │
│  ┌─────────────┐  ┌──────┴──────┐  ┌─────────────────────┐  │
│  │   Models    │  │   UseCase   │  │ Repository Interface│  │
│  │ (Entities)  │  │ (Business)  │  │    (Contracts)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                     DATA LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Repository  │  │   Mapper    │  │    Data Sources     │  │
│  │   Impl      │  │ (DTO↔Model) │  │  (Remote + Local)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3.3. MVI Pattern (Model-View-Intent)

**Tại sao chọn MVI thay vì MVVM?**
- **Unidirectional Data Flow**: Du lieu chi chay mot chieu
- **Single Source of Truth**: Mot state duy nhat cho UI
- **Predictable**: De debug, de test
- **Thread-safe**: Immutable state

```kotlin
// STATE - Trạng thái UI (Immutable)
data class MenuState(
    val items: List<MenuItem> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val selectedCategory: String? = null
)

// INTENT - Hành động từ User
sealed interface MenuIntent {
    data object LoadMenu : MenuIntent
    data class SelectCategory(val category: String) : MenuIntent
    data class AddToCart(val item: MenuItem) : MenuIntent
    data class Search(val query: String) : MenuIntent
}

// VIEWMODEL - Xử lý logic
class MenuViewModel : ViewModel() {
    private val _state = MutableStateFlow(MenuState())
    val state = _state.asStateFlow()
    
    fun onIntent(intent: MenuIntent) {
        when (intent) {
            is MenuIntent.LoadMenu -> loadMenu()
            is MenuIntent.SelectCategory -> filterByCategory(intent.category)
            // ...
        }
    }
}
```

### 3.4. Dependency Injection với Hilt

```kotlin
// Module cung cấp dependencies
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .addConverterFactory(...)
        .build()
    
    @Provides
    @Singleton
    fun provideMenuApi(retrofit: Retrofit): MenuApi =
        retrofit.create(MenuApi::class.java)
}

// Inject vào ViewModel
@HiltViewModel
class MenuViewModel @Inject constructor(
    private val getMenuUseCase: GetMenuUseCase
) : ViewModel()
```

### 3.5. Convention Plugins (Gradle)

**Mục đích:** Giảm code lặp trong build.gradle.kts của các module

```kotlin
// buildSrc/src/main/kotlin/AndroidFeatureConventionPlugin.kt
class AndroidFeatureConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            // Tự động apply các plugin cần thiết
            pluginManager.apply("qrdatmon.android.library")
            
            // Cấu hình Compose
            extensions.configure<LibraryExtension> {
                buildFeatures { compose = true }
            }
            
            // Dependencies chung cho feature modules
            dependencies {
                add("implementation", project(":core:domain"))
                add("implementation", project(":core:ui"))
                // Compose, Hilt, etc.
            }
        }
    }
}
```

**Sử dụng trong module:**
```kotlin
// feature/menu/build.gradle.kts
plugins {
    id("qrdatmon.android.feature")  // Chỉ 1 dòng!
}
```

---

## 4. KIẾN TRÚC WEB ADMIN (NEXT.JS)

### 4.1. App Router Architecture (Next.js 13+)

```
web-admin/src/
├── app/                    # App Router (File-based routing)
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── dashboard/
│   ├── menu/
│   ├── orders/
│   └── tables/
│
├── components/             # React Components
│   ├── ui/                 # Shadcn/ui components
│   ├── layout/             # Layout components
│   └── forms/              # Form components
│
├── lib/                    # Utilities
│   └── utils.ts
│
└── types/                  # TypeScript definitions
```

### 4.2. Server Components vs Client Components

```tsx
// Server Component (default) - Render trên server
// app/menu/page.tsx
async function MenuPage() {
    const menuItems = await fetchMenuItems(); // Server-side fetch
    return <MenuList items={menuItems} />;
}

// Client Component - Render trên browser
// components/MenuForm.tsx
'use client';
function MenuForm() {
    const [name, setName] = useState('');
    // Interactive logic
}
```

### 4.3. Tech Stack Web Admin

| Library | Mục đích |
|---------|----------|
| **Next.js 16** | React Framework với SSR |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Utility-first CSS |
| **React Hook Form** | Form management |
| **Zod** | Schema validation |
| **Axios** | HTTP client |
| **Firebase Admin** | Server-side auth |

---

## 5. KIẾN TRÚC BACKEND (NODE.JS)

### 5.1. Layered Architecture

```
backend/src/
├── controllers/       # Request handlers
├── routes/            # API route definitions
├── services/          # Business logic
├── models/            # MongoDB schemas
├── middleware/        # Auth, CORS, Error handling
└── utils/             # Helpers, Logger
```

### 5.2. RESTful API Design

```
API Endpoints:

Authentication:
POST   /api/auth/google        # Google OAuth login
GET    /api/auth/verify        # JWT verification

Menu:
GET    /api/menu               # Get all items
POST   /api/menu               # Create item (Admin)
PUT    /api/menu/:id           # Update item
DELETE /api/menu/:id           # Delete item

Orders:
GET    /api/orders             # Get orders
POST   /api/orders             # Create order
PUT    /api/orders/:id/status  # Update status

Tables:
GET    /api/tables             # Get all tables
PUT    /api/tables/:id         # Update table status
```

### 5.3. Real-time với Socket.io

```javascript
// Server-side events
io.on('connection', (socket) => {
    // Order events
    socket.on('order:create', handleNewOrder);
    socket.emit('order:created', orderData);
    
    // Kitchen events
    socket.emit('kitchen:new-order', orderData);
    socket.on('kitchen:order-ready', handleOrderReady);
});
```

---

## 6. KIẾN THỨC CHUYÊN MÔN CẦN CÓ

### 6.1. Android Development

| Kiến thức | Mức độ | Áp dụng trong dự án |
|-----------|--------|---------------------|
| **Kotlin** | Cao | Ngon ngu chinh |
| **Jetpack Compose** | Cao | Declarative UI |
| **Coroutines & Flow** | Cao | Async programming |
| **Hilt (DI)** | Cao | Dependency Injection |
| **Room Database** | Trung binh | Local caching |
| **Retrofit** | Cao | Network calls |
| **Clean Architecture** | Cao | Code organization |
| **MVI Pattern** | Cao | State management |
| **Multi-module** | Cao | Scalability |

### 6.2. Web Development

| Kiến thức | Mức độ | Áp dụng trong dự án |
|-----------|--------|---------------------|
| **React** | Cao | UI library |
| **Next.js** | Cao | React framework |
| **TypeScript** | Cao | Type safety |
| **Tailwind CSS** | Trung binh | Styling |
| **REST API** | Cao | Client-server communication |

### 6.3. Backend Development

| Kiến thức | Mức độ | Áp dụng trong dự án |
|-----------|--------|---------------------|
| **Node.js** | Cao | Runtime |
| **Express.js** | Cao | Web framework |
| **MongoDB** | Cao | Database |
| **Socket.io** | Trung binh | Real-time |
| **JWT/OAuth** | Trung binh | Authentication |

### 6.4. Software Engineering Concepts

| Concept | Giải thích ngắn |
|---------|-----------------|
| **Clean Architecture** | Tách biệt concerns, dependency rule |
| **SOLID Principles** | Single Responsibility, Open/Closed, etc. |
| **Repository Pattern** | Abstract data access |
| **Dependency Injection** | Inversion of Control |
| **Unidirectional Data Flow** | State flows one direction |

---

## 7. CÁC DESIGN PATTERNS ÁP DỤNG

### 7.1. Repository Pattern

```kotlin
// Interface (Domain layer)
interface MenuRepository {
    fun getMenuItems(): Flow<Result<List<MenuItem>>>
    suspend fun refreshMenu(): Result<Unit>
}

// Implementation (Data layer)
class MenuRepositoryImpl(
    private val remoteDataSource: MenuRemoteDataSource,
    private val localDataSource: MenuLocalDataSource
) : MenuRepository {
    
    override fun getMenuItems(): Flow<Result<List<MenuItem>>> = flow {
        // 1. Emit cached data first
        emit(localDataSource.getMenuItems())
        
        // 2. Fetch from network
        val remote = remoteDataSource.fetchMenu()
        
        // 3. Cache and emit fresh data
        localDataSource.saveMenuItems(remote)
        emit(Result.Success(remote))
    }
}
```

**Lợi ích:**
- Tach biet data source khoi business logic
- De dang swap implementation (test, mock)
- Single source of truth

### 7.2. Use Case Pattern

```kotlin
class GetMenuUseCase(
    private val menuRepository: MenuRepository
) {
    operator fun invoke(): Flow<Result<List<MenuItem>>> {
        return menuRepository.getMenuItems()
    }
}

class SearchMenuUseCase(
    private val menuRepository: MenuRepository
) {
    operator fun invoke(query: String): Flow<Result<List<MenuItem>>> {
        return menuRepository.searchMenuItems(query)
    }
}
```

**Lợi ích:**
- Single Responsibility
- Reusable business logic
- Easy to test

### 7.3. Factory Pattern (Convention Plugins)

```kotlin
// Plugin tự động cấu hình module
class AndroidFeatureConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        // Factory method tạo cấu hình chuẩn
        configureAndroidLibrary(target)
        configureCompose(target)
        addCommonDependencies(target)
    }
}
```

### 7.4. Observer Pattern (Flow/StateFlow)

```kotlin
// ViewModel emit state changes
private val _state = MutableStateFlow(MenuState())
val state: StateFlow<MenuState> = _state.asStateFlow()

// UI observes state
@Composable
fun MenuScreen(viewModel: MenuViewModel) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    
    when {
        state.isLoading -> LoadingIndicator()
        state.error != null -> ErrorMessage(state.error)
        else -> MenuList(state.items)
    }
}
```

---

## 8. CÂU HỎI THƯỜNG GẶP KHI BÁO CÁO

### Q1: Tại sao chọn Multi-module thay vì Single-module?

**Trả lời:**
- **Build time**: Chỉ rebuild module thay đổi, không phải toàn bộ app
- **Scalability**: Dễ thêm feature mới mà không ảnh hưởng code cũ
- **Team collaboration**: Nhiều người làm việc song song trên các module khác nhau
- **Code reuse**: Core modules dùng chung cho cả Customer và Staff app
- **Testability**: Test từng module độc lập

### Q2: Clean Architecture có những layer nào?

**Trả lời:**
1. **Presentation Layer**: UI (Compose), ViewModel, State
2. **Domain Layer**: Use Cases, Models, Repository Interfaces
3. **Data Layer**: Repository Implementations, Data Sources, DTOs

**Dependency Rule**: Outer layers depend on inner layers, never reverse.

### Q3: MVI khác gì MVVM?

**Trả lời:**

| Aspect | MVVM | MVI |
|--------|------|-----|
| Data Flow | Bidirectional | Unidirectional |
| State | Multiple LiveData/StateFlow | Single State object |
| User Actions | Direct method calls | Intent/Event objects |
| Predictability | Medium | High |
| Debugging | Harder | Easier (single state) |

### Q4: Tại sao dùng Jetpack Compose thay vì XML?

**Trả lời:**
- **Declarative UI**: Mô tả UI theo state, không phải imperative
- **Less code**: Giảm 50-70% code so với XML
- **Type-safe**: Compile-time checking
- **Preview**: Live preview trong IDE
- **Modern**: Google khuyến khích, tương lai của Android UI

### Q5: Convention Plugins giải quyết vấn đề gì?

**Trả lời:**
- **DRY (Don't Repeat Yourself)**: Không lặp lại cấu hình Gradle
- **Consistency**: Tất cả module có cùng cấu hình
- **Maintainability**: Thay đổi 1 chỗ, apply cho tất cả
- **Readability**: build.gradle.kts của module rất ngắn gọn

### Q6: Tại sao chọn MongoDB thay vì SQL?

**Trả lời:**
- **Flexible schema**: Menu items có thể có toppings khác nhau
- **JSON-like documents**: Phù hợp với JavaScript/TypeScript
- **Scalability**: Horizontal scaling dễ dàng
- **Real-time**: Change streams cho real-time updates

### Q7: Socket.io dùng để làm gì?

**Trả lời:**
- **Real-time order updates**: Khách đặt → Bếp nhận ngay
- **Kitchen Display System**: Cập nhật trạng thái món
- **Table status**: Bàn trống/có khách real-time
- **Notifications**: Push thông báo đến app

### Q8: Hilt khác gì Dagger? Tại sao chọn Hilt?

**Trả lời:**
- **Hilt** là wrapper của Dagger, được Google phát triển riêng cho Android
- **Ưu điểm so với Dagger thuần:**
  - Ít boilerplate code hơn
  - Tự động tạo Component cho Android classes (Activity, Fragment, ViewModel)
  - Tích hợp sẵn với Jetpack (Navigation, WorkManager)
  - Dễ học, dễ setup hơn

```kotlin
// Dagger thuần - phải tạo Component thủ công
@Component(modules = [NetworkModule::class])
interface AppComponent { ... }

// Hilt - chỉ cần annotation
@HiltAndroidApp
class MyApplication : Application()
```

### Q9: Flow khác gì LiveData?

**Trả lời:**

| Aspect | LiveData | Flow |
|--------|----------|------|
| **Lifecycle-aware** | Có (built-in) | Cần collectAsStateWithLifecycle() |
| **Operators** | Ít | Nhiều (map, filter, combine, etc.) |
| **Cold/Hot** | Hot only | Cả Cold và Hot |
| **Backpressure** | Không | Có |
| **Coroutines** | Không native | Native support |
| **Testing** | Khó hơn | Dễ với Turbine |

**Khi nào dùng gì:**
- **LiveData**: UI đơn giản, không cần transform phức tạp
- **Flow**: Business logic, data streams, complex transformations

### Q10: Tại sao tách riêng Domain layer không có Android dependencies?

**Trả lời:**
- **Pure Kotlin**: Domain layer chỉ chứa Kotlin code, không import Android
- **Lợi ích:**
  - Test nhanh hon (JUnit, khong can Android emulator)
  - Reusable cho cac platform khac (KMM - Kotlin Multiplatform)
  - Business logic doc lap voi framework
  - De maintain khi Android API thay doi

```kotlin
// Domain layer - Pure Kotlin
data class MenuItem(
    val id: String,
    val name: String,
    val price: Double
)

interface MenuRepository {
    fun getMenuItems(): Flow<Result<List<MenuItem>>>
}
```

### Q11: Giải thích Unidirectional Data Flow trong MVI?

**Trả lời:**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│    ┌─────────┐    Intent    ┌───────────┐          │
│    │   UI    │─────────────►│ ViewModel │          │
│    │ (View)  │              │           │          │
│    └────▲────┘              └─────┬─────┘          │
│         │                         │                │
│         │         State           │                │
│         └─────────────────────────┘                │
│                                                     │
│         Data chỉ chảy MỘT CHIỀU                    │
└─────────────────────────────────────────────────────┘
```

**Flow:**
1. User tương tác → UI gửi **Intent** (action)
2. ViewModel xử lý Intent → tạo **State** mới
3. UI observe State → render lại

**Lợi ích:**
- Dễ debug: biết chính xác state tại mọi thời điểm
- Predictable: cùng input → cùng output
- Time-travel debugging: có thể replay states

### Q12: Room Database dùng để làm gì trong dự án?

**Trả lời:**
- **Offline-first**: Cache menu, orders để app hoạt động khi mất mạng
- **Performance**: Load data từ local nhanh hơn network
- **Single Source of Truth**: 
  1. Fetch từ API → Save vào Room
  2. UI observe Room → Luôn có data mới nhất

```kotlin
@Dao
interface MenuDao {
    @Query("SELECT * FROM menu_items")
    fun getMenuItems(): Flow<List<MenuItemEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(items: List<MenuItemEntity>)
}
```

### Q13: Tại sao dùng Kotlinx Serialization thay vì Gson/Moshi?

**Trả lời:**

| Library | Ưu điểm | Nhược điểm |
|---------|---------|------------|
| **Gson** | Phổ biến, dễ dùng | Reflection-based, chậm |
| **Moshi** | Nhanh hơn Gson | Cần codegen |
| **Kotlinx Serialization** | Native Kotlin, nhanh nhất, multiplatform | Cần plugin |

**Chọn Kotlinx Serialization vì:**
- Compile-time safe (khong crash runtime)
- Ho tro Kotlin features (default values, nullable)
- Tuong thich Kotlin Multiplatform
- Performance tot nhat

### Q14: WebSocket vs HTTP Polling - Tại sao chọn WebSocket?

**Trả lời:**

| Aspect | HTTP Polling | WebSocket |
|--------|--------------|-----------|
| **Connection** | Mở/đóng liên tục | Persistent |
| **Latency** | Cao (interval) | Thấp (instant) |
| **Server load** | Cao | Thấp |
| **Battery** | Tốn pin | Tiết kiệm |
| **Use case** | Data ít thay đổi | Real-time |

**Trong QRDatMon:**
- Order status cần update ngay lập tức
- Kitchen cần nhận order real-time
- WebSocket là lựa chọn phù hợp

### Q15: Giải thích Version Catalog trong Gradle?

**Trả lời:**
- **File**: `gradle/libs.versions.toml`
- **Mục đích**: Quản lý tập trung tất cả dependencies

```toml
[versions]
kotlin = "2.1.0"
compose = "2024.12.01"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }

[plugins]
android-application = { id = "com.android.application", version.ref = "androidGradlePlugin" }
```

**Sử dụng:**
```kotlin
dependencies {
    implementation(libs.androidx.core.ktx)  // Type-safe!
}
```

**Lợi ích:**
- Single source of truth cho versions
- Type-safe trong IDE
- De update dependencies
- Chia se giua cac module

### Q16: Firebase Auth flow hoạt động như thế nào?

**Trả lời:**

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Mobile  │     │  Google  │     │ Firebase │     │ Backend  │
│   App    │     │  OAuth   │     │   Auth   │     │   API    │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ 1. Login       │                │                │
     │───────────────►│                │                │
     │                │                │                │
     │ 2. Google Token│                │                │
     │◄───────────────│                │                │
     │                │                │                │
     │ 3. Exchange Token               │                │
     │────────────────────────────────►│                │
     │                │                │                │
     │ 4. Firebase ID Token            │                │
     │◄────────────────────────────────│                │
     │                │                │                │
     │ 5. API Request with ID Token    │                │
     │─────────────────────────────────────────────────►│
     │                │                │                │
     │ 6. Verify Token (Firebase Admin)│                │
     │                │                │◄───────────────│
     │                │                │                │
     │ 7. Response    │                │                │
     │◄─────────────────────────────────────────────────│
```

### Q17: Tại sao chọn Next.js thay vì React thuần?

**Trả lời:**

| Feature | React (CRA) | Next.js |
|---------|-------------|---------|
| **Rendering** | CSR only | SSR, SSG, ISR, CSR |
| **Routing** | React Router | File-based (built-in) |
| **SEO** | Kém | Tốt (SSR) |
| **Performance** | Manual optimization | Automatic |
| **API Routes** | Cần backend riêng | Built-in |
| **Image Optimization** | Manual | Automatic |

**Chọn Next.js cho Web Admin vì:**
- Server Components: Load data tren server
- API Routes: Co the lam BFF (Backend for Frontend)
- Performance tot out-of-the-box
- TypeScript support tot

### Q18: Làm sao đảm bảo type-safety giữa Frontend và Backend?

**Trả lời:**
- **Shared Types**: Định nghĩa types chung

```typescript
// types/order.ts (shared)
interface Order {
    id: string;
    tableId: string;
    items: OrderItem[];
    status: OrderStatus;
    totalAmount: number;
}

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served';
```

- **Zod Validation**: Validate runtime data

```typescript
const OrderSchema = z.object({
    id: z.string(),
    tableId: z.string(),
    status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served']),
    totalAmount: z.number().positive()
});

// Validate API response
const order = OrderSchema.parse(apiResponse);
```

### Q19: Giải thích cách xử lý Error trong Clean Architecture?

**Trả lời:**

```kotlin
// Sealed class Result trong core/common
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: AppException) : Result<Nothing>()
    data object Loading : Result<Nothing>()
}

// Custom exceptions
sealed class AppException : Exception() {
    data class NetworkError(override val message: String) : AppException()
    data class ServerError(val code: Int, override val message: String) : AppException()
    data class ValidationError(override val message: String) : AppException()
    data object UnauthorizedError : AppException()
}

// Repository trả về Result
class MenuRepositoryImpl : MenuRepository {
    override fun getMenuItems(): Flow<Result<List<MenuItem>>> = flow {
        emit(Result.Loading)
        try {
            val items = api.fetchMenu()
            emit(Result.Success(items))
        } catch (e: IOException) {
            emit(Result.Error(AppException.NetworkError("No internet")))
        }
    }
}

// ViewModel xử lý Result
viewModelScope.launch {
    menuRepository.getMenuItems().collect { result ->
        _state.update { state ->
            when (result) {
                is Result.Loading -> state.copy(isLoading = true)
                is Result.Success -> state.copy(isLoading = false, items = result.data)
                is Result.Error -> state.copy(isLoading = false, error = result.exception.message)
            }
        }
    }
}
```

### Q20: Dự án có thể mở rộng như thế nào trong tương lai?

**Trả lời:**

**1. Thêm Feature mới:**
```
feature/
├── loyalty/          # Tích điểm khách hàng
├── reservation/      # Đặt bàn trước
├── inventory/        # Quản lý kho
└── analytics/        # AI analytics
```

**2. Kotlin Multiplatform (KMM):**
- Domain layer đã pure Kotlin → Dễ share sang iOS
- Chỉ cần viết UI layer cho iOS

**3. Microservices Backend:**
```
services/
├── auth-service/
├── order-service/
├── payment-service/
├── notification-service/
└── analytics-service/
```

**4. AI Integration:**
- Sentiment analysis cho reviews
- Demand forecasting
- Personalized recommendations

---

## TAI LIEU THAM KHAO

1. **Android Architecture Guide** - developer.android.com
2. **Clean Architecture** - Robert C. Martin
3. **Jetpack Compose** - developer.android.com/jetpack/compose
4. **Next.js Documentation** - nextjs.org/docs
5. **MongoDB Manual** - docs.mongodb.com

---

## CHECKLIST TRUOC KHI BAO CAO

- [ ] Hiểu rõ kiến trúc tổng thể (3 thành phần)
- [ ] Giải thích được Clean Architecture
- [ ] Giải thích được MVI Pattern
- [ ] Biết tại sao chọn Multi-module
- [ ] Hiểu Convention Plugins
- [ ] Nắm được data flow
- [ ] Chuẩn bị demo (nếu có)

---

Chuc ban bao cao thanh cong!

Tai lieu duoc tao tu dong boi Kiro AI Assistant
