plugins {
    id("qrdatmon.android.library")
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.qrdatmon.core.common"
}

dependencies {
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.timber)
}
