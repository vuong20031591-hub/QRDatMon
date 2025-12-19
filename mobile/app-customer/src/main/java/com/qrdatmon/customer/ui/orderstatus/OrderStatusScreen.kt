package com.qrdatmon.customer.ui.orderstatus

import androidx.compose.foundation.Image
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.qrdatmon.customer.ui.components.AppBottomNavigation
import com.qrdatmon.customer.ui.theme.Dimensions

data class OrderStatusItem(
    val title: String,
    val description: String,
    val isCompleted: Boolean,
    val isActive: Boolean
)

data class SuggestedItem(
    val name: String,
    val description: String,
    val price: Int,
    val status: String,
    val imageUrl: String
)

@Composable
fun OrderStatusScreen(
    tableCode: String,
    onBackClick: () -> Unit,
    onNavigateToMenu: () -> Unit,
    onNavigateToCart: () -> Unit,
    onNavigateToPayment: () -> Unit = {},
    onCallStaff: () -> Unit = {}
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color.White,
                        Color(0xB3FFEFE8)
                    )
                )
            )
            .background(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color(0x2EFF6F3C),
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
            OrderStatusHeader(
                tableCode = tableCode,
                onBackClick = onBackClick
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Content
            LazyColumn(
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(bottom = Dimensions.contentBottomPaddingSimple),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Order Card
                item {
                    ActiveOrderCard(tableCode = tableCode)
                }

                // Stats Cards
                item {
                    StatsCardsRow()
                }

                // Order Info
                item {
                    OrderInfoSection()
                }

                // Timeline
                item {
                    OrderTimeline()
                }

                // Suggested Items
                item {
                    SuggestedItemsSection()
                }

                // Bottom Buttons
                item {
                    BottomButtonsSection(
                        onNavigateToPayment = onNavigateToPayment,
                        onCallStaff = onCallStaff
                    )
                }

                // Help Banner
                item {
                    HelpBanner()
                }

                // Spacer for bottom navigation
                item {
                    Spacer(modifier = Modifier.height(74.dp))
                }
            }
        }

        // Bottom Navigation
        AppBottomNavigation(
            modifier = Modifier.align(Alignment.BottomCenter),
            selectedTab = "status",
            onMenuClick = onNavigateToMenu,
            onCartClick = onNavigateToCart,
            onOrderStatusClick = { /* Already on status */ }
        )
    }
}

@Composable
private fun OrderStatusHeader(
    tableCode: String,
    onBackClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(2.dp),
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = "Trạng thái order",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222)
            )
            Text(
                text = "Bàn $tableCode • Order đang chuẩn bị",
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF666666)
            )
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
                modifier = Modifier.size(20.dp)
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
private fun ActiveOrderCard(tableCode: String) {
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
                        imageVector = Icons.Outlined.Restaurant,
                        contentDescription = null,
                        tint = Color(0xFFFF6F3C),
                        modifier = Modifier.size(24.dp)
                    )
                }
            }

            // Content
            Column(
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "Món của bạn đang được chuẩn bị",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White,
                    lineHeight = 19.sp,
                    maxLines = 2
                )
                Text(
                    text = "Bếp đang nấu nóng hổi, món sẽ được mang ra bàn trong 1 chút nữa",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xE6FFFFFF),
                    lineHeight = 15.sp,
                    maxLines = 2
                )

                Spacer(modifier = Modifier.height(2.dp))

                // Tags
                Column(
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        TagChip("Order #248")
                        TagChip("Bàn $tableCode")
                    }
                    TagChip("Hãy thưởng thức đồ uống trước")
                }

                Spacer(modifier = Modifier.height(4.dp))

                // Action Button
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(36.dp)
                        .background(Color.White, RoundedCornerShape(999.dp))
                        .clickable { /* TODO */ }
                        .padding(horizontal = 10.dp, vertical = 4.dp),
                    contentAlignment = Alignment.CenterStart
                ) {
                    Text(
                        text = "Nhấn để xem chi tiết order và thêm món",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFFFF6F3C),
                        lineHeight = 13.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }
    }
}

