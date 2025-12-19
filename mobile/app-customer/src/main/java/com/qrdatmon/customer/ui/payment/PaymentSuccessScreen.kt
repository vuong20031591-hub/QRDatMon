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
fun PaymentSuccessScreen(
    tableCode: String,
    orderNumber: String,
    onBackClick: () -> Unit,
    onRateExperience: () -> Unit,
    onViewOrderHistory: () -> Unit,
    onNavigateToMenu: () -> Unit,
    onNavigateToCart: () -> Unit,
    onNavigateToOrderStatus: () -> Unit
) {
    var selectedTab by remember { mutableStateOf("status") }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color.White,
                        Color(0xE6E8FFF3)
                    )
                )
            )
            .background(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color(0x2922C55E),
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
            SuccessHeader(
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
                // Success Badge
                item {
                    Box(
                        modifier = Modifier.fillMaxWidth(),
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .background(Color(0x1F22C55E), RoundedCornerShape(999.dp))
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .background(Color(0xFF22C55E), CircleShape)
                                )
                                Text(
                                    text = "Đã nhận thanh toán VietQR",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color(0xFF22C55E)
                                )
                            }
                        }
                    }
                }

                // Success Card
                item {
                    SuccessCard(
                        tableCode = tableCode,
                        orderNumber = orderNumber
                    )
                }

                // Order Summary Card
                item {
                    OrderSummaryCard()
                }

                // Help Section
                item {
                    HelpSection()
                }

                // Success Status
                item {
                    SuccessStatusBox()
                }

                // Spacer for bottom section
                item {
                    Spacer(modifier = Modifier.height(220.dp))
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
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Rate Button
            Button(
                onClick = onRateExperience,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(24.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFFF6F3C)
                )
            ) {
                Text(
                    text = "Đánh giá trải nghiệm",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
            }

            // View History Button
            OutlinedButton(
                onClick = onViewOrderHistory,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp),
                shape = RoundedCornerShape(24.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFF5F5F5)),
                colors = ButtonDefaults.outlinedButtonColors(
                    containerColor = Color(0xFFF5F5F5)
                )
            ) {
                Text(
                    text = "Xem lịch sử hóa đơn",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF222222),
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
            }

            // Info Text
            Text(
                text = "Hoặc bạn có thể tiếp tục gọi lại trở chuyện, quản sẽ không làm phiền thêm.",
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF666666),
                lineHeight = 13.sp,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 2.dp),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            // Bottom Navigation
            Spacer(modifier = Modifier.height(4.dp))
            AppBottomNavigation(
                selectedTab = selectedTab,
                onMenuClick = onNavigateToMenu,
                onCartClick = onNavigateToCart,
                onOrderStatusClick = onNavigateToOrderStatus
            )
        }
    }
}

@Composable
private fun SuccessHeader(
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
                    text = "Thanh toán thành công",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF222222),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = "Bàn $tableCode • Order #$orderNumber",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF666666),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }

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
private fun SuccessCard(
    tableCode: String,
    orderNumber: String
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(
                        Color(0xFF4ADE80),
                        Color(0xFF22C55E)
                    )
                ),
                shape = RoundedCornerShape(22.dp)
            )
            .padding(16.dp)
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Success Icon
            Box(
                modifier = Modifier
                    .size(96.dp)
                    .background(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                Color(0xFFBBF7D0),
                                Color(0xFF16A34A)
                            )
                        ),
                        shape = RoundedCornerShape(24.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .background(
                            brush = Brush.radialGradient(
                                colors = listOf(
                                    Color.White,
                                    Color(0xFFF5F5F5)
                                )
                            ),
                            shape = CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(30.dp)
                            .background(Color(0xFF16A34A), RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Check,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }

            // Content
            Column(
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = "Cảm ơn bạn đã thanh toán!",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White,
                    lineHeight = 22.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = "Hóa đơn tại Cơm Tấm Ngon 24H đã được xác nhận. Chúc bạn có trải nghiệm ngon miệng trọn vẹn.",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xF2FFFFFF),
                    lineHeight = 16.sp,
                    maxLines = 4,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(4.dp))

                // Tags
                Column(
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    SuccessTag("Bàn $tableCode • 3 món")
                    SuccessTag("Tổng: 429.000đ")
                    SuccessTag("Thanh toán VietQR")
                }
            }
        }
    }
}

