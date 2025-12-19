package com.qrdatmon.customer.ui.payment

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.qrdatmon.customer.ui.components.AppBottomNavigation
import com.qrdatmon.customer.ui.theme.Dimensions

@Composable
fun PaymentScreen(
    tableCode: String,
    orderNumber: String,
    onBackClick: () -> Unit,
    onPaymentConfirm: () -> Unit,
    onPaymentViaQR: () -> Unit,
    onNavigateToMenu: () -> Unit,
    onNavigateToCart: () -> Unit,
    onNavigateToOrderStatus: () -> Unit
) {
    var selectedPaymentMethod by remember { mutableStateOf("status") }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color.White,
                        Color(0xCCFFEFE8)
                    )
                )
            )
            .background(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color(0x29FF6F3C),
                        Color.Transparent
                    ),
                    center = androidx.compose.ui.geometry.Offset(0.5f, 0f),
                    radius = 1500f
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(
                    start = Dimensions.screenHorizontalPadding,
                    end = Dimensions.screenHorizontalPadding,
                    top = Dimensions.statusBarPadding,
                    bottom = Dimensions.screenVerticalPadding
                )
        ) {
            // Header
            PaymentHeader(
                tableCode = tableCode,
                orderNumber = orderNumber,
                onBackClick = onBackClick
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Content
            LazyColumn(
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(bottom = Dimensions.contentBottomPaddingSimple),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Order Summary Card
                item {
                    OrderSummaryCard(
                        tableCode = tableCode,
                        orderNumber = orderNumber
                    )
                }

                // Current Order Info
                item {
                    CurrentOrderInfoCard()
                }

                // Payment Methods
                item {
                    PaymentMethodsCard(
                        selectedMethod = selectedPaymentMethod,
                        onMethodSelected = { selectedPaymentMethod = it }
                    )
                }

                // Spacer for bottom section
                item {
                    Spacer(modifier = Modifier.height(210.dp))
                }
            }
        }

        // Bottom Section
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .background(Color.White)
                .border(1.dp, Color(0x0A000000), RoundedCornerShape(topStart = 0.dp, topEnd = 0.dp))
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            // Confirm Payment Button
            Button(
                onClick = onPaymentConfirm,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(24.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFFF6F3C)
                )
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = "Gọi thanh toán",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White,
                        maxLines = 1
                    )
                }
            }

            // VietQR Button
            OutlinedButton(
                onClick = onPaymentViaQR,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp),
                shape = RoundedCornerShape(24.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFF6F3C)),
                colors = ButtonDefaults.outlinedButtonColors(
                    containerColor = Color.White
                )
            ) {
                Text(
                    text = "Thanh toán qua VietQR",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFFFF6F3C)
                )
            }

            // Info text
            Text(
                text = "Nếu bạn đang vội, hãy chọn thanh toán VietQR để hoàn tất nhanh chóng ngay trên điện thoại.",
                fontSize = 11.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666),
                lineHeight = 13.sp,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 2.dp),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )

            // Bottom Navigation Bar
            Spacer(modifier = Modifier.height(4.dp))
            AppBottomNavigation(
                selectedTab = selectedPaymentMethod,
                onMenuClick = onNavigateToMenu,
                onCartClick = onNavigateToCart,
                onOrderStatusClick = onNavigateToOrderStatus
            )
        }
    }
}

@Composable
private fun PaymentHeader(
    tableCode: String,
    orderNumber: String,
    onBackClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.weight(1f)
        ) {
            // Back Button
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .background(Color(0xFFF5F5F5), CircleShape)
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

            Column(
                verticalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                Text(
                    text = "Thanh toán",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF222222)
                )
                Text(
                    text = "Bàn $tableCode • Order $orderNumber",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF666666)
                )
            }
        }

        // Notification Icon with Badge
        Box(
            modifier = Modifier
                .size(32.dp)
                .background(Color(0xFFF5F5F5), CircleShape)
                .clickable { /* TODO */ },
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Outlined.Notifications,
                contentDescription = "Notifications",
                tint = Color(0xFF222222),
                modifier = Modifier.size(18.dp)
            )
            Box(
                modifier = Modifier
                    .size(14.dp)
                    .align(Alignment.TopEnd)
                    .offset(x = 2.dp, y = (-2).dp)
                    .background(Color(0xFFEF4444), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "3",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
            }
        }
    }
}