@Composable
private fun TagChip(text: String) {
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
private fun StatsCardsRow() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        StatsCard(
            label = "Thời gian đặt",
            value = "12:34, 01/01/2025",
            subtitle = "Gửi order thành công",
            modifier = Modifier.weight(1f)
        )
        StatsCard(
            label = "Bàn của bạn",
            value = "A12",
            subtitle = "Thành viên sau bữa ăn",
            modifier = Modifier.weight(1f)
        )
    }
    Spacer(modifier = Modifier.height(8.dp))
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        StatsCard(
            label = "Tổng tạm tính",
            value = "429.000đ",
            subtitle = "Đã bao gồm 1 món ăn",
            isHighlight = true,
            modifier = Modifier.weight(1f)
        )
        StatsCard(
            label = "Dự tính phục vụ",
            value = "10-15 phút",
            subtitle = "Khi món xong sẽ báo ngay",
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
private fun StatsCard(
    label: String,
    value: String,
    subtitle: String,
    isHighlight: Boolean = false,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .height(69.dp)
            .background(Color.White, RoundedCornerShape(14.dp))
            .padding(8.dp)
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = label,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF666666),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
                Box(
                    modifier = Modifier
                        .size(6.dp)
                        .background(Color(0xFFFF6F3C), CircleShape)
                )
            }
            Text(
                text = value,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = if (isHighlight) Color(0xFFFF6F3C) else Color(0xFF222222),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = subtitle,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF666666),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
private fun OrderInfoSection() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "Món thấy rất thêm món sẽ tạo thêm order mới",
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            color = Color(0xFF666666),
            lineHeight = 15.sp,
            modifier = Modifier
                .weight(1f)
                .padding(end = 8.dp)
        )
        Box(
            modifier = Modifier
                .background(Color(0xFFFFE4D6), RoundedCornerShape(999.dp))
                .padding(horizontal = 10.dp, vertical = 4.dp)
        ) {
            Text(
                text = "Có thể lấy ưu đãi mới",
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFFFF6F3C),
                maxLines = 1
            )
        }
    }
}

@Composable
private fun OrderTimeline() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .padding(10.dp)
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Text(
                text = "Tiến trình order",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222)
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 4.dp)
            ) {
                // Vertical line
                Box(
                    modifier = Modifier
                        .width(2.dp)
                        .height(156.dp)
                        .offset(x = 11.dp)
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(
                                    Color(0xB3FF6F3C),
                                    Color(0x1AFF6F3C)
                                )
                            )
                        )
                )

                Column(
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    TimelineItem(
                        title = "Đã gửi / Chuẩn bị món",
                        description = "Quán đã nhận được order của bạn",
                        isCompleted = true,
                        isActive = false
                    )
                    TimelineItem(
                        title = "Đang chuẩn bị",
                        description = "Bếp đang nấu món • Dự tính 10-15 phút",
                        isCompleted = false,
                        isActive = true
                    )
                    TimelineItem(
                        title = "Đã xong",
                        description = "Hoàn thành & chuẩn bị mang ra",
                        isCompleted = false,
                        isActive = false
                    )
                    TimelineItem(
                        title = "Đang phục vụ",
                        description = "Nhân viên mang món đến bàn bạn",
                        isCompleted = false,
                        isActive = false
                    )
                }
            }
        }
    }
}

@Composable
private fun TimelineItem(
    title: String,
    description: String,
    isCompleted: Boolean,
    isActive: Boolean
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Box(
            modifier = Modifier
                .size(22.dp)
                .padding(top = 4.dp),
            contentAlignment = Alignment.TopCenter
        ) {
            Box(
                modifier = Modifier
                    .size(14.dp)
                    .background(
                        color = if (isCompleted || isActive) Color(0xFFFF6F3C) else Color.White,
                        shape = CircleShape
                    )
                    .border(
                        width = 2.dp,
                        color = if (isCompleted || isActive) Color(0xFFFF6F3C) else Color(0xFFE0E0E0),
                        shape = CircleShape
                    )
            )
        }

        Column(
            verticalArrangement = Arrangement.spacedBy(1.dp)
        ) {
            Text(
                text = title,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = if (isActive) Color(0xFFFF6F3C) else Color(0xFF222222)
            )
            Text(
                text = description,
                fontSize = 11.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666)
            )
        }
    }
}

