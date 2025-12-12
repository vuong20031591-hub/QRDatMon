# QRDatMon - Restaurant Management System

## 📱 Multi-App Restaurant Solution

QRDatMon là hệ thống quản lý nhà hàng toàn diện với 4 ứng dụng Android:

- **Customer App** - Ứng dụng khách hàng: Quét QR, đặt món, thanh toán
- **Staff App** - Ứng dụng nhân viên: Quản lý bàn, xử lý đơn hàng
- **KDS App** - Màn hình bếp: Hiển thị đơn hàng real-time
- **Admin App** - Ứng dụng quản trị: Quản lý menu, báo cáo, thống kê

## 🏗️ Architecture

### Multi-Module Clean Architecture + MVI

```
QRDatMon/
├── app-customer/          # Customer Android app
├── app-staff/             # Staff Android app
├── app-kds/               # Kitchen Display System
├── app-admin/             # Admin app
│
├── feature/               # Feature modules
│   ├── auth/
│   ├── qr/
│   ├── menu/
│   ├── order/
│   ├── payment/
│   ├── table/
│   ├── review/
│   └── notification/
│
├── core/                  # Core modules
│   ├── common/           # Shared utilities
│   ├── domain/           # Domain models & repositories
│   ├── data/             # Repository implementations
│   ├── network/          # Network layer (Retrofit + WebSocket)
│   ├── database/         # Local database (Room)
│   └── ui/               # Shared UI components
│
└── buildSrc/             # Convention Plugins
```

## 🚀 Tech Stack

### Core Technologies
- **Language**: Kotlin
- **UI**: Jetpack Compose
- **Architecture**: Clean Architecture + MVI
- **DI**: Hilt
- **Async**: Coroutines + Flow

### Networking
- **HTTP**: Retrofit + OkHttp
- **Real-time**: WebSocket (OkHttp)
- **Serialization**: Kotlinx Serialization

### Database
- **Local DB**: Room
- **Cache**: In-memory + Disk cache

### Additional Libraries
- **QR Scanner**: ML Kit Barcode Scanning
- **Image Loading**: Coil
- **Navigation**: Compose Navigation
- **Payment**: Razorpay
- **Logging**: Timber

## 📦 Module Dependencies

### Dependency Flow
```
app-* → feature → core/data → core/domain
                            → core/network
                            → core/database
                  → core/ui → core/common
```

### Module Types
1. **App Modules** - Application entry points
2. **Feature Modules** - Self-contained features (domain + presentation)
3. **Core Modules** - Shared infrastructure

## 🛠️ Setup

### Prerequisites
- Android Studio Hedgehog or later
- JDK 11
- Android SDK 24+

### Build
```bash
# Clean build
./gradlew clean

# Build all apps
./gradlew assembleDebug

# Build specific app
./gradlew :app-customer:assembleDebug
```

### Run Tests
```bash
# All tests
./gradlew test

# Specific module tests
./gradlew :core:data:test
```

## 🎯 Development Workflow

### 1. Feature Development
```
feature/<feature-name>/
├── domain/              # Business logic
│   ├── model/
│   ├── usecase/
│   └── repository/
└── presentation/        # UI layer
    ├── <FeatureName>Screen.kt
    ├── <FeatureName>ViewModel.kt
    ├── <FeatureName>State.kt
    └── <FeatureName>Intent.kt
```

### 2. MVI Pattern
```kotlin
// State
data class MenuState(
    val items: List<MenuItem> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

// Intent
sealed interface MenuIntent {
    data object LoadMenu : MenuIntent
    data class AddToCart(val item: MenuItem) : MenuIntent
}

// ViewModel
class MenuViewModel : ViewModel() {
    private val _state = MutableStateFlow(MenuState())
    val state = _state.asStateFlow()
    
    fun onIntent(intent: MenuIntent) { /* handle intent */ }
}
```

## 📝 Convention Plugins

Dự án sử dụng Convention Plugins để giảm boilerplate:

- `qrdatmon.android.library` - Base Android library
- `qrdatmon.android.feature` - Feature module với Compose
- `qrdatmon.android.compose` - Compose configuration

## 🔧 Build Configuration

### Version Catalog
Dependencies được quản lý trong `gradle/libs.versions.toml`

### Performance Optimization
```properties
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.jvmargs=-Xmx4096m
```

## 📱 Apps

### Customer App (app-customer)
- Package: `com.qrdatmon.customer`
- Features: QR scan, menu, order, payment, review

### Staff App (app-staff)
- Package: `com.qrdatmon.staff`
- Features: Table management, order processing, payment

### KDS App (app-kds)
- Package: `com.qrdatmon.kds`
- Features: Real-time order queue, status updates

### Admin App (app-admin)
- Package: `com.qrdatmon.admin`
- Features: Menu management, reports, analytics

## 🤝 Contributing

1. Create feature branch from `develop`
2. Follow coding conventions
3. Write tests
4. Submit PR

## 📄 License

Proprietary - All rights reserved

## 👥 Team

Developed with ❤️ by QRDatMon Team
