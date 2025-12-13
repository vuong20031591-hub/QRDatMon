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
import com.qrdatmon.customer.ui.onboarding.OnboardingScreen
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
                onSkipClick = { currentScreen = "home" }
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
                    // TODO: Verify OTP and navigate to home
                    currentScreen = "home"
                },
                onResendOtp = {
                    // TODO: Resend OTP logic
                }
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
