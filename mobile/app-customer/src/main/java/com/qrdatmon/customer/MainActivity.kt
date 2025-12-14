package com.qrdatmon.customer

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.qrdatmon.customer.ui.auth.LoginScreen
import com.qrdatmon.customer.ui.auth.OtpVerificationScreen
import com.qrdatmon.customer.ui.cart.CartScreen
import com.qrdatmon.customer.ui.menu.MenuScreen
import com.qrdatmon.customer.ui.onboarding.OnboardingScreen
import com.qrdatmon.customer.ui.orderstatus.OrderStatusScreen
import com.qrdatmon.customer.ui.qr.QrScanScreen
import com.qrdatmon.customer.ui.qr.TableCodeInputScreen
import com.qrdatmon.customer.ui.splash.SimpleSplashScreen
import com.qrdatmon.customer.ui.theme.QRDatMonTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            QRDatMonTheme {
                QRDatMonCustomerApp()
            }
        }
    }
}

@Composable
fun QRDatMonCustomerApp() {
    var currentScreen by remember { mutableStateOf("splash") }
    var phoneNumber by remember { mutableStateOf("") }
    var tableCode by remember { mutableStateOf("") }

    when (currentScreen) {
        "splash" -> {
            SimpleSplashScreen(
                onNavigateToHome = { currentScreen = "onboarding" }
            )
        }
        "onboarding" -> {
            OnboardingScreen(
                onLoginClick = { currentScreen = "login" },
                onGoogleSignInClick = { currentScreen = "google_signin" },
                onSkipClick = { currentScreen = "qr_scan" }
            )
        }
        "login" -> {
            LoginScreen(
                onBackClick = { currentScreen = "onboarding" },
                onSendOtpClick = { phone ->
                    phoneNumber = phone
                    currentScreen = "otp_verification"
                },
                onGoogleSignInClick = { currentScreen = "google_signin" }
            )
        }
        "otp_verification" -> {
            OtpVerificationScreen(
                phoneNumber = phoneNumber,
                onBackClick = { currentScreen = "login" },
                onVerifyClick = { otp ->
                    // TODO: Verify OTP and navigate to QR scan
                    currentScreen = "qr_scan"
                },
                onResendOtp = {
                    // TODO: Resend OTP logic
                }
            )
        }
        "qr_scan" -> {
            QrScanScreen(
                onBackClick = { currentScreen = "onboarding" },
                onManualInputClick = {
                    currentScreen = "table_code_input"
                },
                onQrScanned = { code ->
                    tableCode = code
                    currentScreen = "menu"
                }
            )
        }
        "table_code_input" -> {
            TableCodeInputScreen(
                onBackClick = { currentScreen = "qr_scan" },
                onConfirmClick = { code ->
                    tableCode = code
                    currentScreen = "menu"
                },
                onScanQrClick = { currentScreen = "qr_scan" }
            )
        }
        "menu" -> {
            MenuScreen(
                tableCode = tableCode.ifEmpty { "A12" },
                onBackClick = { currentScreen = "qr_scan" },
                onCartClick = {
                    currentScreen = "cart"
                },
                onOrderClick = {
                    // TODO: Navigate to order confirmation
                    currentScreen = "home"
                },
                onNavigateToOrderStatus = { currentScreen = "order_status" }
            )
        }
        "cart" -> {
            CartScreen(
                tableCode = tableCode.ifEmpty { "A12" },
                onBackClick = { currentScreen = "menu" },
                onCheckoutClick = {
                    currentScreen = "order_status"
                },
                onNavigateToMenu = { currentScreen = "menu" },
                onNavigateToOrderStatus = { currentScreen = "order_status" }
            )
        }
        "order_status" -> {
            OrderStatusScreen(
                tableCode = tableCode.ifEmpty { "A12" },
                onBackClick = { currentScreen = "menu" },
                onNavigateToMenu = { currentScreen = "menu" },
                onNavigateToCart = { currentScreen = "cart" }
            )
        }
        "home" -> {
            Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                Greeting(
                    name = "QRDatMon Customer - Home",
                    modifier = Modifier.padding(innerPadding)
                )
            }
        }
        else -> {
            Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                Greeting(
                    name = "QRDatMon Customer",
                    modifier = Modifier.padding(innerPadding)
                )
            }
        }
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    QRDatMonTheme {
        Greeting("QRDatMon Customer")
    }
}
