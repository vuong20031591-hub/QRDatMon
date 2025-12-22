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
import coil.compose.AsyncImage
import com.qrdatmon.core.common.util.ImageUrlBuilder
import com.qrdatmon.customer.ui.components.AppBottomNavigation
import com.qrdatmon.customer.ui.theme.Dimensions

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
    onMenuItemClick: (String) -> Unit = {},
    viewModel: MenuViewModel = androidx.lifecycle.viewmodel.compose.viewModel()
) {
    var cartItemCount by remember { mutableStateOf(3) }
    var totalAmount by remember { mutableStateOf(188000) }
    var selectedTab by remember { mutableStateOf("menu") }

    val uiState by viewModel.uiState.collectAsState()
    
    // Get selected table from TableManager
    val selectedTable by com.qrdatmon.customer.data.TableManager.selectedTable.collectAsState()
    val tableDisplayName = selectedTable?.displayName ?: "Bàn $tableCode"
    
    // Convert backend MenuItemResponse to UI MenuItem
    val menuItems = remember(uiState.menuItems) {
        uiState.menuItems.map { item ->
            MenuItem(
                id = item.id,
                name = item.name,
                description = item.description ?: "",
                price = item.price.toInt(),
                originalPrice = null,
                imageUrl = ImageUrlBuilder.buildFullUrl(item.imageUrl) ?: "",
                category = "", // Category name not in response
                isPopular = item.isPopular,
                isNew = item.isNew,
                discount = null,
                status = when (item.status) {
                    "available" -> "Còn món"
                    "low_stock" -> "Sắp hết"
                    "out_of_stock" -> "Hết món"
                    else -> "Còn món"
                }
            )
        }
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
                .padding(
                    start = Dimensions.screenHorizontalPadding,
                    end = Dimensions.screenHorizontalPadding,
                    top = Dimensions.statusBarPadding,
                    bottom = Dimensions.screenVerticalPadding
                )
        ) {
            // Header
            MenuHeader(
                tableDisplayName = tableDisplayName,
                cartItemCount = cartItemCount,
                onCartClick = onCartClick
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Content
            LazyColumn(
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(bottom = Dimensions.contentBottomPaddingSimple),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Restaurant Banner - Removed as requested
                // item {
                //     RestaurantBanner()
                // }

                // Promotions Section
                if (uiState.promotions.isNotEmpty()) {
                    item {
                        PromotionsSection(
                            promotions = uiState.promotions,
                            onViewAllClick = onViewAllPromos
                        )
                    }
                }

                // Category Filter
                item {
                    CategoryFilter(
                        categories = uiState.categories,
                        selectedCategoryId = uiState.selectedCategoryId,
                        onCategorySelected = { categoryId ->
                            viewModel.selectCategory(categoryId)
                        }
                    )
                }

                // Loading or Error State
                if (uiState.isLoading) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(200.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(color = Color(0xFFFF6F3C))
                        }
                    }
                } else if (uiState.errorMessage.isNotEmpty()) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(
                                    text = "Lỗi tải dữ liệu",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFFEF4444)
                                )
                                Text(
                                    text = uiState.errorMessage,
                                    fontSize = 14.sp,
                                    color = Color(0xFF666666)
                                )
                                Button(
                                    onClick = { viewModel.retry() },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Color(0xFFFF6F3C)
                                    )
                                ) {
                                    Text("Thử lại")
                                }
                            }
                        }
                    }
                } else {
                    // Menu Items Grid
                    item {
                        MenuItemsSection(
                            menuItems = menuItems,
                            onItemClick = { item -> onMenuItemClick(item.id) }
                        )
                    }
                }
            }
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
    tableDisplayName: String,
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
                    text = "$tableDisplayName • 2 người",
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
private fun PromotionsSection(
    promotions: List<com.qrdatmon.core.network.dto.promotion.PromotionResponse>,
    onViewAllClick: () -> Unit = {}
) {
    if (promotions.isEmpty()) return
    
    var showAllPromotions by remember { mutableStateOf(false) }
    val selectedPromotion by com.qrdatmon.customer.data.PromotionManager.selectedPromotion.collectAsState()
    
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
            
            // Only show "Xem tất cả" if there are 2 or more promotions
            if (promotions.size >= 2) {
                Text(
                    text = "Xem tất cả",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFFFF6F3C),
                    modifier = Modifier.clickable { showAllPromotions = true }
                )
            }
        }

        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(promotions.size) { index ->
                val promotion = promotions[index]
                val isSelected = selectedPromotion?.id == promotion.id
                
                val discountText = if (promotion.discountType == "percent") {
                    "Giảm ${promotion.discountValue.toInt()}%"
                } else {
                    "Giảm ${(promotion.discountValue / 1000).toInt()}.000đ"
                }
                
                val minOrderText = if (promotion.minOrderAmount > 0) {
                    " cho hóa đơn từ ${(promotion.minOrderAmount / 1000).toInt()}.000đ"
                } else {
                    ""
                }
                
                PromotionCard(
                    icon = "🎫",
                    title = "$discountText$minOrderText",
                    description = promotion.description ?: promotion.name,
                    isSelected = isSelected,
                    onApplyClick = {
                        if (isSelected) {
                            com.qrdatmon.customer.data.PromotionManager.clearPromotion()
                        } else {
                            com.qrdatmon.customer.data.PromotionManager.selectPromotion(promotion)
                        }
                    }
                )
            }
        }
    }
    
    // Show all promotions dialog
    if (showAllPromotions) {
        AllPromotionsDialog(
            promotions = promotions,
            selectedPromotion = selectedPromotion,
            onDismiss = { showAllPromotions = false },
            onPromotionSelected = { promotion ->
                com.qrdatmon.customer.data.PromotionManager.selectPromotion(promotion)
                showAllPromotions = false
            }
        )
    }
}

