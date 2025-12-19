package com.qrdatmon.customer.ui.auth

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
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
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import kotlinx.coroutines.delay

/**
 * OtpVerificationScreen với ViewModel integration
 * Requirements: 4.3, 4.4, 4.6
 */
@Composable
fun OtpVerificationScreen(
    viewModel: LoginViewModel = hiltViewModel(),
    onBackClick: () -> Unit,
    onNavigateToMain: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var otpValues by remember { mutableStateOf(List(6) { "" }) }
    val isOtpComplete = otpValues.all { it.isNotEmpty() }
    var showError by remember { mutableStateOf(false) }
    var errorText by remember { mutableStateOf("") }
    var hasError by remember { mutableStateOf(false) }
    
    // Focus requesters for auto-focus next field
    val focusRequesters = remember { List(6) { FocusRequester() } }

    // Navigate to main screen when login is successful
    LaunchedEffect(uiState.isLoginSuccess) {
        if (uiState.isLoginSuccess) {
            onNavigateToMain()
        }
    }

    // Auto-submit when OTP is complete (6 digits)
    LaunchedEffect(isOtpComplete) {
        if (isOtpComplete && !uiState.isLoading && !hasError) {
            val otp = otpValues.joinToString("")
            viewModel.verifyOtp(otp)
        }
    }

    // Handle error display
    LaunchedEffect(uiState.errorMessage) {
        uiState.errorMessage?.let { error ->
            errorText = error
            showError = true
            hasError = true
            // Clear OTP on error
            otpValues = List(6) { "" }
            viewModel.clearError()
            // Auto hide error after 4 seconds
            delay(4000L)
            showError = false
            hasError = false
        }
    }

    // Get phone number from ViewModel state
    val phoneNumber = uiState.formattedPhone.ifEmpty { uiState.phoneNumber }
    val displayPhone = if (phoneNumber.startsWith("+84")) {
        "0${phoneNumber.substring(3)}"
    } else {
        phoneNumber
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
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
            .padding(horizontal = 20.dp, vertical = 16.dp)
    ) {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    // Header
                    OtpHeader(
                        onBackClick = {
                            viewModel.resetToPhoneInput()
                            onBackClick()
                        }
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // App Branding
                    OtpAppBranding()

                    Spacer(modifier = Modifier.height(20.dp))

                    // Title and Description
                    OtpTitle(phoneNumber = displayPhone)

                    Spacer(modifier = Modifier.height(24.dp))

                    // OTP Input Section with auto-focus
                    OtpInputSectionWithFocus(
                        otpValues = otpValues,
                        onOtpChange = { index, value ->
                            // Clear error when user starts typing
                            if (showError) {
                                showError = false
                                hasError = false
                            }
                            otpValues = otpValues.toMutableList().apply {
                                this[index] = value
                            }
                            // Auto-focus next field
                            if (value.isNotEmpty() && index < 5) {
                                focusRequesters[index + 1].requestFocus()
                            }
                        },
                        focusRequesters = focusRequesters,
                        cooldownSeconds = uiState.cooldownSeconds,
                        isEnabled = !uiState.isLoading,
                        hasError = hasError
                    )

                    // Error Message Display
                    AnimatedVisibility(
                        visible = showError,
                        enter = fadeIn() + slideInVertically(),
                        exit = fadeOut() + slideOutVertically()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 12.dp)
                                .background(
                                    color = Color(0xFFFFF0F0),
                                    shape = RoundedCornerShape(8.dp)
                                )
                                .border(
                                    width = 1.dp,
                                    color = Color(0xFFFFCDD2),
                                    shape = RoundedCornerShape(8.dp)
                                )
                                .padding(horizontal = 12.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = "Error",
                                tint = Color(0xFFE53935),
                                modifier = Modifier.size(18.dp)
                            )
                            Text(
                                text = errorText,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFFE53935),
                                lineHeight = 18.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Resend OTP with cooldown from ViewModel
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Không nhận được mã? ",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Normal,
                            color = Color(0xFF666666)
                        )
                        Text(
                            text = if (uiState.cooldownSeconds > 0) {
                                "Gửi lại sau ${uiState.cooldownSeconds}s"
                            } else {
                                "Gửi lại OTP"
                            },
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = if (uiState.cooldownSeconds == 0 && !uiState.isLoading) {
                                Color(0xFFFF6F3C)
                            } else {
                                Color(0xFF999999)
                            },
                            modifier = Modifier.clickable(
                                enabled = uiState.cooldownSeconds == 0 && !uiState.isLoading
                            ) {
                                viewModel.resendOtp()
                                otpValues = List(6) { "" }
                            }
                        )
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Verify Button with loading state
                    Button(
                        onClick = {
                            if (isOtpComplete && !uiState.isLoading) {
                                viewModel.verifyOtp(otpValues.joinToString(""))
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(24.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isOtpComplete) Color(0xFFFF6F3C) else Color(0x66FF6F3C),
                            disabledContainerColor = Color(0x66FF6F3C)
                        ),
                        enabled = isOtpComplete && !uiState.isLoading
                    ) {
                        if (uiState.isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text(
                                text = "Xác nhận",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color.White
                            )
                        }
                    }
                }

                // Terms and Privacy
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Khi xác nhận, bạn đồng ý để nhà hàng sử dụng số điện thoại nhắn ",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Normal,
                        color = Color(0xFF666666),
                        textAlign = TextAlign.Center,
                        lineHeight = 17.sp
                    )
                    Row(
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "gửi hóa đơn điện tử",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Normal,
                            color = Color(0xFFFF6F3C),
                            textAlign = TextAlign.Center,
                            lineHeight = 17.sp
                        )
                        Text(
                            text = " và ",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Normal,
                            color = Color(0xFF666666),
                            textAlign = TextAlign.Center,
                            lineHeight = 17.sp
                        )
                        Text(
                            text = "cập nhật ưu đãi",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Normal,
                            color = Color(0xFFFF6F3C),
                            textAlign = TextAlign.Center,
                            lineHeight = 17.sp
                        )
                        Text(
                            text = " phù hợp.",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Normal,
                            color = Color(0xFF666666),
                            textAlign = TextAlign.Center,
                            lineHeight = 17.sp
                        )
                    }
                }
            }
        }
    }

