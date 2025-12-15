package com.qrdatmon.customer.ui.menu

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
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

data class MenuItem(
    val id: String,
    val name: String,
    val description: String,
    val price: Int,
    val originalPrice: Int? = null,
    val imageUrl: String,
    val category: String,
    val isPopular: Boolean = false,
    val isNew: Boolean = false,
    val discount: String? = null,
    val status: String = "Còn món" // "Còn món", "Sắp hết", "Hết món"
)

@Composable
fun MenuScreen(
    tableCode: String,
    onBackClick: () -> Unit,
    onCartClick: () -> Unit,
    onOrderClick: () -> Unit,
    onNavigateToOrderStatus: () -> Unit = {},
    onViewAllPromos: () -> Unit = {},
    onMenuItemClick: (String) -> Unit = {}
) {
    var selectedCategory by remember { mutableStateOf("Tất cả") }
    var cartItemCount by remember { mutableStateOf(3) }
    var totalAmount by remember { mutableStateOf(188000) }
    var selectedTab by remember { mutableStateOf("menu") }

    val categories = listOf("Tất cả", "Món chính", "Khai vị", "Lẩu & Báp xào")
    
    val menuItems = remember {
        listOf(
            MenuItem(
                id = "1",
                name = "Cơm tấm sườn bì chả đặc biệt",
                description = "Sườn nướng mềm, bì giòn, chả thơm, mỡ hành",
                price = 55000,
                imageUrl = "",
                category = "Món chính",
                isPopular = true,
                discount = "Giảm 10%",
                status = "Còn món"
            ),
            MenuItem(
                id = "2",
                name = "Phở bò tái nạm",
                description = "Nước dùng ngọt thanh, thịt bò tươi mềm",
                price = 45000,
                imageUrl = "",
                category = "Món chính",
                status = "Còn món"
            ),
            MenuItem(
                id = "3",
                name = "Chả giò hải sản chiên giòn",
                description = "Tôm, mực, cua tươi ngon, vỏ giòn rụm",
                price = 39000,
                imageUrl = "",
                category = "Khai vị",
                isNew = true,
                status = "Sắp hết"
            ),
            MenuItem(
                id = "4",
                name = "Gà nướng mật ong cơm nóng",
                description = "Gà tươi ướp mật ong, nướng vàng ươm",
                price = 72000,
                originalPrice = 85000,
                imageUrl = "",
                category = "Món chính",
                discount = "Giảm 15%",
                status = "Còn món"
            ),
            MenuItem(
                id = "5",
                name = "Trà đào cam sả",
                description = "Trà đào ngọt thanh, thơm cay vị sả, giải khát",
                price = 39000,
                originalPrice = 45000,
                imageUrl = "",
                category = "Đồ uống",
                discount = "Giảm 13%",
                status = "Còn món"
            ),
            MenuItem(
                id = "6",
                name = "Cà phê sữa đá",
                description = "Cà phê phin đậm đà, sữa béo ngọt, đá mát lạnh",
                price = 29000,
                imageUrl = "",
                category = "Đồ uống",
                status = "Còn món"
            )
        )
    }

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
            MenuHeader(
                tableCode = tableCode,
                cartItemCount = cartItemCount,
                onCartClick = onCartClick
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Content
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Restaurant Banner
                item {
                    RestaurantBanner()
                }

                // Promotions Section
                item {
                    PromotionsSection(onViewAllClick = onViewAllPromos)
                }

                // Category Filter
                item {
                    CategoryFilter(
                        categories = categories,
                        selectedCategory = selectedCategory,
                        onCategorySelected = { selectedCategory = it }
                    )
                }

                // Menu Items Grid
                item {
                    MenuItemsSection(
                        menuItems = menuItems,
                        onItemClick = { item -> onMenuItemClick(item.name) }
                    )
                }
            }

            // Bottom Order Bar
            BottomOrderBar(
                itemCount = cartItemCount,
                totalAmount = totalAmount,
                onOrderClick = onOrderClick
            )
        }

        // Bottom Navigation
        AppBottomNavigation(
            modifier = Modifier.align(Alignment.BottomCenter),
            selectedTab = selectedTab,
            onMenuClick = { selectedTab = "menu" },
            onCartClick = {
                selectedTab = "cart"
                onCartClick()
            },
            onOrderStatusClick = {
                selectedTab = "status"
                onNavigateToOrderStatus()
            }
        )
    }
}

