package com.qrdatmon.customer.ui.qr

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun QrScanScreen(
    onBackClick: () -> Unit,
    onManualInputClick: () -> Unit,
    onQrScanned: (String) -> Unit
) {
    var isConnecting by remember { mutableStateOf(false) }

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
                    radius = 1200f
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
                QrScanHeader(onBackClick = onBackClick)

                Spacer(modifier = Modifier.height(16.dp))

                // App Branding
                QrAppBranding()

                Spacer(modifier = Modifier.height(16.dp))

                // Title and Description
                QrScanTitle()

                Spacer(modifier = Modifier.height(16.dp))

                // QR Scanner View
                QrScannerView(isConnecting = isConnecting)

                Spacer(modifier = Modifier.height(16.dp))

                // Instructions
                QrScanInstructions()

                Spacer(modifier = Modifier.height(8.dp))

                // Connection Status
                ConnectionStatus(isConnecting = isConnecting)

                Spacer(modifier = Modifier.height(18.dp))

                // Manual Input Button
                Button(
                    onClick = onManualInputClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(24.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFFF6F3C)
                    )
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(16.dp)
                                .border(2.dp, Color.White, RoundedCornerShape(4.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Box(
                                modifier = Modifier
                                    .width(8.dp)
                                    .height(2.dp)
                                    .background(Color.White, RoundedCornerShape(999.dp))
                            )
                        }
                        Text(
                            text = "Nhập mã bàn",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color.White
                        )
                    }
                }
            }

            // Terms
            Text(
                text = "Bằng việc tiếp tục, bạn đồng ý với việc nhà hàng ghi nhận order cho đúng bàn và thời gian hiện tại.",
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
private fun QrScanHeader(onBackClick: () -> Unit) {
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
            text = "Quét QR bàn",
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF222222)
        )
    }
}

@Composable
private fun QrAppBranding() {
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
                text = "Gọi món nhanh, không cần chờ",
                fontSize = 12.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666)
            )
        }
    }
}

@Composable
private fun QrScanTitle() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Text(
            text = "Hãy quét QR trên bàn của bạn",
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF222222)
        )
        Text(
            text = "Kết nối vào đúng bàn để nhà hàng phục vụ chính xác món Ơn của bạn.",
            fontSize = 14.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF666666),
            lineHeight = 17.sp
        )
    }
}

@Composable
private fun QrScannerView(isConnecting: Boolean) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(240.dp)
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(
                        Color(0xFF111111),
                        Color(0xFF333333)
                    )
                ),
                shape = RoundedCornerShape(24.dp)
            )
            .padding(14.dp)
    ) {
        // Inner scanner area
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    brush = Brush.radialGradient(
                        colors = listOf(
                            Color(0xFF3D3D3D),
                            Color(0xFF111111)
                        )
                    ),
                    shape = RoundedCornerShape(20.dp)
                )
                .border(
                    width = 1.dp,
                    color = Color(0x0FFFFFFF),
                    shape = RoundedCornerShape(20.dp)
                )
        ) {
            // Top status bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(13.dp)
                    .align(Alignment.TopCenter),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Camera status
                Row(
                    modifier = Modifier
                        .background(Color(0x85000000), RoundedCornerShape(999.dp))
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .background(Color(0xFF22C55E), CircleShape)
                    )
                    Text(
                        text = "Đang mở camera...",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFFF9FAFB)
                    )
                }

                // Controls
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(26.dp)
                            .background(Color(0x8C000000), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .size(14.dp)
                                .border(2.dp, Color(0xD9F9FAFB), RoundedCornerShape(4.dp))
                        )
                    }
                    Box(
                        modifier = Modifier
                            .size(26.dp)
                            .background(Color(0x8C000000), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .width(10.dp)
                                .height(2.dp)
                                .background(Color(0xFFF9FAFB), RoundedCornerShape(999.dp))
                        )
                    }
                }
            }

            // Scanning frame
            Box(
                modifier = Modifier
                    .size(207.dp)
                    .align(Alignment.Center)
                    .border(
                        width = 1.dp,
                        color = Color(0x42FFFFFF),
                        shape = RoundedCornerShape(24.dp)
                    )
                    .padding(1.dp),
                contentAlignment = Alignment.Center
            ) {
                // Corner borders
                // Top-left
                Box(
                    modifier = Modifier
                        .size(26.dp)
                        .align(Alignment.TopStart)
                        .offset((-1).dp, (-1).dp)
                        .border(
                            width = 3.dp,
                            color = Color.White,
                            shape = RoundedCornerShape(topStart = 10.dp)
                        )
                )
                // Top-right
                Box(
                    modifier = Modifier
                        .size(26.dp)
                        .align(Alignment.TopEnd)
                        .offset(1.dp, (-1).dp)
                        .border(
                            width = 3.dp,
                            color = Color.White,
                            shape = RoundedCornerShape(topEnd = 10.dp)
                        )
                )
                // Bottom-left
                Box(
                    modifier = Modifier
                        .size(26.dp)
                        .align(Alignment.BottomStart)
                        .offset((-1).dp, 1.dp)
                        .border(
                            width = 3.dp,
                            color = Color.White,
                            shape = RoundedCornerShape(bottomStart = 10.dp)
                        )
                )
                // Bottom-right
                Box(
                    modifier = Modifier
                        .size(26.dp)
                        .align(Alignment.BottomEnd)
                        .offset(1.dp, 1.dp)
                        .border(
                            width = 3.dp,
                            color = Color.White,
                            shape = RoundedCornerShape(bottomEnd = 10.dp)
                        )
                )

                // Center dot
                Box(
                    modifier = Modifier
                        .size(6.dp)
                        .background(Color(0xE6FFFFFF), CircleShape)
                )
            }

            // Bottom instruction
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(13.dp)
                    .align(Alignment.BottomCenter),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .background(Color(0x8C000000), RoundedCornerShape(999.dp))
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = "Đưa mã QR vào trong khung để quét",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFFE5E7EB)
                    )
                }
            }
        }
    }
}

@Composable
private fun QrScanInstructions() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Text(
            text = "Hãy quét QR trên bàn của bạn.",
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF222222)
        )
        Text(
            text = "Giữ máy ổn định và cách mã khoảng 10-15cm.",
            fontSize = 13.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF666666)
        )
        Text(
            text = "Nếu không quét được, bạn có thể nhập mã bàn thủ công bên dưới.",
            fontSize = 12.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF666666),
            lineHeight = 15.sp
        )
    }
}

@Composable
private fun ConnectionStatus(isConnecting: Boolean) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFFFE4D6), RoundedCornerShape(12.dp))
            .padding(horizontal = 10.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .background(Color(0xFFFF6F3C), CircleShape)
        )
        Column(
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Text(
                text = "Đang kết nối với bàn...",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFFFF6F3C)
            )
            Text(
                text = "Vui lòng giữ nguyên trong giây lát.",
                fontSize = 12.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666)
            )
        }
    }
}
