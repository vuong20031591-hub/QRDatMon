plugins {
    id("qrdatmon.android.library")
}

android {
    namespace = "com.qrdatmon.core.domain"
}

dependencies {
    implementation(project(":core:common"))
    
    implementation(libs.kotlinx.coroutines.core)
}
