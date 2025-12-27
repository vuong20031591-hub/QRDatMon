plugins {
    id("qrdatmon.android.library")
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.hilt)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.qrdatmon.core.network"
    
    buildFeatures {
        buildConfig = true
    }
    
    defaultConfig {
        // Thay đổi BASE_URL tùy theo môi trường test:
        // - Emulator: http://10.0.2.2:3000/api/
        // - Real Device: http://192.168.1.65:3000/api/
        // - Production: https://api.qrdatmon.com/api/
        
        buildConfigField("String", "BASE_URL", "\"http://192.168.1.65:3000/api/\"")
        buildConfigField("String", "WS_URL", "\"ws://192.168.1.65:3000/\"")
        buildConfigField("String", "API_TIMEOUT", "\"30\"")
    }
}

dependencies {
    implementation(project(":core:common"))
    implementation(project(":core:domain"))
    
    // Firebase Auth
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.auth)
    
    // Hilt
    implementation(libs.hilt.android)
    ksp(libs.hilt.android.compiler)
    
    // Retrofit & OkHttp
    implementation(libs.retrofit)
    implementation(libs.retrofit.kotlinx.serialization)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging.interceptor)
    
    // Kotlinx Serialization
    implementation(libs.kotlinx.serialization.json)
    
    // Coroutines
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.kotlinx.coroutines.android)
    
    // Timber for logging
    implementation(libs.timber)
    
    // Testing
    testImplementation(libs.junit)
    testImplementation(libs.mockk)
}
