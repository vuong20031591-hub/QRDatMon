package com.qrdatmon.customer.ui.onboarding

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
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

@Composable
fun OnboardingScreen(
    onLoginClick: () -> Unit,
    onGoogleSignInClick: () -> Unit,
    onSkipClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
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

            // Feature Preview Card
            FeaturePreviewCard()

            Spacer(modifier = Modifier.weight(1f))

            // Bottom Actions
            BottomActions(
                onLoginClick = onLoginClick,
                onGoogleSignInClick = onGoogleSignInClick,
                onSkipClick = onSkipClick
            )
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
                        fontSize = 17.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF222222)
                    )
                    Text(
                        text = "Gọi món nhanh, thưởng thức trọn vẹn",
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
private fun FeaturePreviewCard() {
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
                            Color(0xFFFFE4D6),
                            Color(0xFFFFF4ED),
                            Color.White
                        ),
                        center = androidx.compose.ui.geometry.Offset(0.5f, 0f),
                        radius = 800f
                    )
                )
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Food Images Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.Bottom
            ) {
                // Large Food Card
                LargeFoodCard()

                // Small Cards Column
                Column(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    SmallFoodCard()
                    FeatureBadges()
                }
            }

            // Welcome Text Section
            WelcomeTextSection()
        }
    }
}


@Composable
private fun RowScope.LargeFoodCard() {
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
                Image(
                    painter = painterResource(id = android.R.drawable.ic_menu_gallery),
                    contentDescription = "Food",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }

            Box(
                modifier = Modifier
                    .wrapContentWidth()
                    .background(Color(0xFFFFE4D6), RoundedCornerShape(999.dp))
                    .padding(horizontal = 8.dp, vertical = 3.dp)
            ) {
                Text(
                    text = "Đặt lại gọi ngay",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFFFF6F3C)
                )
            }

            Text(
                text = "Mâm đặc sắc nóng hổi trên bàn",
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222),
                lineHeight = 16.sp
            )

            Text(
                text = "Nhìn là thèm, chọn món chỉ vài chạm.",
                fontSize = 11.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666),
                lineHeight = 13.sp
            )
        }
    }
}

@Composable
private fun SmallFoodCard() {
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
                    .background(Color(0xFFF5F5F5))
            ) {
                Image(
                    painter = painterResource(id = android.R.drawable.ic_menu_gallery),
                    contentDescription = "Food",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }

            Text(
                text = "Combo nướng...",
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF222222)
            )

            Text(
                text = "165.000đ / phần",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFFFF6F3C)
            )

            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Box(
                    modifier = Modifier
                        .background(Color(0xFFFFE4D6), RoundedCornerShape(999.dp))
                        .padding(horizontal = 6.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = "Bán chạy",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFFFF6F3C)
                    )
                }
                Box(
                    modifier = Modifier
                        .background(Color(0xFFFFF4ED), RoundedCornerShape(999.dp))
                        .padding(horizontal = 6.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = "Giảm 20%",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFFFF6F3C)
                    )
                }
            }
        }
    }
}

@Composable
private fun FeatureBadges() {
    Column(
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        FeatureBadge("• Quét QR là thấy menu liền")
        FeatureBadge("• Món nóng lên bàn cực nhanh")
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
                    .background(Color(0xFFFF6F3C))
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
private fun WelcomeTextSection() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = "Chào mừng đến với Nhà hàng Demo",
            fontSize = 20.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF222222),
            lineHeight = 24.sp
        )

        Text(
            text = "Quét QR trên bàn, chọn món yêu thích và gọi ngay khi chỉ đối ấp đơn.",
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
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                FeatureTag("Không cần gọi phục vụ")
                FeatureTag("Xem hình món siêu hấp dẫn")
            }
            FeatureTag("Thanh toán VietQR tiện lợi")
        }

        Spacer(modifier = Modifier.height(4.dp))

        PageIndicator()
    }
}

@Composable
private fun FeatureTag(text: String) {
    Box(
        modifier = Modifier
            .wrapContentWidth()
            .background(Color(0x17FF6F3C), RoundedCornerShape(999.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(
            text = text,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            color = Color(0xFFFF6F3C),
            lineHeight = 13.sp
        )
    }
}

@Composable
private fun PageIndicator() {
    Row(
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Box(
            modifier = Modifier
                .width(16.dp)
                .height(6.dp)
                .clip(RoundedCornerShape(999.dp))
                .background(Color(0xFFFF6F3C))
        )
        repeat(2) {
            Box(
                modifier = Modifier
                    .size(6.dp)
                    .clip(CircleShape)
                    .background(Color(0x40FF6F3C))
            )
        }
    }
}

@Composable
private fun BottomActions(
    onLoginClick: () -> Unit,
    onGoogleSignInClick: () -> Unit,
    onSkipClick: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Button(
            onClick = onLoginClick,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(24.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFFFF6F3C)
            )
        ) {
            Text(
                text = "Đăng nhập",
                fontSize = 15.sp,
                fontWeight = FontWeight.Medium,
                color = Color.White
            )
        }

        OutlinedButton(
            onClick = onGoogleSignInClick,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(24.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFF6F3C)),
            colors = ButtonDefaults.outlinedButtonColors(
                containerColor = Color.White
            )
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Image(
                    painter = painterResource(id = com.qrdatmon.customer.R.drawable.logo_google),
                    contentDescription = "Google",
                    modifier = Modifier.size(20.dp)
                )
                Text(
                    text = "Tiếp tục với Google",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFFFF6F3C)
                )
            }
        }

        Spacer(modifier = Modifier.height(4.dp))

        TextButton(onClick = onSkipClick) {
            Text(
                text = "Dùng ngay không cần đăng nhập",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFFFF6F3C)
            )
        }

        InfoTags()

        Spacer(modifier = Modifier.height(10.dp))

        Text(
            text = "Sẵn sàng gọi món? Bắt đầu trải nghiệm thực đơn số ngay tại bàn của bạn.",
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
                text = "Theo dõi món đang chuẩn bị",
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
                    text = "Gọi thêm món bất cứ lúc nào",
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
                    text = "Thanh toán nhanh, an toàn",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF666666)
                )
            }
        }
    }
}
