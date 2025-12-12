import com.android.build.gradle.LibraryExtension
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.configure
import org.gradle.kotlin.dsl.dependencies

class AndroidFeatureConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) {
        with(target) {
            pluginManager.apply {
                apply("qrdatmon.android.library")
                // Note: Compose Compiler plugin must be applied in the module's build.gradle.kts
                // using alias(libs.plugins.kotlin.compose)
            }

            extensions.configure<LibraryExtension> {
                buildFeatures {
                    compose = true
                }
            }

            dependencies {
                add("implementation", project(":core:domain"))
                add("implementation", project(":core:ui"))
                add("implementation", project(":core:common"))

                val composeBom = "androidx.compose:compose-bom:2024.12.01"
                add("implementation", platform(composeBom))
                add("implementation", "androidx.compose.ui:ui")
                add("implementation", "androidx.compose.ui:ui-graphics")
                add("implementation", "androidx.compose.ui:ui-tooling-preview")
                add("implementation", "androidx.compose.material3:material3")
                add("implementation", "androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
                add("implementation", "androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")

                add("implementation", "com.google.dagger:hilt-android:2.52")
                add("implementation", "androidx.hilt:hilt-navigation-compose:1.2.0")
                // Note: KSP dependencies must be added in each module's build.gradle.kts
                // after applying the KSP plugin
            }
        }
    }
}
