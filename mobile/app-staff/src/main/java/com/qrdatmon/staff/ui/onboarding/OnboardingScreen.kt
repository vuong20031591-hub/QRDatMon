package com.qrdatmon.staff.ui.onboarding

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.qrdatmon.staff.R

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun OnboardingScreen(
    onLoginClick: () -> Unit
) {
    val pagerState = rememberPagerState(pageCount = { 3 })
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color(0x2E4CAF50), // Green for staff
                        Color.Transparent
                    ),
                    center = androidx.compose.ui.geometry.Offset(0.5f, 0f),
                    radius = 1500f
                )
            )
            .background(Color.White)
            .padding(horizontal = 20.dp, vertical = 16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Header with Logo
            AppHeader()

            Spacer(modifier = Modifier.height(4.dp))

            // Feature Preview Card with Pager
            HorizontalPager(
                state = pagerState,
                modifier = Modifier.fillMaxWidth()
            ) { page ->
                FeaturePreviewCard(page = page, currentPage = pagerState.currentPage)
            }

            Spacer(modifier = Modifier.weight(1f))

            // Bottom Actions
            BottomActions(onLoginClick = onLoginClick)
        }
    }
}

@Composable
private fun AppHeader() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 4.dp),
        horizontalArrangement = Arrangement.Center
    ) {
        Card(
            modifier = Modifier.wrapContentWidth(),
            shape = RoundedCornerShape(999.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color.White.copy(alpha = 0.95f)
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
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
                            .background(Color(0xFF4CAF50)), // Green
                        contentAlignment = Alignment.Center
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.logo),
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
                        text = "Quản Lý Nhà Hàng",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF222222)
                    )
                    Text(
                        text = "Dành cho nhân viên phục vụ",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Normal,
                        color = Color(0xFF666666)
                    )
                }
            }
        }
    }
}

@Composable
private fun FeaturePreviewCard(page: Int, currentPage: Int) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .wrapContentHeight(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.radialGradient(
                        colors = listOf(
                            Color(0xFFE8F5E9), // Light green
                            Color(0xFFF1F8F4),
                            Color.White
                        ),
                        center = androidx.compose.ui.geometry.Offset(0.5f, 0f),
                        radius = 800f
                    )
                )
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Feature Cards Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.Bottom
            ) {
                // Large Feature Card
                LargeFeatureCard(page = page)

                // Small Cards Column
                Column(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    SmallFeatureCard(page = page)
                    FeatureBadges(page = page)
                }
            }

            // Welcome Text Section
            WelcomeTextSection(page = page, currentPage = currentPage)
        }
    }
}

@Composable
private fun RowScope.LargeFeatureCard(page: Int) {
    val content = when (page) {
        0 -> Triple("📋", "Quản lý đơn hàng", "Theo dõi đơn hàng real-time")
        1 -> Triple("🪑", "Quản lý bàn ăn", "Kiểm soát trạng thái bàn")
        else -> Triple("💳", "Xử lý thanh toán", "Thanh toán nhanh chóng")
    }
    
    val description = when (page) {
        0 -> "Xem trạng thái món ăn, xác nhận và phục vụ nhanh chóng."
        1 -> "Theo dõi bàn trống, đang dùng, gộp và tách bàn dễ dàng."
        else -> "Xử lý thanh toán tiền mặt, chuyển khoản và VietQR."
    }
    
    Card(
        modifier = Modifier
            .weight(1.7f)
            .height(226.dp),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(0.95f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(
            modifier = Modifier.padding(8.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color(0xFFF5F5F5)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = content.first,
                    fontSize = 48.sp
                )
            }

            Box(
                modifier = Modifier
                    .wrapContentWidth()
                    .background(Color(0xFFE8F5E9), RoundedCornerShape(999.dp))
                    .padding(horizontal = 8.dp, vertical = 3.dp)
            ) {
                Text(
                    text = content.second,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF4CAF50)
                )
            }

            Text(
                text = content.third,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222),
                lineHeight = 16.sp
            )

            Text(
                text = description,
                fontSize = 11.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666),
                lineHeight = 13.sp
            )
        }
    }
}

