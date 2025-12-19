package com.qrdatmon.customer.ui.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel

/**
 * LoginScreen với ViewModel integration
 * Requirements: 4.1, 4.2, 4.5
 */
@Composable
fun LoginScreen(
    viewModel: LoginViewModel = hiltViewModel(),
    onBackClick: () -> Unit,
    onNavigateToOtp: () -> Unit,
    onLoginSuccess: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var phoneNumber by remember { mutableStateOf("") }
    val isPhoneValid = phoneNumber.length >= 9
    val context = androidx.compose.ui.platform.LocalContext.current

    // Navigate to OTP screen when OTP is sent successfully
    LaunchedEffect(uiState.otpSent) {
        if (uiState.otpSent) {
            onNavigateToOtp()
        }
    }

    // Navigate to main screen when login is successful (Google Sign-In)
    LaunchedEffect(uiState.isLoginSuccess) {
        if (uiState.isLoginSuccess) {
            onLoginSuccess()
        }
    }

    // Show error snackbar
    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(uiState.errorMessage) {
        uiState.errorMessage?.let { error ->
            snackbarHostState.showSnackbar(
                message = error,
                duration = SnackbarDuration.Short
            )
            viewModel.clearError()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color.White)
                .background(
                    brush = Brush.radialGradient(
                        colors = listOf(
                            Color(0x1FFF6F3C),
                            Color.Transparent
                        ),
                        center = androidx.compose.ui.geometry.Offset(0.5f, 0f),
                        radius = 1000f
                    )
                )
                .padding(horizontal = 24.dp, vertical = 24.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(0.dp)
                ) {
                    // Header with Back Button
                    LoginHeader(onBackClick = onBackClick)

                    Spacer(modifier = Modifier.height(40.dp))

                    // App Logo and Name
                    AppBranding()

                    Spacer(modifier = Modifier.height(48.dp))

                    // Title and Description
                    LoginTitle()

                    Spacer(modifier = Modifier.height(32.dp))

                    // Phone Input Section
                    PhoneInputSection(
                        phoneNumber = phoneNumber,
                        onPhoneNumberChange = { phoneNumber = it },
                        isEnabled = !uiState.isLoading
                    )

                    Spacer(modifier = Modifier.height(40.dp))

                    // Send OTP Button with loading state
                    Button(
                        onClick = { 
                            if (isPhoneValid && !uiState.isLoading) {
                                viewModel.sendOtp(phoneNumber)
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        shape = RoundedCornerShape(28.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isPhoneValid) Color(0xFFFF6F3C) else Color(0x66FF6F3C),
                            disabledContainerColor = Color(0x66FF6F3C)
                        ),
                        enabled = isPhoneValid && !uiState.isLoading
                    ) {
                        if (uiState.isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text(
                                text = "Gửi mã OTP",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.White
                            )
                        }
                    }

                Spacer(modifier = Modifier.height(20.dp))

                // Divider with "Hoặc"
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Divider(
                        modifier = Modifier.weight(1f),
                        color = Color(0xFFE0E0E0),
                        thickness = 1.dp
                    )
                    Text(
                        text = "Hoặc",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF666666)
                    )
                    Divider(
                        modifier = Modifier.weight(1f),
                        color = Color(0xFFE0E0E0),
                        thickness = 1.dp
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Google Sign In Button
                OutlinedButton(
                    onClick = { viewModel.signInWithGoogle(context) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    shape = RoundedCornerShape(28.dp),
                    border = androidx.compose.foundation.BorderStroke(1.5.dp, Color(0xFFFF6F3C)),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = Color.White
                    ),
                    enabled = !uiState.isGoogleLoading && !uiState.isLoading
                ) {
                    if (uiState.isGoogleLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = Color(0xFFFF6F3C),
                            strokeWidth = 2.dp
                        )
                    } else {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Image(
                                painter = painterResource(id = com.qrdatmon.customer.R.drawable.logo_google),
                                contentDescription = "Google",
                                modifier = Modifier.size(24.dp)
                            )
                            Text(
                                text = "Đăng nhập bằng Google",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFFFF6F3C)
                            )
                        }
                    }
                }
            }

                // Terms and Privacy
                Text(
                    text = "Bằng cách tiếp tục, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của nhà hàng.",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Normal,
                    color = Color(0xFF666666),
                    textAlign = TextAlign.Center,
                    lineHeight = 18.sp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 16.dp)
                )
            }
        }
    }
}

@Composable
private fun LoginHeader(onBackClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 0.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Back Button
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(Color(0xFFF5F5F5))
                .clickable { onBackClick() },
            contentAlignment = Alignment.Center
        ) {
            // Back Arrow Icon
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "Back",
                tint = Color(0xFF222222),
                modifier = Modifier.size(20.dp)
            )
        }

        // Title
        Text(
            text = "Đăng nhập",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF222222)
        )
    }
}

@Composable
private fun AppBranding() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Logo
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
                .background(Color.White)
                .padding(3.dp),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFFF6F3C)),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = com.qrdatmon.customer.R.drawable.logo),
                    contentDescription = "Logo",
                    modifier = Modifier.size(28.dp)
                )
            }
        }

        // App Name and Subtitle
        Column(
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = "Menu Tại Bàn",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF222222)
            )
            Text(
                text = "Trải nghiệm gọi món thông minh",
                fontSize = 13.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666)
            )
        }
    }
}

@Composable
private fun LoginTitle() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = "Nhập số điện thoại của bạn",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF222222)
        )
        Text(
            text = "Chúng tôi sẽ gửi mã OTP để xác thực và lưu lịch sử hóa đơn của bạn.",
            fontSize = 15.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF666666),
            lineHeight = 20.sp
        )
    }
}

@Composable
private fun PhoneInputSection(
    phoneNumber: String,
    onPhoneNumberChange: (String) -> Unit,
    isEnabled: Boolean = true
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // Label
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Số điện thoại",
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222)
            )
            Text(
                text = "Bắt buộc",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF666666)
            )
        }

        // Phone Input Field
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .background(Color(0xFFF5F5F5), RoundedCornerShape(12.dp))
                .border(1.5.dp, Color(0xFFE0E0E0), RoundedCornerShape(12.dp))
                .padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Country Code
            Text(
                text = "+84",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222)
            )

            Box(
                modifier = Modifier
                    .width(1.dp)
                    .height(24.dp)
                    .background(Color(0xFFE0E0E0))
            )

            // Phone Number Input
            BasicTextField(
                value = phoneNumber,
                onValueChange = { if (it.length <= 10 && isEnabled) onPhoneNumberChange(it) },
                modifier = Modifier.weight(1f),
                textStyle = androidx.compose.ui.text.TextStyle(
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (isEnabled) Color(0xFF222222) else Color(0xFF999999)
                ),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                singleLine = true,
                enabled = isEnabled,
                decorationBox = { innerTextField ->
                    if (phoneNumber.isEmpty()) {
                        Text(
                            text = "Ví dụ: 0912345678",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Normal,
                            color = Color(0xFF999999)
                        )
                    }
                    innerTextField()
                }
            )
        }

        // Helper Text
        Text(
            text = "Số điện thoại được dùng để tra cứu lịch sử hóa đơn và nhận ưu đãi từ nhà hàng.",
            fontSize = 13.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF666666),
            lineHeight = 18.sp,
            modifier = Modifier.padding(top = 0.dp)
        )
    }
}