@Composable
private fun PromotionCard(
    icon: String,
    title: String,
    description: String,
    isSelected: Boolean,
    onApplyClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .width(280.dp)
            .background(
                if (isSelected) Color(0xFFFFE4D6) else Color(0xFFFFF5F0),
                RoundedCornerShape(16.dp)
            )
            .border(
                width = if (isSelected) 2.dp else 0.dp,
                color = if (isSelected) Color(0xFFFF6F3C) else Color.Transparent,
                shape = RoundedCornerShape(16.dp)
            )
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
                    lineHeight = 16.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                
                // Apply button
                Box(
                    modifier = Modifier
                        .background(
                            if (isSelected) Color(0xFFFF6F3C) else Color(0x1AFF6F3C),
                            RoundedCornerShape(999.dp)
                        )
                        .clickable { onApplyClick() }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = if (isSelected) "✓ Đã áp dụng" else "Áp dụng",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = if (isSelected) Color.White else Color(0xFFFF6F3C)
                    )
                }
            }
        }
    }
}

@Composable
private fun CategoryFilter(
    categories: List<com.qrdatmon.core.network.dto.menu.CategoryResponse>,
    selectedCategoryId: String?,
    onCategorySelected: (String?) -> Unit
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
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // "Tất cả" option
            item {
                CategoryChip(
                    name = "Tất cả",
                    imageUrl = null,
                    isSelected = selectedCategoryId == null,
                    onClick = { onCategorySelected(null) }
                )
            }
            
            // Category items with images
            items(categories) { category ->
                CategoryChip(
                    name = category.name,
                    imageUrl = ImageUrlBuilder.buildFullUrl(category.imageUrl),
                    isSelected = category.id == selectedCategoryId,
                    onClick = { onCategorySelected(category.id) }
                )
            }
        }
    }
}

