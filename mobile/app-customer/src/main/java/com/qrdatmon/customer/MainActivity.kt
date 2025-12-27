package com.qrdatmon.customer

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.hilt.navigation.compose.hiltViewModel
import com.qrdatmon.customer.ui.auth.GoogleSignInViewModel
import com.qrdatmon.customer.ui.auth.LoginScreen
import com.qrdatmon.customer.ui.auth.OtpVerificationScreen
import com.qrdatmon.customer.ui.cart.CartScreen
import com.qrdatmon.customer.ui.menu.MenuItemDetailScreen
import com.qrdatmon.customer.ui.menu.MenuScreen
import com.qrdatmon.customer.ui.onboarding.OnboardingScreen
import com.qrdatmon.customer.ui.orderstatus.OrderStatusScreen
import com.qrdatmon.customer.ui.payment.PaymentFailedScreen
import com.qrdatmon.customer.ui.payment.PaymentScreen
import com.qrdatmon.customer.ui.payment.PaymentSuccessScreen
import com.qrdatmon.customer.ui.payment.VietQRPaymentScreen
import com.qrdatmon.customer.ui.profile.ProfileScreen
import com.qrdatmon.customer.ui.favorites.FavoritesScreen
import com.qrdatmon.customer.ui.promo.PromoDetailScreen
import com.qrdatmon.customer.ui.support.SupportStatusScreen
import com.qrdatmon.customer.ui.qr.QrScanScreen
import com.qrdatmon.customer.ui.qr.TableCodeInputScreen
import com.qrdatmon.customer.ui.splash.SimpleSplashScreen
import com.qrdatmon.customer.ui.theme.QRDatMonTheme
import dagger.hilt.android.AndroidEntryPoint
import timber.log.Timber

/**
 * MainActivity with Deep Link Handler
 * Requirements: 7.3, 7.4, 3.4
 */
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    // Store deep link qrToken to pass to Compose
    private var deepLinkQrToken by mutableStateOf<String?>(null)
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Handle deep link on app launch
        handleDeepLink(intent)
        
        setContent {
            QRDatMonTheme {
                QRDatMonCustomerApp(
                    deepLinkQrToken = deepLinkQrToken,
                    onDeepLinkHandled = { deepLinkQrToken = null }
                )
            }
        }
    }
    
    /**
     * Handle deep link when app is already running
     * Requirements: 7.3, 7.4
     */
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleDeepLink(intent)
    }
    
    /**
     * Parse deep link and extract qrToken
     * Requirements: 7.3, 7.4, 3.4
     * 
     * Supported format: https://qrdatmon.app/table/{qrToken}
     */
    private fun handleDeepLink(intent: Intent?) {
        val data: Uri? = intent?.data
        
        if (data != null) {
            Timber.d("Deep link received: $data")
            
            // Check if it's a table deep link
            if (data.host == "qrdatmon.app" && data.pathSegments.firstOrNull() == "table") {
                val qrToken = data.pathSegments.getOrNull(1)
                
                if (qrToken != null && qrToken.length == 32 && qrToken.matches(Regex("^[0-9a-fA-F]{32}$"))) {
                    Timber.d("Valid qrToken extracted from deep link: $qrToken")
                    deepLinkQrToken = qrToken
                } else {
                    Timber.w("Invalid qrToken format in deep link: $qrToken")
                }
            } else {
                Timber.w("Deep link does not match expected format: $data")
            }
        }
    }
}

