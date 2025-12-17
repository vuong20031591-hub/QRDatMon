package com.qrdatmon.staff

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.qrdatmon.staff.util.AuthManager
import com.qrdatmon.staff.ui.auth.LoginScreen
import com.qrdatmon.staff.ui.main.MainScreen
import com.qrdatmon.staff.ui.onboarding.OnboardingScreen
import com.qrdatmon.staff.ui.splash.SimpleSplashScreen
import com.qrdatmon.staff.ui.theme.QRDatMonTheme
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    private val authManager by lazy { AuthManager(this) }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            QRDatMonTheme {
                StaffAppNavigation(authManager)
            }
        }
    }
}

@Composable
fun StaffAppNavigation(authManager: com.qrdatmon.staff.util.AuthManager) {
    // Check if user is already logged in
    val initialScreen = if (authManager.isLoggedIn()) "main" else "splash"
    var currentScreen by remember { mutableStateOf(initialScreen) }
    var selectedTable by remember { mutableStateOf<com.qrdatmon.staff.ui.table.Table?>(null) }

    when (currentScreen) {
        "splash" -> {
            SimpleSplashScreen(
                onNavigateToHome = { 
                    currentScreen = if (authManager.isLoggedIn()) "main" else "onboarding"
                }
            )
        }
        "onboarding" -> {
            OnboardingScreen(
                onLoginClick = { currentScreen = "login" }
            )
        }
        "login" -> {
            LoginScreen(
                onBackClick = { currentScreen = "onboarding" },
                onLoginSuccess = { currentScreen = "main" }
            )
        }
        "main" -> {
            MainScreen(
                onLogout = { 
                    authManager.clearAuthData()
                    currentScreen = "login"
                },
                onTableClick = { table ->
                    selectedTable = table
                    currentScreen = "tableDetail"
                },
                onNavigateToPersonalInfo = { currentScreen = "personalInfo" },
                onNavigateToAttendanceHistory = { currentScreen = "attendanceHistory" },
                onNavigateToSettings = { currentScreen = "settings" },
                authManager = authManager
            )
        }
        "tableDetail" -> {
            selectedTable?.let { table ->
                com.qrdatmon.staff.ui.table.TableDetailScreen(
                    table = table,
                    onBackClick = { 
                        currentScreen = "main"
                        selectedTable = null
                    },
                    onCheckout = {
                        // TODO: Implement checkout
                        currentScreen = "main"
                        selectedTable = null
                    }
                )
            }
        }
        "personalInfo" -> {
            com.qrdatmon.staff.ui.profile.PersonalInfoScreen(
                onBackClick = { currentScreen = "profile" }
            )
        }
        "attendanceHistory" -> {
            com.qrdatmon.staff.ui.profile.AttendanceHistoryScreen(
                onBackClick = { currentScreen = "profile" }
            )
        }
        "settings" -> {
            com.qrdatmon.staff.ui.profile.SettingsScreen(
                onBackClick = { currentScreen = "profile" }
            )
        }
        "profile" -> {
            MainScreen(
                onLogout = { 
                    authManager.clearAuthData()
                    currentScreen = "login"
                },
                onTableClick = { table ->
                    selectedTable = table
                    currentScreen = "tableDetail"
                },
                onNavigateToPersonalInfo = { currentScreen = "personalInfo" },
                onNavigateToAttendanceHistory = { currentScreen = "attendanceHistory" },
                onNavigateToSettings = { currentScreen = "settings" },
                initialTab = 2, // Start at Profile tab
                authManager = authManager
            )
        }
    }
}