@Composable
private fun SmallFeatureCard(page: Int) {
    val content = when (page) {
        0 -> Triple("🔔", "Thông báo", "Real-time")
        1 -> Triple("📊", "Thống kê", "Doanh thu")
        else -> Triple("⚙️", "Cài đặt", "Tùy chỉnh")
    }
    
    val tags = when (page) {
        0 -> listOf("Đơn hàng mới", "Cập nhật món")
        1 -> listOf("Theo ngày", "Theo tháng")
        else -> listOf("Tài khoản", "Thông báo")
    }
    
    Card(
        modifier = Modifier
            .width(120.dp)
            .height(166.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(
            modifier = Modifier.padding(6.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(72.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFFF5F5F5)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = content.first,
                    fontSize = 32.sp
                )
            }

            Text(
                text = content.second,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF222222)
            )

            Text(
                text = content.third,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF4CAF50)
            )

            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                tags.forEach { tag ->
                    Box(
                        modifier = Modifier
                            .background(Color(0xFFE8F5E9), RoundedCornerShape(999.dp))
                            .padding(horizontal = 6.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = tag,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF4CAF50)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun FeatureBadges(page: Int) {
    val badges = when (page) {
        0 -> listOf("• Xác nhận đơn hàng nhanh", "• Thông báo real-time")
        1 -> listOf("• Gộp/Tách bàn", "• Trạng thái bàn")
        else -> listOf("• Tiền mặt/Chuyển khoản", "• VietQR")
    }
    
    Column(
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        badges.forEach { badge ->
            FeatureBadge(badge)
        }
    }
}

@Composable
private fun FeatureBadge(text: String) {
    Card(
        modifier = Modifier.wrapContentWidth(),
        shape = RoundedCornerShape(999.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White.copy(0.96f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 9.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .width(4.dp)
                    .height(6.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(Color(0xFF4CAF50))
            )
            Text(
                text = text,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF222222),
                lineHeight = 13.sp
            )
        }
    }
}

@Composable
private fun WelcomeTextSection(page: Int, currentPage: Int) {
    val titles = listOf(
        "Chào mừng đến với QRDatMon Staff",
        "Quản lý đơn hàng hiệu quả",
        "Xử lý thanh toán nhanh chóng"
    )
    
    val descriptions = listOf(
        "Ứng dụng quản lý đơn hàng, bàn ăn và thanh toán dành cho nhân viên nhà hàng.",
        "Theo dõi đơn hàng real-time, quản lý bàn ăn và phục vụ khách hàng chuyên nghiệp.",
        "Hỗ trợ thanh toán tiền mặt, chuyển khoản và VietQR. An toàn, nhanh chóng."
    )
    
    val tags = listOf(
        listOf("Quản lý đơn hàng", "Theo dõi bàn ăn", "Xử lý thanh toán nhanh chóng"),
        listOf("Thông báo real-time", "Xác nhận đơn nhanh", "Gộp/Tách bàn"),
        listOf("Tiền mặt", "Chuyển khoản", "VietQR")
    )
    
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = titles[page],
            fontSize = 20.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF222222),
            lineHeight = 24.sp
        )

        Text(
            text = descriptions[page],
            fontSize = 14.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF666666),
            lineHeight = 17.sp
        )

        Spacer(modifier = Modifier.height(4.dp))

        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            if (page == 0) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    FeatureTag(tags[page][0])
                    FeatureTag(tags[page][1])
                }
                FeatureTag(tags[page][2])
            } else {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    tags[page].forEach { tag ->
                        FeatureTag(tag)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(4.dp))

        PageIndicator(currentPage = currentPage)
    }
}

@Composable
private fun FeatureTag(text: String) {
    Box(
        modifier = Modifier
            .wrapContentWidth()
            .background(Color(0x174CAF50), RoundedCornerShape(999.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(
            text = text,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            color = Color(0xFF4CAF50),
            lineHeight = 13.sp
        )
    }
}

@Composable
private fun PageIndicator(currentPage: Int) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        repeat(3) { index ->
            Box(
                modifier = Modifier
                    .width(if (index == currentPage) 16.dp else 6.dp)
                    .height(6.dp)
                    .clip(RoundedCornerShape(999.dp))
                    .background(
                        if (index == currentPage) Color(0xFF4CAF50)
                        else Color(0x404CAF50)
                    )
            )
        }
    }
}

@Composable
private fun BottomActions(
    onLoginClick: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Login Button
        Button(
            onClick = onLoginClick,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(24.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF4CAF50)
            )
        ) {
            Text(
                text = "Đăng nhập",
                fontSize = 15.sp,
                fontWeight = FontWeight.Medium,
                color = Color.White
            )
        }

        Spacer(modifier = Modifier.height(4.dp))

        InfoTags()

        Spacer(modifier = Modifier.height(10.dp))

        Text(
            text = "Sẵn sàng phục vụ khách hàng? Đăng nhập để bắt đầu quản lý đơn hàng và bàn ăn.",
            fontSize = 12.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF666666),
            textAlign = TextAlign.Center,
            lineHeight = 15.sp
        )
    }
}

@Composable
private fun InfoTags() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(6.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .background(Color(0xFFF5F5F5), RoundedCornerShape(999.dp))
                .padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            Text(
                text = "Xem đơn hàng theo thời gian thực",
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF666666)
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp, Alignment.CenterHorizontally)
        ) {
            Box(
                modifier = Modifier
                    .background(Color(0xFFF5F5F5), RoundedCornerShape(999.dp))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "Quản lý bàn hiệu quả",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF666666)
                )
            }
            Box(
                modifier = Modifier
                    .background(Color(0xFFF5F5F5), RoundedCornerShape(999.dp))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "Thanh toán nhanh chóng",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF666666)
                )
            }
        }
    }
}
