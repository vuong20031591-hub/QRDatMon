plugins {
    id("qrdatmon.android.library")
    alias(libs.plugins.hilt)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.qrdatmon.core.database"
}

dependencies {
    implementation(project(":core:common"))
    implementation(project(":core:domain"))
    
    implementation(libs.hilt.android)
    ksp(libs.hilt.android.compiler)
    
    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    ksp(libs.room.compiler)
    
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.kotlinx.coroutines.android)
    
    testImplementation(libs.junit)
    testImplementation(libs.androidx.junit)
}
