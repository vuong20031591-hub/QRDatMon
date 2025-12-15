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
import kotlinx.coroutines.delay

@Composable
fun OtpVerificationScreen(
    phoneNumber: String,
    onBackClick: () -> Unit,
    onVerifyClick: (String) -> Unit,
    onResendOtp: () -> Unit
) {
    var otpValues by remember { mutableStateOf(List(6) { "" }) }
    var timeLeft by remember { mutableStateOf(45) }
    val isOtpComplete = otpValues.all { it.isNotEmpty() }

    // Countdown timer
    LaunchedEffect(timeLeft) {
        if (timeLeft > 0) {
            delay(1000L)
            timeLeft--
        }
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
                OtpHeader(onBackClick = onBackClick)

                Spacer(modifier = Modifier.height(16.dp))

                // App Branding
                OtpAppBranding()

                Spacer(modifier = Modifier.height(20.dp))

                // Title and Description
                OtpTitle(phoneNumber = phoneNumber)

                Spacer(modifier = Modifier.height(24.dp))

                // OTP Input Section
                OtpInputSection(
                    otpValues = otpValues,
                    onOtpChange = { index, value ->
                        otpValues = otpValues.toMutableList().apply {
                            this[index] = value
                        }
                    },
                    timeLeft = timeLeft
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Resend OTP
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
                        text = "Gửi lại OTP",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (timeLeft == 0) Color(0xFFFF6F3C) else Color(0xFF999999),
                        modifier = Modifier.clickable(enabled = timeLeft == 0) {
                            if (timeLeft == 0) {
                                onResendOtp()
                                timeLeft = 45
                            }
                        }
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Verify Button
                Button(
                    onClick = {
                        if (isOtpComplete) {
                            onVerifyClick(otpValues.joinToString(""))
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
                    enabled = isOtpComplete
                ) {
                    Text(
                        text = "Xác nhận",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.White
                    )
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
private fun OtpInputSection(
    otpValues: List<String>,
    onOtpChange: (Int, String) -> Unit,
    timeLeft: Int
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
                color = Color(0xFF222222)
            )
            Text(
                text = "Còn lại ${String.format("%02d:%02d", timeLeft / 60, timeLeft % 60)}",
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF666666)
            )
        }

        // OTP Input Boxes
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            otpValues.forEachIndexed { index, value ->
                OtpInputBox(
                    value = value,
                    onValueChange = { newValue ->
                        if (newValue.length <= 1 && newValue.all { it.isDigit() }) {
                            onOtpChange(index, newValue)
                        }
                    },
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
private fun OtpInputBox(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val isFilled = value.isNotEmpty()
    
    Box(
        modifier = modifier
            .height(52.dp)
            .background(
                color = if (isFilled) Color(0xFFFFF7F3) else Color(0xFFF5F5F5),
                shape = RoundedCornerShape(8.dp)
            )
            .border(
                width = 1.dp,
                color = if (isFilled) Color(0xFFFF6F3C) else Color(0xFFF5F5F5),
                shape = RoundedCornerShape(8.dp)
            ),
        contentAlignment = Alignment.Center
    ) {
        BasicTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            textStyle = androidx.compose.ui.text.TextStyle(
                fontSize = 18.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF222222),
                textAlign = TextAlign.Center
            ),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            singleLine = true,
            decorationBox = { innerTextField ->
                Box(
                    modifier = Modifier.fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    if (value.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF222222))
                        )
                    }
                    innerTextField()
                }
            }
        )
    }
}