@Composable
private fun MenuHeader(
    tableCode: String,
    cartItemCount: Int,
    onCartClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Text(
                text = "Nhà hàng Hương Vị Việt",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Box(
                modifier = Modifier
                    .background(Color(0xFFFFE4D6), RoundedCornerShape(999.dp))
                    .padding(horizontal = 8.dp, vertical = 2.dp)
            ) {
                Text(
                    text = "Bàn $tableCode • 2 người",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFFFF6F3C)
                )
            }
        }

        // Notification Icon
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
        }
    }
}

@Composable
private fun RestaurantBanner() {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(170.dp)
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(
                        Color(0x1FFF6F3C),
                        Color(0x05FF6F3C)
                    )
                ),
                shape = RoundedCornerShape(20.dp)
            )
            .padding(12.dp)
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Restaurant Image
            Box(
                modifier = Modifier
                    .size(58.dp)
                    .background(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                Color(0xFFFFE4D6),
                                Color(0x00FFE4D6)
                            )
                        ),
                        shape = RoundedCornerShape(20.dp)
                    )
                    .padding(2.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.White, RoundedCornerShape(18.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = android.R.drawable.ic_menu_gallery),
                        contentDescription = "Restaurant",
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }

            // Restaurant Info
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "Thưởng thức món ngon liền tại trong vài phút",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF222222),
                    lineHeight = 20.sp,
                    maxLines = 2
                )
                Text(
                    text = "Chỉ cần chọn món và gọi món, chúng tôi sẽ ngay lập tức gửi order.",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Normal,
                    color = Color(0xFF666666),
                    lineHeight = 18.sp,
                    maxLines = 2
                )

                Spacer(modifier = Modifier.height(4.dp))

                // Promo Tags
                Column(
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .background(Color(0xFFFFE4D6), RoundedCornerShape(999.dp))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = "🎉 Giảm 10% cho hóa đơn từ 200.000đ",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFFFF6F3C)
                        )
                    }
                    Box(
                        modifier = Modifier
                            .background(Color(0xCCFFFFFF), RoundedCornerShape(999.dp))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = "⚡ Phục vụ nhanh chóng trong 10-15 phút",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF222222),
                            lineHeight = 13.sp,
                            maxLines = 2
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun PromotionsSection(onViewAllClick: () -> Unit = {}) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 2.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Ưu đãi cho bàn của bạn",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF222222)
            )
            Text(
                text = "Xem tất cả",
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFFFF6F3C),
                modifier = Modifier.clickable { onViewAllClick() }
            )
        }

        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item {
                PromotionCard(
                    icon = "🎫",
                    title = "Giảm 10% cho hóa đơn từ 300.000đ",
                    description = "Áp dụng cho toàn bộ món ăn tại bàn bạn.",
                    actionText = "Tự động áp dụng khi thanh toán",
                    backgroundColor = Color(0xFFFFF5F0)
                )
            }
            item {
                PromotionCard(
                    icon = "🎁",
                    title = "Tặng 1 trà đào combo 3 món",
                    description = "Combo phù hợp nề trọn vị.",
                    actionText = "Áp dụng khung giờ 14h-17h",
                    backgroundColor = Color(0xFFF0FFF4)
                )
            }
        }
    }
}

@Composable
private fun PromotionCard(
    icon: String,
    title: String,
    description: String,
    actionText: String,
    backgroundColor: Color
) {
    Box(
        modifier = Modifier
            .width(280.dp)
            .background(backgroundColor, RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.Top
        ) {
            // Icon
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(Color.White, RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = icon,
                    fontSize = 24.sp
                )
            }

            // Content
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = title,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF222222),
                    lineHeight = 18.sp
                )
                Text(
                    text = description,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Normal,
                    color = Color(0xFF666666),
                    lineHeight = 16.sp
                )
                Box(
                    modifier = Modifier
                        .background(Color(0x1AFF6F3C), RoundedCornerShape(999.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = actionText,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFFFF6F3C)
                    )
                }
            }
        }
    }
}

