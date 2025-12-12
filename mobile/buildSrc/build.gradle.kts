plugins {
    `kotlin-dsl`
}

repositories {
    google()
    mavenCentral()
    gradlePluginPortal()
}

dependencies {
    implementation("com.android.tools.build:gradle:8.13.1")
    implementation("org.jetbrains.kotlin:kotlin-gradle-plugin:2.1.0")
}

configurations.all {
    resolutionStrategy {
        force("com.squareup:javapoet:1.13.0")
    }
}

gradlePlugin {
    plugins {
        register("androidLibrary") {
            id = "qrdatmon.android.library"
            implementationClass = "AndroidLibraryConventionPlugin"
        }
        register("androidFeature") {
            id = "qrdatmon.android.feature"
            implementationClass = "AndroidFeatureConventionPlugin"
        }
        register("androidCompose") {
            id = "qrdatmon.android.compose"
            implementationClass = "AndroidComposeConventionPlugin"
        }
    }
}
