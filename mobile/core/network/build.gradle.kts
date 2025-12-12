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
        buildConfigField("String", "BASE_URL", "\"https://api.qrdatmon.com/api/v1/\"")
        buildConfigField("String", "WS_URL", "\"wss://api.qrdatmon.com/ws/\"")
        buildConfigField("String", "API_TIMEOUT", "\"30\"")
    }
}

dependencies {
    implementation(project(":core:common"))
    implementation(project(":core:domain"))
    
    implementation(libs.hilt.android)
    ksp(libs.hilt.android.compiler)
    
    implementation(libs.retrofit)
    implementation(libs.retrofit.kotlinx.serialization)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging.interceptor)
    implementation(libs.kotlinx.serialization.json)
    
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.kotlinx.coroutines.android)
    
    testImplementation(libs.junit)
    testImplementation(libs.mockk)
}