@Composable
private fun CategoryFilter(
    categories: List<String>,
    selectedCategory: String,
    onCategorySelected: (String) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 2.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Danh mục món ăn",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF222222)
            )
            Text(
                text = "Xem tất cả",
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFFFF6F3C)
            )
        }

        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(categories) { category ->
                val isSelected = category == selectedCategory
                Box(
                    modifier = Modifier
                        .background(
                            color = if (isSelected) Color(0xFFFF6F3C) else Color(0xFFF5F5F5),
                            shape = RoundedCornerShape(999.dp)
                        )
                        .border(
                            width = 1.dp,
                            color = if (isSelected) Color(0xFFFF6F3C) else Color(0x40FF6F3C),
                            shape = RoundedCornerShape(999.dp)
                        )
                        .clickable { onCategorySelected(category) }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = category,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (isSelected) Color.White else Color(0xFFFF6F3C)
                    )
                }
            }
        }
    }
}

@Composable
private fun MenuItemsSection(
    menuItems: List<MenuItem>,
    onItemClick: (MenuItem) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 2.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Món ăn hôm nay",
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222)
            )
            Text(
                text = "Chọn vị món ăn có bữa ăn trọn vẹn",
                fontSize = 12.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666)
            )
        }

        // Grid of menu items
        Column(
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            menuItems.chunked(2).forEach { rowItems ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    rowItems.forEach { item ->
                        MenuItemCard(
                            item = item,
                            onClick = { onItemClick(item) },
                            modifier = Modifier.weight(1f)
                        )
                    }
                    if (rowItems.size == 1) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

@Composable
private fun MenuItemCard(
    item: MenuItem,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .background(Color.White, RoundedCornerShape(18.dp))
            .border(1.dp, Color(0x05000000), RoundedCornerShape(18.dp))
            .clickable { onClick() }
            .padding(8.dp)
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            // Image
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(140.dp)
                    .background(Color(0xFFF5F5F5), RoundedCornerShape(14.dp))
            ) {
                Image(
                    painter = painterResource(id = android.R.drawable.ic_menu_gallery),
                    contentDescription = item.name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )

                // Badges
                if (item.isNew) {
                    Box(
                        modifier = Modifier
                            .padding(8.dp)
                            .align(Alignment.TopStart)
                            .background(Color(0x1AEF4444), RoundedCornerShape(999.dp))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = "Món mới",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFFEF4444)
                        )
                    }
                }

                if (item.discount != null) {
                    Box(
                        modifier = Modifier
                            .padding(8.dp)
                            .align(Alignment.TopEnd)
                            .background(
                                brush = Brush.linearGradient(
                                    colors = listOf(
                                        Color(0xFFEAB308),
                                        Color(0xFFF59E0B)
                                    )
                                ),
                                shape = RoundedCornerShape(999.dp)
                            )
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = item.discount,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
            }

            // Info
            Column(
                verticalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                Text(
                    text = item.name,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF222222),
                    lineHeight = 18.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = item.description,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Normal,
                    color = Color(0xFF666666),
                    lineHeight = 16.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(2.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "${item.price / 1000}.000đ",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF222222)
                        )
                        if (item.originalPrice != null) {
                            Text(
                                text = "${item.originalPrice / 1000}.000đ",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Normal,
                                color = Color(0xFF666666),
                                style = androidx.compose.ui.text.TextStyle(
                                    textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough
                                )
                            )
                        }
                    }

                    Box(
                        modifier = Modifier
                            .background(
                                color = when (item.status) {
                                    "Còn món" -> Color(0x1A22C55E)
                                    "Sắp hết" -> Color(0x1FEAB308)
                                    else -> Color(0x1AEF4444)
                                },
                                shape = RoundedCornerShape(999.dp)
                            )
                            .padding(horizontal = 7.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = item.status,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = when (item.status) {
                                "Còn món" -> Color(0xFF16A34A)
                                "Sắp hết" -> Color(0xFFB45309)
                                else -> Color(0xFFEF4444)
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun BottomOrderBar(
    itemCount: Int,
    totalAmount: Int,
    onOrderClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 8.dp, bottom = 6.dp)
            .border(1.dp, Color(0x0A000000), RoundedCornerShape(0.dp))
            .padding(top = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Text(
                text = "$itemCount món",
                fontSize = 12.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666)
            )
            Text(
                text = "${totalAmount / 1000}.000đ",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222)
            )
        }

        Button(
            onClick = onOrderClick,
            modifier = Modifier
                .width(217.dp)
                .height(44.dp),
            shape = RoundedCornerShape(24.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFFFF6F3C)
            )
        ) {
            Text(
                text = "Gọi order ngay",
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.White
            )
        }
    }
}
