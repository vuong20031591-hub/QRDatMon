package com.qrdatmon.customer.ui.promo

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.Notifications
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

@Composable
fun PromoDetailScreen(
    onBackClick: () -> Unit,
    onApplyPromo: () -> Unit,
    onViewMenu: () -> Unit
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
                .padding(horizontal = 16.dp, vertical = 10.dp)
        ) {
            // Header
            PromoDetailHeader(onBackClick = onBackClick)

            Spacer(modifier = Modifier.height(10.dp))

            // Content
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Featured Promo Card
                item {
                    FeaturedPromoCard()
                }

                // Chi tiết ưu đãi
                item {
                    PromoDetailsCard()
                }

                // Cách sử dụng
                item {
                    HowToUseCard()
                }

                // Gợi ý gọi món nhanh
                item {
                    SuggestedOrderCard()
                }

                // Spacer for bottom buttons
                item {
                    Spacer(modifier = Modifier.height(160.dp))
                }
            }
        }

        // Bottom Action Buttons
        BottomActionButtons(
            modifier = Modifier.align(Alignment.BottomCenter),
            onApplyPromo = onApplyPromo,
            onViewMenu = onViewMenu
        )
    }
}

@Composable
private fun PromoDetailHeader(onBackClick: () -> Unit) {
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
                    text = "Ưu đãi cho bàn bạn",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF222222)
                )
                Text(
                    text = "Giảm 10% hóa đơn từ 300.000đ",
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
private fun FeaturedPromoCard() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(153.dp)
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(
                        Color(0xFFFFE4D6),
                        Color.White
                    )
                ),
                shape = RoundedCornerShape(20.dp)
            )
            .padding(14.dp)
    ) {
        // Icon
        Box(
            modifier = Modifier
                .width(25.dp)
                .height(44.dp)
                .background(Color.White, RoundedCornerShape(18.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "🎫",
                fontSize = 22.sp
            )
        }

        // Content
        Column(
            modifier = Modifier
                .padding(start = 49.dp, end = 111.dp, top = 0.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = "Giảm 10% cho hóa đơn từ 300.000đ",
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222),
                lineHeight = 20.sp
            )
            Text(
                text = "Áp dụng cho toàn bộ món ăn tại bàn A12 của bạn. Càng gọi nhiều, càng tiết kiệm.",
                fontSize = 13.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666),
                lineHeight = 18.sp
            )
            Box(
                modifier = Modifier
                    .background(Color(0x14FF6F3C), RoundedCornerShape(999.dp))
                    .padding(horizontal = 8.dp, vertical = 3.dp)
            ) {
                Text(
                    text = "Tự động áp dụng khi thanh toán",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFFFF6F3C)
                )
            }
        }

        // Right badges
        Column(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(top = 0.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
            horizontalAlignment = Alignment.End
        ) {
            Box(
                modifier = Modifier
                    .background(
                        brush = Brush.linearGradient(
                            colors = listOf(
                                Color(0xE622C55E),
                                Color(0xBF22C55E)
                            )
                        ),
                        shape = RoundedCornerShape(999.dp)
                    )
                    .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "Hót hôm nay",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
            }
            Box(
                modifier = Modifier
                    .background(Color(0x0FFF6F3C), RoundedCornerShape(999.dp))
                    .padding(horizontal = 8.dp, vertical = 3.dp)
            ) {
                Text(
                    text = "Còn 2 giờ",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFFFF6F3C)
                )
            }
            Box(
                modifier = Modifier
                    .background(Color(0x99FFFFFF), RoundedCornerShape(999.dp))
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
                Text(
                    text = "Chỉ áp dụng tại bàn bạn",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF666666),
                    lineHeight = 12.sp
                )
            }
        }
    }
}

@Composable
private fun PromoDetailsCard() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.dp, Color(0x05000000), RoundedCornerShape(16.dp))
            .padding(13.dp)
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Title
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Chi tiết ưu đãi",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF222222)
                )
                Box(
                    modifier = Modifier
                        .background(Color(0xFFFFE4D6), RoundedCornerShape(999.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = "Tự động kích hoạt",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFFFF6F3C)
                    )
                }
            }

            Text(
                text = "Giảm 10% trên tổng giá trị hóa đơn khi:",
                fontSize = 13.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666),
                lineHeight = 20.sp
            )

            // Bullet points
            Column(
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                BulletPoint("Giá trị hóa đơn từ 300.000đ trở lên.")
                BulletPoint("Áp dụng cho toàn bộ món ăn và đồ uống trong cùng bill.")
                BulletPoint("Áp dụng cho bàn của bạn trong 2 giờ kể từ lúc bắt đầu gọi món.")
            }

            // Note box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0x0D22C55E), RoundedCornerShape(12.dp))
                    .padding(horizontal = 8.dp, vertical = 6.dp)
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = "💡",
                        fontSize = 12.sp
                    )
                    Text(
                        text = "Không cộng dồn với các mã giảm giá khác. Phí dịch vụ và phụ thu (nếu có) không nằm trong ưu đãi.",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Normal,
                        color = Color(0xFF666666),
                        lineHeight = 15.sp
                    )
                }
            }
        }
    }
}

