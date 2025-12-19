package com.qrdatmon.customer.ui.menu

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.qrdatmon.customer.ui.components.AppBottomNavigation
import com.qrdatmon.customer.ui.theme.Dimensions

data class AddOnItem(
    val name: String,
    val description: String,
    val price: Int,
    val isFree: Boolean = false
)

@Composable
fun MenuItemDetailScreen(
    itemName: String,
    tableCode: String,
    onBackClick: () -> Unit,
    onAddToCart: (Int) -> Unit,
    onNavigateToMenu: () -> Unit,
    onNavigateToCart: () -> Unit,
    onNavigateToOrderStatus: () -> Unit
) {
    var quantity by remember { mutableStateOf(1) }
    var selectedTab by remember { mutableStateOf("menu") }
    var note by remember { mutableStateOf("") }

    val addOns = remember {
        listOf(
            AddOnItem("Thêm trứng ốp la", "Trứng gà tươi chiên vàng giòn", 10000),
            AddOnItem("Thêm rau sống", "Rau xà lách, húng quế, ngò gai", 0, isFree = true),
            AddOnItem("Thêm nước mắm ớt", "Nước mắm chua ngọt cay", 5000)
        )
    }
    var selectedAddOns by remember { mutableStateOf(setOf<String>()) }
    var selectedPortion by remember { mutableStateOf("Phần thường") }

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
                        Color(0x24F87171),
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
                    top = Dimensions.statusBarPadding,
                    bottom = Dimensions.contentBottomPaddingSimple
                )
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onBackClick,
                    modifier = Modifier
                        .size(40.dp)
                        .background(Color.White, CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = Color(0xFF222222)
                    )
                }

                Text(
                    text = "Chi tiết món ăn",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF222222)
                )

                IconButton(
                    onClick = { /* TODO: Share */ },
                    modifier = Modifier
                        .size(40.dp)
                        .background(Color.White, CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Share,
                        contentDescription = "Share",
                        tint = Color(0xFF222222)
                    )
                }
            }

            // Content
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 180.dp)
            ) {
                // Dish Image
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(240.dp)
                            .background(Color(0xFFF5F5F5), RoundedCornerShape(20.dp))
                    ) {
                        // Placeholder image
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Restaurant,
                                contentDescription = null,
                                modifier = Modifier.size(80.dp),
                                tint = Color(0xFFCCCCCC)
                            )
                        }

                        // Badges
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Box(
                                modifier = Modifier
                                    .background(Color(0x1A22C55E), RoundedCornerShape(999.dp))
                                    .padding(horizontal = 10.dp, vertical = 5.dp)
                            ) {
                                Text(
                                    text = "Còn món",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF16A34A)
                                )
                            }

                            Box(
                                modifier = Modifier
                                    .background(
                                        brush = Brush.linearGradient(
                                            colors = listOf(
                                                Color(0xFFEAB308),
                                                Color(0xFFF59E0B)
                                            )
                                        ),
                                        shape = RoundedCornerShape(999.dp)
                                    )
                                    .padding(horizontal = 10.dp, vertical = 5.dp)
                            ) {
                                Text(
                                    text = "Bán chạy",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                        }

                        // Serving time badge
                        Box(
                            modifier = Modifier
                                .align(Alignment.BottomEnd)
                                .padding(12.dp)
                                .background(Color(0xCCFFFFFF), RoundedCornerShape(999.dp))
                                .padding(horizontal = 10.dp, vertical = 5.dp)
                        ) {
                            Text(
                                text = "⏱️ 10-15 phút",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF222222)
                            )
                        }
                    }
                }

                // Dish Info
                item {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top
                        ) {
                            Text(
                                text = itemName,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF222222),
                                modifier = Modifier.weight(1f),
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis
                            )

                            IconButton(
                                onClick = { /* TODO: Favorite */ },
                                modifier = Modifier.size(32.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.FavoriteBorder,
                                    contentDescription = "Favorite",
                                    tint = Color(0xFFFF6F3C)
                                )
                            }
                        }

                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "55.000đ",
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFFF6F3C)
                            )
                            Text(
                                text = "65.000đ",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Normal,
                                color = Color(0xFF999999),
                                style = androidx.compose.ui.text.TextStyle(
                                    textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough
                                )
                            )
                        }

                        // Tags
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .background(Color(0xFFF5F5F5), RoundedCornerShape(999.dp))
                                    .padding(horizontal = 10.dp, vertical = 5.dp)
                            ) {
                                Text(
                                    text = "⚡ Phục vụ nhanh",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF666666)
                                )
                            }
                            Box(
                                modifier = Modifier
                                    .background(Color(0xFFF5F5F5), RoundedCornerShape(999.dp))
                                    .padding(horizontal = 10.dp, vertical = 5.dp)
                            ) {
                                Text(
                                    text = "🍽️ 1 người",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF666666)
                                )
                            }
                            Box(
                                modifier = Modifier
                                    .background(Color(0xFFF5F5F5), RoundedCornerShape(999.dp))
                                    .padding(horizontal = 10.dp, vertical = 5.dp)
                            ) {
                                Text(
                                    text = "🌶️ Không cay",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF666666)
                                )
                            }
                        }

                        Text(
                            text = "Cơm tấm sườn nướng thơm ngon, bì giòn rụm, chả trứng mềm mịn. Kèm theo mỡ hành thơm phức và nước mắm chua ngọt đặc trưng miền Nam.",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Normal,
                            color = Color(0xFF666666),
                            lineHeight = 20.sp
                        )
                    }
                }

                // Portion Selection
                item {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "Chọn khẩu phần",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF222222)
                        )

                        Row(
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            listOf("Phần thường", "Phần lớn (+15.000đ)").forEach { portion ->
                                val isSelected = selectedPortion == portion
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .background(
                                            color = if (isSelected) Color(0x1AFF6F3C) else Color.White,
                                            shape = RoundedCornerShape(12.dp)
                                        )
                                        .border(
                                            width = 1.5.dp,
                                            color = if (isSelected) Color(0xFFFF6F3C) else Color(0xFFE5E5E5),
                                            shape = RoundedCornerShape(12.dp)
                                        )
                                        .clickable { selectedPortion = portion }
                                        .padding(12.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = portion,
                                        fontSize = 13.sp,
                                        fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Medium,
                                        color = if (isSelected) Color(0xFFFF6F3C) else Color(0xFF666666)
                                    )
                                }
                            }
                        }
                    }
                }

                // Add-ons Section
                item {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "Thêm món phụ (tùy chọn)",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF222222)
                        )

                        addOns.forEach { addOn ->
                            val isSelected = selectedAddOns.contains(addOn.name)
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(Color.White, RoundedCornerShape(12.dp))
                                    .border(
                                        width = 1.dp,
                                        color = if (isSelected) Color(0xFFFF6F3C) else Color(0xFFE5E5E5),
                                        shape = RoundedCornerShape(12.dp)
                                    )
                                    .clickable {
                                        selectedAddOns = if (isSelected) {
                                            selectedAddOns - addOn.name
                                        } else {
                                            selectedAddOns + addOn.name
                                        }
                                    }
                                    .padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(
                                    modifier = Modifier.weight(1f),
                                    verticalArrangement = Arrangement.spacedBy(2.dp)
                                ) {
                                    Text(
                                        text = addOn.name,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Color(0xFF222222)
                                    )
                                    Text(
                                        text = addOn.description,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Normal,
                                        color = Color(0xFF999999),
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }

                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = if (addOn.isFree) "Miễn phí" else "+${addOn.price / 1000}.000đ",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = if (addOn.isFree) Color(0xFF22C55E) else Color(0xFF222222)
                                    )

                                    Checkbox(
                                        checked = isSelected,
                                        onCheckedChange = null,
                                        colors = CheckboxDefaults.colors(
                                            checkedColor = Color(0xFFFF6F3C),
                                            uncheckedColor = Color(0xFFCCCCCC)
                                        )
                                    )
                                }
                            }
                        }
                    }
                }

                // Note Input
                item {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "Ghi chú cho món ăn",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF222222)
                        )

                        OutlinedTextField(
                            value = note,
                            onValueChange = { note = it },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(100.dp),
                            placeholder = {
                                Text(
                                    text = "Ví dụ: Không hành, ít cay...",
                                    fontSize = 13.sp,
                                    color = Color(0xFF999999)
                                )
                            },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFFFF6F3C),
                                unfocusedBorderColor = Color(0xFFE5E5E5),
                                focusedContainerColor = Color.White,
                                unfocusedContainerColor = Color.White
                            ),
                            shape = RoundedCornerShape(12.dp)
                        )
                    }
                }

                // Suggested Items
                item {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "Gợi ý thêm món",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF222222)
                        )

                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            items(3) { index ->
                                SuggestedItemCard()
                            }
                        }
                    }
                }
            }
        }

        // Bottom Section
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .background(Color.White)
                .padding(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 80.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Số lượng",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF666666)
                )

                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { if (quantity > 1) quantity-- },
                        modifier = Modifier
                            .size(36.dp)
                            .background(Color(0xFFF5F5F5), CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Remove,
                            contentDescription = "Decrease",
                            tint = Color(0xFF222222)
                        )
                    }

                    Text(
                        text = quantity.toString(),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF222222)
                    )

                    IconButton(
                        onClick = { quantity++ },
                        modifier = Modifier
                            .size(36.dp)
                            .background(Color(0xFFFF6F3C), CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Add,
                            contentDescription = "Increase",
                            tint = Color.White
                        )
                    }
                }
            }

            Button(
                onClick = { onAddToCart(quantity) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(25.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFFF6F3C)
                )
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Thêm vào giỏ",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White
                    )
                    Text(
                        text = "•",
                        fontSize = 15.sp,
                        color = Color.White
                    )
                    Text(
                        text = "${55 * quantity}.000đ",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }

        // Bottom Navigation
        AppBottomNavigation(
            modifier = Modifier.align(Alignment.BottomCenter),
            selectedTab = selectedTab,
            onMenuClick = {
                selectedTab = "menu"
                onNavigateToMenu()
            },
            onCartClick = {
                selectedTab = "cart"
                onNavigateToCart()
            },
            onOrderStatusClick = {
                selectedTab = "status"
                onNavigateToOrderStatus()
            }
        )
    }
}

@Composable
private fun SuggestedItemCard() {
    Box(
        modifier = Modifier
            .width(140.dp)
            .background(Color.White, RoundedCornerShape(12.dp))
            .border(1.dp, Color(0xFFE5E5E5), RoundedCornerShape(12.dp))
            .clickable { /* TODO */ }
            .padding(8.dp)
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(90.dp)
                    .background(Color(0xFFF5F5F5), RoundedCornerShape(10.dp))
            ) {
                Icon(
                    imageVector = Icons.Outlined.Restaurant,
                    contentDescription = null,
                    modifier = Modifier
                        .size(40.dp)
                        .align(Alignment.Center),
                    tint = Color(0xFFCCCCCC)
                )
            }

            Text(
                text = "Trà đào cam sả",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF222222),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Text(
                text = "39.000đ",
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFFFF6F3C)
            )
        }
    }
}