@Composable
private fun CategoryChip(
    name: String,
    imageUrl: String?,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .width(72.dp)
            .clickable { onClick() },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        // Category Image
        Box(
            modifier = Modifier
                .size(56.dp)
                .background(
                    color = if (isSelected) Color(0xFFFFE4D6) else Color(0xFFF5F5F5),
                    shape = RoundedCornerShape(16.dp)
                )
                .border(
                    width = if (isSelected) 2.dp else 0.dp,
                    color = if (isSelected) Color(0xFFFF6F3C) else Color.Transparent,
                    shape = RoundedCornerShape(16.dp)
                )
                .clip(RoundedCornerShape(16.dp)),
            contentAlignment = Alignment.Center
        ) {
            if (imageUrl != null) {
                AsyncImage(
                    model = imageUrl,
                    contentDescription = name,
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(8.dp)),
                    contentScale = ContentScale.Crop,
                    error = painterResource(id = android.R.drawable.ic_menu_gallery),
                    placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
                )
            } else {
                // Icon for "Tất cả"
                Icon(
                    imageVector = Icons.Outlined.Restaurant,
                    contentDescription = name,
                    modifier = Modifier.size(28.dp),
                    tint = if (isSelected) Color(0xFFFF6F3C) else Color(0xFF666666)
                )
            }
        }
        
        // Category Name
        Text(
            text = name,
            fontSize = 11.sp,
            fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Medium,
            color = if (isSelected) Color(0xFFFF6F3C) else Color(0xFF666666),
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
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
        // Header - removed "Xem tất cả"
        Text(
            text = "Món ăn hôm nay",
            fontSize = 15.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF222222),
            modifier = Modifier.padding(horizontal = 2.dp)
        )

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
                    .clip(RoundedCornerShape(14.dp))
            ) {
                AsyncImage(
                    model = item.imageUrl,
                    contentDescription = item.name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop,
                    error = painterResource(id = android.R.drawable.ic_menu_gallery),
                    placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
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

@Composable
private fun AllPromotionsDialog(
    promotions: List<com.qrdatmon.core.network.dto.promotion.PromotionResponse>,
    selectedPromotion: com.qrdatmon.core.network.dto.promotion.PromotionResponse?,
    onDismiss: () -> Unit,
    onPromotionSelected: (com.qrdatmon.core.network.dto.promotion.PromotionResponse) -> Unit
) {
    androidx.compose.ui.window.Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .wrapContentHeight(),
            shape = RoundedCornerShape(20.dp),
            color = Color.White
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Tất cả ưu đãi",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF222222)
                    )
                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Close,
                            contentDescription = "Close",
                            tint = Color(0xFF666666)
                        )
                    }
                }

                // Promotions list
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 400.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(promotions.size) { index ->
                        val promotion = promotions[index]
                        val isSelected = selectedPromotion?.id == promotion.id
                        
                        val discountText = if (promotion.discountType == "percent") {
                            "Giảm ${promotion.discountValue.toInt()}%"
                        } else {
                            "Giảm ${(promotion.discountValue / 1000).toInt()}.000đ"
                        }
                        
                        val minOrderText = if (promotion.minOrderAmount > 0) {
                            " cho hóa đơn từ ${(promotion.minOrderAmount / 1000).toInt()}.000đ"
                        } else {
                            ""
                        }
                        
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    if (isSelected) Color(0xFFFFE4D6) else Color(0xFFF5F5F5),
                                    RoundedCornerShape(12.dp)
                                )
                                .border(
                                    width = if (isSelected) 2.dp else 0.dp,
                                    color = if (isSelected) Color(0xFFFF6F3C) else Color.Transparent,
                                    shape = RoundedCornerShape(12.dp)
                                )
                                .clickable { onPromotionSelected(promotion) }
                                .padding(12.dp)
                        ) {
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // Icon
                                Box(
                                    modifier = Modifier
                                        .size(40.dp)
                                        .background(Color.White, RoundedCornerShape(10.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "🎫",
                                        fontSize = 20.sp
                                    )
                                }

                                // Content
                                Column(
                                    modifier = Modifier.weight(1f),
                                    verticalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Text(
                                        text = "$discountText$minOrderText",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = Color(0xFF222222)
                                    )
                                    Text(
                                        text = promotion.description ?: promotion.name,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Normal,
                                        color = Color(0xFF666666),
                                        maxLines = 2,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }

                                // Checkmark
                                if (isSelected) {
                                    Icon(
                                        imageVector = Icons.Outlined.CheckCircle,
                                        contentDescription = "Selected",
                                        tint = Color(0xFFFF6F3C),
                                        modifier = Modifier.size(24.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
