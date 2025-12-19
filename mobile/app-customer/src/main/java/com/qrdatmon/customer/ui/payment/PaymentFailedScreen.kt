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
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.qrdatmon.customer.ui.components.AppBottomNavigation
import com.qrdatmon.customer.ui.theme.Dimensions

@Composable
fun PaymentFailedScreen(
    tableCode: String,
    orderNumber: String,
    onBackClick: () -> Unit,
    onRetryPayment: () -> Unit,
    onTryVietQR: () -> Unit,
    onCallStaff: () -> Unit,
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
                        Color(0xF5FFF1F1)
                    )
                )
            )
            .background(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color(0x2EF87171),
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
            FailedHeader(
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
                // Failed Badge
                item {
                    Box(
                        modifier = Modifier.fillMaxWidth(),
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .background(Color(0x14EF4444), RoundedCornerShape(999.dp))
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .background(Color(0xFFEF4444), CircleShape)
                                )
                                Text(
                                    text = "Không nhận được xác nhận thanh toán",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color(0xFFEF4444)
                                )
                            }
                        }
                    }
                }

                // Failed Card
                item {
                    FailedCard(
                        tableCode = tableCode,
                        orderNumber = orderNumber
                    )
                }

                // Order Summary Card
                item {
                    FailedOrderSummaryCard()
                }

                // Help Section
                item {
                    FailedHelpSection()
                }

                // Warning Status
                item {
                    WarningStatusBox()
                }

                // Spacer for bottom section
                item {
                    Spacer(modifier = Modifier.height(260.dp))
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
            // Retry Button
            Button(
                onClick = onRetryPayment,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(24.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFFF6F3C)
                )
            ) {
                Text(
                    text = "Chọn cách thanh toán khác",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
            }

            // Try VietQR Button
            OutlinedButton(
                onClick = onTryVietQR,
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
                    text = "Thử quét lại VietQR",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF222222)
                )
            }

            // Call Staff Button
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(32.dp)
                    .clickable { onCallStaff() },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Gọi nhân viên hỗ trợ",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF666666),
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
            }

            // Info Text
            Text(
                text = "Nếu bạn đã bị trừ tiền nhưng vẫn báo thất bại, hãy giữ lại màn hình giao dịch và nhấn viên hỗ trợ nhận hàng.",
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
private fun FailedHeader(
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
                    text = "Thanh toán thất bại",
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
private fun FailedCard(
    tableCode: String,
    orderNumber: String
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(
                        Color(0xFFF97373),
                        Color(0xFFEF4444)
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
            // Failed Icon
            Box(
                modifier = Modifier
                    .size(96.dp)
                    .background(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                Color(0xFFFECACA),
                                Color(0xFFB91C1C)
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
                                    Color(0xFFFEE2E2)
                                )
                            ),
                            shape = CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(30.dp)
                            .background(Color(0xFFB91C1C), RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        // X icon
                        Box(
                            modifier = Modifier
                                .width(18.dp)
                                .height(2.dp)
                                .rotate(45f)
                                .background(Color(0xFFFEE2E2), RoundedCornerShape(999.dp))
                        )
                        Box(
                            modifier = Modifier
                                .width(18.dp)
                                .height(2.dp)
                                .rotate(-45f)
                                .background(Color(0xFFFEE2E2), RoundedCornerShape(999.dp))
                        )
                    }
                }
            }

            // Content
            Column(
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = "Ối, có lỗi khi thanh toán",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White,
                    lineHeight = 22.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = "Có thể do mạng chậm hoặc ngân hàng chưa phản hồi. Đừng lo, món ăn của bạn vẫn chưa bị hủy.",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xF5FFFFFF),
                    lineHeight = 16.sp,
                    maxLines = 4,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(4.dp))

                // Tags
                Column(
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    FailedTag("Bàn $tableCode • 3 món")
                    FailedTag("Cần thanh toán: 429.000đ")
                    FailedTag("Thử lại VietQR hoặc chọn cách khác")
                }
            }
        }
    }
}

@Composable
private fun FailedTag(text: String) {
    Box(
        modifier = Modifier
            .background(Color(0x24FFFFFF), RoundedCornerShape(999.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(
            text = text,
            fontSize = 11.sp,
            fontWeight = if (text.contains("Cần thanh toán")) FontWeight.SemiBold else FontWeight.Medium,
            color = Color.White,
            lineHeight = 13.sp,
            maxLines = 2
        )
    }
}

@Composable
private fun FailedOrderSummaryCard() {
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
                        text = "Tổng cần thanh toán",
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
                        .background(Color(0x14EF4444), RoundedCornerShape(999.dp))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "Chưa thanh toán",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFFEF4444),
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
            FailedOrderItem(
                name = "Cơm tấm sườn bì chả",
                quantity = "1 phần",
                note = "Đang chờ thanh toán",
                price = "145.000đ"
            )

            FailedOrderItem(
                name = "Cơm tấm sườn non nướng",
                quantity = "1 phần",
                note = "Đang chờ thanh toán",
                price = "139.000đ"
            )

            FailedOrderItem(
                name = "Trà tắc mật ong",
                quantity = "1 ly",
                note = "Đang chờ thanh toán",
                price = "45.000đ"
            )
        }
    }
}

@Composable
private fun FailedOrderItem(
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
private fun FailedHelpSection() {
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
                text = "Bạn muốn làm gì tiếp?",
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
                        imageVector = Icons.Outlined.Info,
                        contentDescription = null,
                        tint = Color(0xFFEF4444),
                        modifier = Modifier.size(16.dp)
                    )
                }

                Text(
                    text = "Nếu bạn đã quét VietQR nhưng vẫn thấy màn hình này, hãy kiểm tra lại kết nối mạng hoặc thử thanh toán lại sau vài phút.",
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
private fun WarningStatusBox() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0x0FF87171), RoundedCornerShape(14.dp))
            .padding(horizontal = 10.dp, vertical = 8.dp)
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(13.dp)
                    .background(Color(0x1AF87171), CircleShape)
                    .border(1.dp, Color(0x66F87171), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .background(Color(0xFFEF4444), CircleShape)
                )
            }

            Text(
                text = "Gợi ý: Bạn có thể chọn hình thức thanh toán khác hoặc báo nhân viên để được hỗ trợ kiểm tra giao dịch.",
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
