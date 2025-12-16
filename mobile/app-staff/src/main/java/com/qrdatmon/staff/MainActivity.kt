package com.qrdatmon.staff

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.qrdatmon.staff.ui.auth.LoginScreen
import com.qrdatmon.staff.ui.main.MainScreen
import com.qrdatmon.staff.ui.onboarding.OnboardingScreen
import com.qrdatmon.staff.ui.splash.SimpleSplashScreen
import com.qrdatmon.staff.ui.theme.QRDatMonTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            QRDatMonTheme {
                StaffAppNavigation()
            }
        }
    }
}

@Composable
fun StaffAppNavigation() {
    var currentScreen by remember { mutableStateOf("splash") }
    var selectedTable by remember { mutableStateOf<com.qrdatmon.staff.ui.table.Table?>(null) }
    var shouldSwitchToOrderTab by remember { mutableStateOf(false) }

    when (currentScreen) {
        "splash" -> {
            SimpleSplashScreen(
                onNavigateToHome = { currentScreen = "onboarding" }
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
                onLogout = { currentScreen = "onboarding" },
                onTableClick = { table ->
                    selectedTable = table
                    shouldSwitchToOrderTab = true
                    currentScreen = "tableDetail"
                },
                shouldSwitchToOrderTab = shouldSwitchToOrderTab,
                onOrderTabSwitched = { shouldSwitchToOrderTab = false }
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
    }
}