@Composable
private fun OtpHeader(onBackClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Back Button
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(Color(0xFFF5F5F5))
                .clickable { onBackClick() },
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "Back",
                tint = Color(0xFF222222),
                modifier = Modifier.size(18.dp)
            )
        }

        // Title
        Text(
            text = "Xác thực OTP",
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF222222)
        )
    }
}

@Composable
private fun OtpAppBranding() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Logo
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(Color.White)
                .padding(2.dp),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFFF6F3C)),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = com.qrdatmon.customer.R.drawable.logo),
                    contentDescription = "Logo",
                    modifier = Modifier.size(20.dp)
                )
            }
        }

        // App Name and Subtitle
        Column(
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Text(
                text = "Menu Tại Bàn",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222)
            )
            Text(
                text = "Trải nghiệm gọi món thông minh",
                fontSize = 12.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666)
            )
        }
    }
}

@Composable
private fun OtpTitle(phoneNumber: String) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Text(
            text = "Nhập mã xác thực OTP",
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF222222)
        )
        Text(
            text = "Mã OTP đã được gửi tới số $phoneNumber. Vui lòng không chia sẻ mã cho bất kỳ ai.",
            fontSize = 14.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF666666),
            lineHeight = 17.sp
        )
    }
}

@Composable
private fun OtpInputSectionWithFocus(
    otpValues: List<String>,
    onOtpChange: (Int, String) -> Unit,
    focusRequesters: List<FocusRequester>,
    cooldownSeconds: Int,
    isEnabled: Boolean = true,
    hasError: Boolean = false
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // Label with Timer
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Mã OTP",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = if (hasError) Color(0xFFE53935) else Color(0xFF222222)
            )
            Text(
                text = "Còn lại ${String.format("%02d:%02d", cooldownSeconds / 60, cooldownSeconds % 60)}",
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = if (cooldownSeconds > 0) Color(0xFF666666) else Color(0xFFFF6F3C)
            )
        }

        // OTP Input Boxes with focus management
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            otpValues.forEachIndexed { index, value ->
                OtpInputBoxWithFocus(
                    value = value,
                    onValueChange = { newValue ->
                        if (newValue.length <= 1 && newValue.all { it.isDigit() }) {
                            onOtpChange(index, newValue)
                        }
                    },
                    focusRequester = focusRequesters[index],
                    onBackspace = {
                        if (value.isEmpty() && index > 0) {
                            focusRequesters[index - 1].requestFocus()
                        }
                    },
                    isEnabled = isEnabled,
                    hasError = hasError,
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
private fun OtpInputBoxWithFocus(
    value: String,
    onValueChange: (String) -> Unit,
    focusRequester: FocusRequester,
    onBackspace: () -> Unit,
    isEnabled: Boolean = true,
    hasError: Boolean = false,
    modifier: Modifier = Modifier
) {
    val isFilled = value.isNotEmpty()
    
    // Determine colors based on state
    val backgroundColor = when {
        hasError -> Color(0xFFFFF0F0)
        isFilled -> Color(0xFFFFF7F3)
        else -> Color(0xFFF5F5F5)
    }
    val borderColor = when {
        hasError -> Color(0xFFE53935)
        isFilled -> Color(0xFFFF6F3C)
        else -> Color(0xFFF5F5F5)
    }
    
    Box(
        modifier = modifier
            .height(52.dp)
            .background(
                color = backgroundColor,
                shape = RoundedCornerShape(8.dp)
            )
            .border(
                width = if (hasError) 1.5.dp else 1.dp,
                color = borderColor,
                shape = RoundedCornerShape(8.dp)
            ),
        contentAlignment = Alignment.Center
    ) {
        BasicTextField(
            value = value,
            onValueChange = { newValue ->
                if (newValue.isEmpty()) {
                    onValueChange("")
                    onBackspace()
                } else {
                    onValueChange(newValue.takeLast(1))
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .focusRequester(focusRequester),
            textStyle = androidx.compose.ui.text.TextStyle(
                fontSize = 18.sp,
                fontWeight = FontWeight.Medium,
                color = if (isEnabled) Color(0xFF222222) else Color(0xFF999999),
                textAlign = TextAlign.Center
            ),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            singleLine = true,
            enabled = isEnabled,
            decorationBox = { innerTextField ->
                Box(
                    modifier = Modifier.fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    innerTextField()
                }
            }
        )
    }
}