@Composable
private fun OrderSummaryCard(
    tableCode: String,
    orderNumber: String
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(
                        Color(0xFFFF9A62),
                        Color(0xFFFF6F3C)
                    )
                ),
                shape = RoundedCornerShape(20.dp)
            )
            .padding(12.dp)
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Icon
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .background(Color(0x2EFFFFFF), RoundedCornerShape(18.dp)),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .background(Color.White, RoundedCornerShape(14.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Receipt,
                        contentDescription = null,
                        tint = Color(0xFFFF6F3C),
                        modifier = Modifier.size(22.dp)
                    )
                }
            }

            // Content
            Column(
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "Chọn cách thanh toán thuận tiện cho bạn",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White,
                    lineHeight = 19.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = "Bạn có thể gọi nhân viên mang hóa đơn hoặc thanh toán ngay bằng VietQR trên điện thoại.",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xE6FFFFFF),
                    lineHeight = 15.sp,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(4.dp))

                // Tags
                Column(
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        PaymentTag("Bàn $tableCode")
                        PaymentTag("Order $orderNumber")
                    }
                    PaymentTag("Tổng tạm tính 429.000đ")
                }
            }
        }
    }
}

@Composable
private fun PaymentTag(text: String) {
    Box(
        modifier = Modifier
            .background(Color(0x29FFFFFF), RoundedCornerShape(999.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(
            text = text,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            color = Color.White,
            lineHeight = 13.sp
        )
    }
}

@Composable
private fun CurrentOrderInfoCard() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .padding(12.dp)
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(2.dp)
                ) {
                    Text(
                        text = "Bạn đang dùng",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF666666)
                    )
                    Text(
                        text = "Bàn A12",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF222222)
                    )
                    Text(
                        text = "Thanh toán sau khi dùng xong • 1 lượt order hiện tại",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF666666),
                        lineHeight = 15.sp,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                Box(
                    modifier = Modifier
                        .background(Color(0xFFFFE4D6), RoundedCornerShape(999.dp))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "Đang mua\nhóa đơn",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFFFF6F3C),
                        lineHeight = 13.sp,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            }

            Divider(
                modifier = Modifier.padding(vertical = 4.dp),
                color = Color(0x0A000000),
                thickness = 1.dp
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(2.dp)
                ) {
                    Text(
                        text = "Tổng tạm tính",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF666666)
                    )
                    Text(
                        text = "429.000đ",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFFFF6F3C)
                    )
                }

                Text(
                    text = "1 món • Phí dịch vụ tính khi thanh toán",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF666666),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Composable
private fun PaymentMethodsCard(
    selectedMethod: String,
    onMethodSelected: (String) -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .padding(horizontal = 12.dp, vertical = 8.dp)
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Cách thanh toán",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF222222)
                )
                Text(
                    text = "Chọn 1 trong 2 hình thức",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF666666)
                )
            }

            Spacer(modifier = Modifier.height(2.dp))

            // Payment Method 1: Staff
            PaymentMethodOption(
                icon = Icons.Outlined.Person,
                title = "Gọi nhân viên mang hóa đơn",
                description = "Nhân viên sẽ đến bàn, mang hóa đơn giấy hoặc máy POS cho bạn.",
                badge = "Dễ xuất",
                isSelected = selectedMethod == "staff",
                onClick = { onMethodSelected("staff") }
            )

            // Payment Method 2: VietQR
            PaymentMethodOption(
                icon = Icons.Outlined.QrCode,
                title = "Thanh toán ngay bằng VietQR",
                description = "Quét mã VietQR, thanh toán qua ứng dụng ngân hàng của bạn.",
                badge = null,
                isSelected = selectedMethod == "vietqr",
                onClick = { onMethodSelected("vietqr") }
            )

            // Warning box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0x0FFF6F3C), RoundedCornerShape(14.dp))
                    .padding(horizontal = 9.dp, vertical = 8.dp)
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Info,
                        contentDescription = null,
                        tint = Color(0xFFFF6F3C),
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = "Lưu ý: Bạn có thể tiếp tục gọi thêm món sau khi thanh toán một phần hoặc toàn bộ hóa đơn. Nhân viên sẽ hỗ trợ tách hóa đơn nếu cần.",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF222222),
                        lineHeight = 13.sp,
                        maxLines = 3,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }
    }
}

@Composable
private fun PaymentMethodOption(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    description: String,
    badge: String?,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFF5F5F5), RoundedCornerShape(14.dp))
            .clickable { onClick() }
            .padding(horizontal = 9.dp, vertical = 8.dp)
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icon
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .background(Color.White, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = Color(0xFFFF6F3C),
                    modifier = Modifier.size(18.dp)
                )
            }

            // Content
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                Text(
                    text = title,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF222222),
                    lineHeight = 16.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = description,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF666666),
                    lineHeight = 13.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }

            // Badge or Radio
            if (badge != null) {
                Box(
                    modifier = Modifier
                        .background(Color.White, RoundedCornerShape(999.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = badge,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFFFF6F3C)
                    )
                }
            } else {
                RadioButton(
                    selected = isSelected,
                    onClick = onClick,
                    colors = RadioButtonDefaults.colors(
                        selectedColor = Color(0xFFFF6F3C),
                        unselectedColor = Color(0xFF666666)
                    )
                )
            }
        }
    }
}