@Composable
private fun SuggestedItemsSection() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .padding(10.dp)
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Món trong order",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF222222)
                )
                Box(
                    modifier = Modifier
                        .background(Color(0xFFF5F5F5), RoundedCornerShape(999.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = "1 món • 429.000đ",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF666666)
                    )
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                SuggestedItemCard(
                    name = "Lẩu Thái hải sản",
                    description = "Size Vừa • + Thêm tôm • Cay vừa",
                    price = 429000,
                    status = "Đang nấu",
                    modifier = Modifier.weight(1f)
                )
                SuggestedItemCard(
                    name = "Cơm thêm món?",
                    description = "Gợi ý: gỏi, nước uống, tráng miệng",
                    price = 0,
                    status = "Sắp hết",
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
private fun SuggestedItemCard(
    name: String,
    description: String,
    price: Int,
    status: String,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .height(200.dp)
            .background(Color(0xFFF5F5F5), RoundedCornerShape(14.dp))
    ) {
        Column {
            // Image
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(109.dp)
                    .background(Color(0xFFE0E0E0))
            ) {
                Image(
                    painter = painterResource(id = android.R.drawable.ic_menu_gallery),
                    contentDescription = name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )

                // Status badge
                Box(
                    modifier = Modifier
                        .padding(6.dp)
                        .background(
                            color = if (status == "Đang nấu") Color(0xE622C55E) else Color(0xF2FACC15),
                            shape = RoundedCornerShape(999.dp)
                        )
                        .padding(horizontal = 7.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = status,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.White
                    )
                }
            }

            // Info
            Column(
                modifier = Modifier.padding(6.dp),
                verticalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                Text(
                    text = name,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF222222)
                )
                Text(
                    text = description,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF666666),
                    lineHeight = 13.sp,
                    maxLines = 2
                )
                Spacer(modifier = Modifier.height(2.dp))
                if (price > 0) {
                    Text(
                        text = "${price / 1000}.000đ",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFFFF6F3C)
                    )
                }
            }
        }
    }
}

@Composable
private fun BottomButtonsSection(
    onNavigateToPayment: () -> Unit = {},
    onCallStaff: () -> Unit = {}
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 8.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        // Call Staff Button
        OutlinedButton(
            onClick = onCallStaff,
            modifier = Modifier
                .fillMaxWidth()
                .height(44.dp),
            shape = RoundedCornerShape(24.dp),
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = Color(0xFFFF6F3C)
            ),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFF6F3C))
        ) {
            Text(
                text = "Gọi nhân viên hỗ trợ",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                maxLines = 1
            )
        }

        // Payment Button
        Button(
            onClick = onNavigateToPayment,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
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
                    text = "Xem lại & thanh toán",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White,
                    maxLines = 1
                )
                Text(
                    text = "Thanh toán sau khi dùng xong",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xE6FFFFFF),
                    maxLines = 1
                )
            }
        }

        // Info Text
        Text(
            text = "Khi trong thời gian chờ món, bạn có thể \"Duyệt xem ưu đãi\", bạn sẽ nhận được những ưu đãi từ quán và có thể yêu cầu thêm thanh toán sau.",
            fontSize = 11.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF666666),
            lineHeight = 14.sp,
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
private fun HelpBanner() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF16A34A), RoundedCornerShape(999.dp))
            .padding(horizontal = 12.dp, vertical = 8.dp)
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(6.dp)
                    .background(Color(0xFFBBF7D0), CircleShape)
            )
            Text(
                text = "Bạn cần hỗ trợ? Hãy thử nhấn vào chuyển bên cho bạn và chúng tôi sẽ giúp bạn!",
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = Color.White,
                lineHeight = 13.sp
            )
        }
    }
}
