plugins {
    id("qrdatmon.android.library")
    id("qrdatmon.android.compose")
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.qrdatmon.core.ui"
}

dependencies {
    implementation(project(":core:common"))
    implementation(project(":core:domain"))
    
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    
    implementation(libs.androidx.navigation.compose)
    implementation(libs.coil.compose)
    
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}