@Composable
fun QRDatMonCustomerApp(
    deepLinkQrToken: String? = null,
    onDeepLinkHandled: () -> Unit = {}
) {
    var currentScreen by remember { mutableStateOf("splash") }
    var previousScreen by remember { mutableStateOf("menu") }
    var phoneNumber by remember { mutableStateOf("") }
    var tableCode by remember { mutableStateOf("") }
    var selectedMenuItem by remember { mutableStateOf("") }
    var selectedMenuItemId by remember { mutableStateOf("") }
    
    // Google Sign-In ViewModel cho Onboarding screen
    val googleSignInViewModel: GoogleSignInViewModel = hiltViewModel()
    val googleSignInState by googleSignInViewModel.uiState.collectAsState()
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }
    
    // Get AuthManager to check login state
    val authManager = remember { 
        com.qrdatmon.core.common.auth.AuthManager(context, "customer_auth_prefs")
    }
    
    // Initialize FavoritesManager
    LaunchedEffect(Unit) {
        com.qrdatmon.customer.data.FavoritesManager.init(context)
    }

    // Handle deep link auto-join
    // Requirements: 3.4, 7.3, 7.4
    LaunchedEffect(deepLinkQrToken) {
        if (deepLinkQrToken != null) {
            Timber.d("Deep link qrToken detected: $deepLinkQrToken")
            
            // Check if user is logged in
            if (authManager.isLoggedIn()) {
                // Auto navigate to QR scan screen with qrToken
                tableCode = deepLinkQrToken
                currentScreen = "qr_scan"
                Timber.d("Auto-navigating to QR scan with token")
            } else {
                // Save token and navigate to login
                tableCode = deepLinkQrToken
                currentScreen = "onboarding"
                Timber.d("User not logged in, navigating to onboarding with saved token")
            }
            
            // Mark deep link as handled
            onDeepLinkHandled()
        }
    }

    // Handle Google Sign-In success từ Onboarding
    LaunchedEffect(googleSignInState.isSuccess) {
        if (googleSignInState.isSuccess) {
            googleSignInViewModel.resetState()
            currentScreen = "qr_scan"
        }
    }

    // Show error snackbar
    LaunchedEffect(googleSignInState.errorMessage) {
        googleSignInState.errorMessage?.let { error ->
            snackbarHostState.showSnackbar(
                message = error,
                duration = SnackbarDuration.Short
            )
            googleSignInViewModel.clearError()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        when (currentScreen) {
            "splash" -> {
                SimpleSplashScreen(
                    onNavigateToHome = { 
                        // Check if user is already logged in
                        currentScreen = if (authManager.isLoggedIn()) {
                            "qr_scan" // Skip onboarding if logged in
                        } else {
                            "onboarding"
                        }
                    }
                )
            }
            "onboarding" -> {
                OnboardingScreen(
                    onLoginClick = { currentScreen = "login" },
                    onGoogleSignInClick = { googleSignInViewModel.signInWithGoogle(context) },
                    onSkipClick = { currentScreen = "qr_scan" },
                    isGoogleLoading = googleSignInState.isLoading
                )
            }
            "login" -> {
                LoginScreen(
                    onBackClick = { currentScreen = "onboarding" },
                    onNavigateToOtp = { currentScreen = "otp_verification" },
                    onLoginSuccess = { currentScreen = "qr_scan" }
                )
            }
        "otp_verification" -> {
            OtpVerificationScreen(
                onBackClick = { currentScreen = "login" },
                onNavigateToMain = { currentScreen = "qr_scan" }
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
                },
                deepLinkQrToken = if (tableCode.isNotEmpty() && tableCode.length == 32) tableCode else null
            )
        }
        "table_code_input" -> {
            TableCodeInputScreen(
                onBackClick = { currentScreen = "qr_scan" },
                onConfirmClick = { tableId ->
                    tableCode = tableId
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
                onNavigateToOrderStatus = { currentScreen = "order_status" },
                onViewAllPromos = { currentScreen = "promo_detail" },
                onMenuItemClick = { itemId ->
                    selectedMenuItemId = itemId
                    selectedMenuItem = "" // Will be loaded from API
                    currentScreen = "menu_item_detail"
                },
                onProfileClick = {
                    previousScreen = "menu"
                    currentScreen = "profile"
                },
                onFavoritesClick = {
                    previousScreen = "menu"
                    currentScreen = "favorites"
                }
            )
        }
        "menu_item_detail" -> {
            MenuItemDetailScreen(
                itemId = selectedMenuItemId,
                itemName = "", // Will be loaded from API
                tableCode = tableCode.ifEmpty { "A12" },
                onBackClick = { currentScreen = "menu" },
                onAddToCart = { quantity ->
                    // Navigate to cart after adding item
                    currentScreen = "cart"
                },
                onNavigateToMenu = { currentScreen = "menu" },
                onNavigateToCart = { currentScreen = "cart" },
                onNavigateToOrderStatus = { currentScreen = "order_status" }
            )
        }
        "promo_detail" -> {
            PromoDetailScreen(
                onBackClick = { currentScreen = "menu" },
                onApplyPromo = { currentScreen = "menu" },
                onViewMenu = { currentScreen = "menu" }
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
                onNavigateToOrderStatus = { currentScreen = "order_status" },
                onNavigateToLogin = { currentScreen = "login" },
                onProfileClick = {
                    previousScreen = "cart"
                    currentScreen = "profile"
                },
                onFavoritesClick = {
                    previousScreen = "cart"
                    currentScreen = "favorites"
                },
                onMenuItemClick = { itemId ->
                    selectedMenuItemId = itemId
                    selectedMenuItem = ""
                    currentScreen = "menu_item_detail"
                }
            )
        }
        "order_status" -> {
            OrderStatusScreen(
                tableCode = tableCode.ifEmpty { "A12" },
                onBackClick = { currentScreen = "menu" },
                onNavigateToMenu = { currentScreen = "menu" },
                onNavigateToCart = { currentScreen = "cart" },
                onNavigateToPayment = { currentScreen = "payment" },
                onCallStaff = { currentScreen = "support_status" },
                onProfileClick = {
                    previousScreen = "order_status"
                    currentScreen = "profile"
                },
                onFavoritesClick = {
                    previousScreen = "order_status"
                    currentScreen = "favorites"
                }
            )
        }
        "payment" -> {
            PaymentScreen(
                tableCode = tableCode.ifEmpty { "A12" },
                orderNumber = "#1248",
                onBackClick = { currentScreen = "order_status" },
                onPaymentConfirm = { /* TODO: Handle payment confirmation */ },
                onPaymentViaQR = { currentScreen = "vietqr_payment" },
                onNavigateToMenu = { currentScreen = "menu" },
                onNavigateToCart = { currentScreen = "cart" },
                onNavigateToOrderStatus = { currentScreen = "order_status" }
            )
        }
        "vietqr_payment" -> {
            VietQRPaymentScreen(
                tableCode = tableCode.ifEmpty { "A12" },
                orderNumber = "#1248",
                onBackClick = { currentScreen = "payment" },
                onNavigateToMenu = { currentScreen = "menu" },
                onNavigateToCart = { currentScreen = "cart" },
                onNavigateToOrderStatus = { currentScreen = "order_status" }
            )
        }
        "payment_success" -> {
            PaymentSuccessScreen(
                tableCode = tableCode.ifEmpty { "A12" },
                orderNumber = "#1248",
                onBackClick = { currentScreen = "menu" },
                onRateExperience = { /* TODO: Navigate to rating screen */ },
                onViewOrderHistory = { /* TODO: Navigate to order history */ },
                onNavigateToMenu = { currentScreen = "menu" },
                onNavigateToCart = { currentScreen = "cart" },
                onNavigateToOrderStatus = { currentScreen = "order_status" }
            )
        }
        "payment_failed" -> {
            PaymentFailedScreen(
                tableCode = tableCode.ifEmpty { "A12" },
                orderNumber = "#1248",
                onBackClick = { currentScreen = "payment" },
                onRetryPayment = { currentScreen = "payment" },
                onTryVietQR = { currentScreen = "vietqr_payment" },
                onCallStaff = { currentScreen = "support_status" },
                onNavigateToMenu = { currentScreen = "menu" },
                onNavigateToCart = { currentScreen = "cart" },
                onNavigateToOrderStatus = { currentScreen = "order_status" }
            )
        }
        "support_status" -> {
            SupportStatusScreen(
                tableCode = tableCode.ifEmpty { "A12" },
                onBackClick = { currentScreen = "order_status" },
                onViewOrderStatus = { currentScreen = "order_status" },
                onNavigateToMenu = { currentScreen = "menu" },
                onNavigateToCart = { currentScreen = "cart" },
                onNavigateToSupport = { currentScreen = "support_status" }
            )
        }
        "profile" -> {
            ProfileScreen(
                onBackClick = { currentScreen = previousScreen },
                onLogout = { currentScreen = "onboarding" }
            )
        }
        "favorites" -> {
            FavoritesScreen(
                onBackClick = { currentScreen = previousScreen },
                onItemClick = { itemId ->
                    selectedMenuItemId = itemId
                    selectedMenuItem = ""
                    currentScreen = "menu_item_detail"
                }
            )
        }
        "home" -> {
            Greeting(
                name = "QRDatMon Customer - Home",
                modifier = Modifier.padding(paddingValues)
            )
        }
        else -> {
            Greeting(
                name = "QRDatMon Customer",
                modifier = Modifier.padding(paddingValues)
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