@Composable
private fun HowToUseCard() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.dp, Color(0x05000000), RoundedCornerShape(16.dp))
            .padding(13.dp)
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "Cách sử dụng",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222)
            )

            Text(
                text = "Ưu đãi này sẽ được hệ thống tự động áp dụng cho bạn.",
                fontSize = 13.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666),
                lineHeight = 20.sp
            )

            Column(
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                BulletPoint("Chọn món và thêm vào giỏ nhưng bình thường.")
                BulletPoint("Gửi order để nhà hàng bắt đầu chuẩn bị món.")
                BulletPoint("Khi thanh toán, hệ thống tự trừ 10% nếu hóa đơn đạt từ 300.000đ.")
            }

            // Tags
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                PromoTag("Áp dụng 1 lần/bill", isHighlight = true)
                PromoTag("Phù hợp nhóm 2-4 người")
            }
            PromoTag("Ước tính giảm khi đạt 300.000đ → Tiết kiệm 30.000đ")

            // Bottom info
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Ưu đãi có hiệu lực đến:",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF666666)
                )
                Text(
                    text = "23:59, 01/01/2025",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF222222)
                )
            }
        }
    }
}

@Composable
private fun SuggestedOrderCard() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.dp, Color(0x05000000), RoundedCornerShape(16.dp))
            .padding(13.dp)
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "Gợi ý gọi món nhanh",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222)
            )

            Text(
                text = "Gợi ý một số combo phù hợp để bạn dễ đạt mức 300.000đ:",
                fontSize = 13.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666),
                lineHeight = 20.sp
            )

            Column(
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                BulletPointBold("Combo 2 người: 2 món chính + 1 món khai vị + 2 nước.")
                BulletPointBold("Combo gia đình nhỏ: 3 món chính chia sẻ + 1 món canh + 3-4 nước.")
            }

            Text(
                text = "Bạn vẫn có thể chọn món tự do, không bắt buộc theo combo.",
                fontSize = 12.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666),
                lineHeight = 15.sp
            )
        }
    }
}

@Composable
private fun BottomActionButtons(
    modifier: Modifier = Modifier,
    onApplyPromo: () -> Unit,
    onViewMenu: () -> Unit
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(Color.White)
            .border(1.dp, Color(0x0A000000), RoundedCornerShape(topStart = 0.dp, topEnd = 0.dp))
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        // Apply button
        Button(
            onClick = onApplyPromo,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(24.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFFFF6F3C)
            )
        ) {
            Text(
                text = "Bắt đầu gọi món ngay",
                fontSize = 15.sp,
                fontWeight = FontWeight.Medium,
                color = Color.White
            )
        }

        // View menu button
        OutlinedButton(
            onClick = onViewMenu,
            modifier = Modifier
                .fillMaxWidth()
                .height(44.dp),
            shape = RoundedCornerShape(24.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x66FF6F3C)),
            colors = ButtonDefaults.outlinedButtonColors(
                containerColor = Color.White
            )
        ) {
            Text(
                text = "Xem menu hôm nay",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFFFF6F3C)
            )
        }

        // Info text
        Text(
            text = "Ưu đãi sẽ tự áp dụng khi bạn thanh toán, không cần nhập mã.",
            fontSize = 12.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF666666),
            lineHeight = 15.sp,
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 2.dp),
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
    }
}

@Composable
private fun BulletPoint(text: String) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Box(
            modifier = Modifier
                .padding(top = 7.dp)
                .size(4.dp)
                .background(Color(0xFFFF6F3C), CircleShape)
        )
        Text(
            text = text,
            fontSize = 13.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF666666),
            lineHeight = 16.sp,
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
private fun BulletPointBold(text: String) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Box(
            modifier = Modifier
                .padding(top = 7.dp)
                .size(4.dp)
                .background(Color(0xFFFF6F3C), CircleShape)
        )
        Text(
            text = text,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF666666),
            lineHeight = 16.sp,
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
private fun PromoTag(text: String, isHighlight: Boolean = false) {
    Box(
        modifier = Modifier
            .background(
                color = if (isHighlight) Color(0x17FF6F3C) else Color(0xFFF5F5F5),
                shape = RoundedCornerShape(999.dp)
            )
            .padding(horizontal = 8.dp, vertical = 3.dp)
    ) {
        Text(
            text = text,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            color = if (isHighlight) Color(0xFFFF6F3C) else Color(0xFF666666),
            lineHeight = 13.sp,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}