@Composable
private fun SuccessTag(text: String) {
    Box(
        modifier = Modifier
            .background(Color(0x24FFFFFF), RoundedCornerShape(999.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(
            text = text,
            fontSize = 11.sp,
            fontWeight = if (text.contains("Tổng:")) FontWeight.SemiBold else FontWeight.Medium,
            color = Color.White,
            lineHeight = 13.sp,
            maxLines = 1
        )
    }
}

@Composable
private fun OrderSummaryCard() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(18.dp))
            .padding(14.dp)
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
                        text = "Tổng hóa đơn",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF666666),
                        maxLines = 1
                    )
                    Text(
                        text = "429.000đ",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF222222)
                    )
                }

                Box(
                    modifier = Modifier
                        .background(Color(0x1422C55E), RoundedCornerShape(999.dp))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "Đã thanh toán",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF22C55E),
                        maxLines = 1
                    )
                }
            }

            Text(
                text = "Cơm Tấm Ngon 24H • Bàn A12 • Order #1248",
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            HorizontalDivider(
                modifier = Modifier.padding(vertical = 4.dp),
                color = Color(0x80CBD5E1),
                thickness = 1.dp
            )

            // Order Items
            OrderItem(
                name = "Cơm tấm sườn bì chả",
                quantity = "1 phần",
                note = "Đã phục vụ",
                price = "145.000đ"
            )

            OrderItem(
                name = "Cơm tấm sườn non nướng",
                quantity = "1 phần",
                note = "Đã phục vụ",
                price = "139.000đ"
            )

            OrderItem(
                name = "Trà tắc mật ong",
                quantity = "1 ly",
                note = "Đã phục vụ",
                price = "45.000đ"
            )
        }
    }
}

@Composable
private fun OrderItem(
    name: String,
    quantity: String,
    note: String,
    price: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Top
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(2.dp),
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = name,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF222222),
                lineHeight = 16.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = "$quantity • $note",
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF666666),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }

        Text(
            text = price,
            fontSize = 13.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF222222),
            lineHeight = 16.sp
        )
    }
}

@Composable
private fun HelpSection() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFF5F5F5), RoundedCornerShape(16.dp))
            .padding(10.dp)
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Text(
                text = "Giúp quản phục vụ tnt hơn",
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222)
            )

            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.Top
            ) {
                Box(
                    modifier = Modifier
                        .size(20.dp)
                        .background(Color.White, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Star,
                        contentDescription = null,
                        tint = Color(0xFFF59E0B),
                        modifier = Modifier.size(16.dp)
                    )
                }

                Text(
                    text = "Chỉ mất 30 giây để chia sẻ cảm nhận của bạn về món ăn, phục vụ và không gian. Đánh giá của bạn giúp quán cải thiện từng ngày.",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF666666),
                    lineHeight = 15.sp,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Composable
private fun SuccessStatusBox() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0x0F22C55E), RoundedCornerShape(14.dp))
            .padding(horizontal = 10.dp, vertical = 8.dp)
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(13.dp)
                    .background(Color(0x1422C55E), CircleShape)
                    .border(1.dp, Color(0x4722C55E), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .background(Color(0xFF22C55E), CircleShape)
                )
            }

            Text(
                text = "Mẹo nhỏ: Bạn có thể xem lại chi tiết tất cả hóa đơn tại mục \"Lịch sử hóa đơn\" nếu đồng nhập tài khoản.",
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222),
                lineHeight = 13.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}
