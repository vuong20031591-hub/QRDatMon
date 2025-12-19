plugins {
    id("qrdatmon.android.feature")
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.hilt)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.qrdatmon.feature.auth"
}

dependencies {
    implementation(project(":core:data"))
    implementation(project(":core:common"))
    implementation(project(":core:network"))
    
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    
    implementation(libs.hilt.android)
    ksp(libs.hilt.android.compiler)
    
    // Firebase Auth
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.auth)
    
    // Google Identity / Credential Manager
    implementation(libs.credentials)
    implementation(libs.credentials.play.services)
    implementation(libs.googleid)
    
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.kotlinx.coroutines.android)
    
    testImplementation(libs.junit)
    testImplementation(libs.mockk)
    testImplementation(libs.kotlinx.coroutines.test)
    testImplementation(libs.turbine)
    testImplementation(libs.truth)
    
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
}
