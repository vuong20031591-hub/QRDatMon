package com.qrdatmon.customer.ui.qr

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

@Composable
fun TableCodeInputScreen(
    onBackClick: () -> Unit,
    onConfirmClick: (String) -> Unit,
    onScanQrClick: () -> Unit
) {
    var tableCode by remember { mutableStateOf("") }
    val isCodeValid = tableCode.isNotEmpty()

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
                TableCodeHeader(onBackClick = onBackClick)

                Spacer(modifier = Modifier.height(20.dp))

                // App Branding
                TableCodeAppBranding()

                Spacer(modifier = Modifier.height(20.dp))

                // Title and Description
                TableCodeTitle()

                Spacer(modifier = Modifier.height(20.dp))

                // Input Card
                TableCodeInputCard(
                    tableCode = tableCode,
                    onTableCodeChange = { tableCode = it }
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Confirm Button
                Button(
                    onClick = { if (isCodeValid) onConfirmClick(tableCode) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(24.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isCodeValid) Color(0xFFFF6F3C) else Color(0x66FF6F3C),
                        disabledContainerColor = Color(0x66FF6F3C)
                    ),
                    enabled = isCodeValid
                ) {
                    Text(
                        text = "Xác nhận",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.White
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Back to QR Scan
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(40.dp)
                        .clickable { onScanQrClick() },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Quay lại quét QR",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFFFF6F3C),
                        modifier = Modifier
                            .border(
                                width = 1.dp,
                                color = Color(0x4DFF6F3C),
                                shape = RoundedCornerShape(0.dp)
                            )
                            .padding(bottom = 2.dp)
                    )
                }
            }

            // Terms
            Text(
                text = "Tiếp tục đồng nghĩa với việc bạn đồng ý để nhà hàng ghi nhận order cho bàn này.",
                fontSize = 12.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666),
                textAlign = TextAlign.Center,
                lineHeight = 17.sp,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            )
        }
    }
}

@Composable
private fun TableCodeHeader(onBackClick: () -> Unit) {
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
            text = "Nhập mã bàn",
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF222222)
        )
    }
}

@Composable
private fun TableCodeAppBranding() {
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
                    painter = painterResource(id = android.R.drawable.ic_menu_gallery),
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
                text = "Kết nối đúng bàn, phục vụ chính xác",
                fontSize = 12.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666)
            )
        }
    }
}

@Composable
private fun TableCodeTitle() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(5.dp)
    ) {
        Text(
            text = "Nhập số bàn hoặc mã trên thẻ",
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF222222)
        )
        Text(
            text = "Nếu không quét được QR, hãy điền mã được in trên bàn, kẹp hóa đơn hoặc thẻ nhỏ.",
            fontSize = 14.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF666666),
            lineHeight = 20.sp
        )
    }
}

@Composable
private fun TableCodeInputCard(
    tableCode: String,
    onTableCodeChange: (String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.dp, Color(0x05000000), RoundedCornerShape(16.dp))
            .padding(horizontal = 14.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Label and Example
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Số bàn / Mã bàn",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF222222)
                )
                Text(
                    text = "Ví dụ: A12, B5, 203...",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Normal,
                    color = Color(0xFF666666)
                )
            }

            // Input Field
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(39.dp)
                    .background(Color(0xFFF5F5F5), RoundedCornerShape(8.dp))
                    .border(1.dp, Color(0xFFF5F5F5), RoundedCornerShape(8.dp))
                    .padding(horizontal = 12.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Prefix
                Text(
                    text = "Bàn",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF666666),
                    modifier = Modifier.padding(end = 8.dp)
                )

                Box(
                    modifier = Modifier
                        .width(1.dp)
                        .height(17.dp)
                        .background(Color(0xFFE0E0E0))
                )

                // Input
                BasicTextField(
                    value = tableCode,
                    onValueChange = onTableCodeChange,
                    modifier = Modifier.weight(1f),
                    textStyle = androidx.compose.ui.text.TextStyle(
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Normal,
                        color = Color(0xFF222222)
                    ),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text),
                    singleLine = true,
                    decorationBox = { innerTextField ->
                        if (tableCode.isEmpty()) {
                            Text(
                                text = "Nhập số bàn hoặc mã của bạn",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Normal,
                                color = Color(0xFF666666)
                            )
                        }
                        innerTextField()
                    }
                )
            }
        }

        // Warning Note
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.Top
        ) {
            Box(
                modifier = Modifier
                    .width(3.5.dp)
                    .height(6.dp)
                    .background(Color(0xFFFF6F3C), RoundedCornerShape(999.dp))
                    .offset(y = 6.dp)
            )
            Text(
                text = "Hãy đảm bảo bạn nhập đúng mã tại bàn hiện tại để nhà hàng phục vụ chính xác cho bạn.",
                fontSize = 12.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666),
                lineHeight = 17.sp,
                modifier = Modifier.weight(1f)
            )
        }
    }
}
