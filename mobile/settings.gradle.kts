pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "QRDatMon"

// App Modules (2 Mobile Apps)
include(":app-customer")
include(":app-staff")

// Core Modules
include(":core:common")
include(":core:domain")
include(":core:data")
include(":core:network")
include(":core:database")
include(":core:ui")

// Feature Modules
include(":feature:auth")
include(":feature:qr")
include(":feature:menu")
include(":feature:order")
include(":feature:payment")
include(":feature:table")
include(":feature:review")
include(":feature:notification")
