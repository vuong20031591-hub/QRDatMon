package com.qrdatmon.customer.ui.cart

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
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.qrdatmon.core.common.util.ImageUrlBuilder
import com.qrdatmon.customer.ui.components.AppBottomNavigation
import com.qrdatmon.customer.ui.theme.Dimensions

data class CartItem(
    val id: String,
    val name: String,
    val description: String,
    val price: Int,
    val toppingPrice: Int,
    val quantity: Int,
    val imageUrl: String,
    val note: String? = null
)

@Composable
fun CartScreen(
    tableCode: String,
    onBackClick: () -> Unit,
    onCheckoutClick: () -> Unit,
    onNavigateToMenu: () -> Unit,
    onNavigateToOrderStatus: () -> Unit
) {
    val cartItems by com.qrdatmon.customer.data.CartManager.cartItems.collectAsState()

    val subtotal = cartItems.sumOf { (it.price + it.toppingPrice) * it.quantity }
    val shippingFee = 0
    val total = subtotal + shippingFee
    val discount = (total * 0.1).toInt()
    val finalTotal = total - discount

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
            CartHeader(
                tableCode = tableCode,
                itemCount = cartItems.sumOf { it.quantity },
                onBackClick = onBackClick
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Content
            LazyColumn(
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(bottom = Dimensions.contentBottomPaddingSimple),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Discount Banner
                item {
                    DiscountBanner()
                }

                // Cart Items Section
                item {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = "Món bạn đã chọn",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF222222)
                        )

                        if (cartItems.isEmpty()) {
                            // Empty state
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 40.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Text(
                                        text = "🛒",
                                        fontSize = 48.sp
                                    )
                                    Text(
                                        text = "Giỏ hàng trống",
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Color(0xFF666666)
                                    )
                                    Text(
                                        text = "Hãy thêm món ăn vào giỏ hàng",
                                        fontSize = 14.sp,
                                        color = Color(0xFF999999)
                                    )
                                }
                            }
                        } else {
                            cartItems.forEach { item ->
                                CartItemCard(
                                    item = item,
                                    onQuantityChange = { newQuantity ->
                                        com.qrdatmon.customer.data.CartManager.updateQuantity(item.id, newQuantity)
                                    },
                                    onRemove = {
                                        com.qrdatmon.customer.data.CartManager.removeItem(item.id)
                                    }
                                )
                            }
                        }
                    }
                }

                // Order Summary
                item {
                    OrderSummary(
                        subtotal = subtotal,
                        shippingFee = shippingFee,
                        discount = discount,
                        total = finalTotal
                    )
                }
            }

            // Bottom Section
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Divider(color = Color(0x0A000000), thickness = 1.dp)

                Spacer(modifier = Modifier.height(2.dp))

                // Checkout Button
                Button(
                    onClick = onCheckoutClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(24.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFFF6F3C)
                    )
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Gửi order đến quán",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color.White
                        )
                        Text(
                            text = "Bàn $tableCode • ${cartItems.sumOf { it.quantity }} món",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color.White,
                            modifier = Modifier.alpha(0.9f)
                        )
                    }
                }

                Text(
                    text = "Bạn có thể tiếp tục chọn thêm món sau khi gửi order được này.",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Normal,
                    color = Color(0xFF666666),
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(74.dp))
            }
        }

        // Bottom Navigation
        AppBottomNavigation(
            modifier = Modifier.align(Alignment.BottomCenter),
            selectedTab = "cart",
            onMenuClick = onNavigateToMenu,
            onCartClick = { /* Already on cart */ },
            onOrderStatusClick = onNavigateToOrderStatus
        )
    }
}

@Composable
private fun CartHeader(
    tableCode: String,
    itemCount: Int,
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
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Text(
                text = "Giỏ hàng",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222)
            )
            Text(
                text = "Bàn $tableCode • $itemCount món trong giỏ",
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
        }
    }
}

@Composable
private fun DiscountBanner() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0x0FFF6F3C), RoundedCornerShape(16.dp))
            .padding(horizontal = 10.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.Top
    ) {
        Box(
            modifier = Modifier
                .size(18.dp)
                .background(Color(0xFFFF6F3C), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "%",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White
            )
        }

        Column(
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Text(
                text = "Sắp đạt ưu đãi -10% cho hóa đơn",
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222)
            )
            Text(
                text = "Thêm món ăn vật hoặc đồ uống để dễ đạt mốc giảm cho toàn bộ bàn.",
                fontSize = 11.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666),
                lineHeight = 13.sp
            )
        }
    }
}

@Composable
private fun CartItemCard(
    item: CartItem,
    onQuantityChange: (Int) -> Unit,
    onRemove: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .padding(10.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Image
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .background(Color(0xFFF5F5F5), RoundedCornerShape(12.dp))
                    .clip(RoundedCornerShape(12.dp))
            ) {
                coil.compose.AsyncImage(
                    model = ImageUrlBuilder.buildFullUrl(item.imageUrl),
                    contentDescription = item.name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop,
                    error = painterResource(id = android.R.drawable.ic_menu_gallery),
                    placeholder = painterResource(id = android.R.drawable.ic_menu_gallery)
                )
            }

            // Info
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                // Title with remove button
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Text(
                        text = item.name,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF222222),
                        lineHeight = 18.sp,
                        modifier = Modifier.weight(1f)
                    )
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .background(Color(0xFFF5F5F5), CircleShape)
                            .clickable { onRemove() },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "×",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Normal,
                            color = Color(0xFF666666)
                        )
                    }
                }

                Text(
                    text = "Combo phù hợp 2-3 người",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF666666)
                )

                Text(
                    text = item.description,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Normal,
                    color = Color(0xFF666666),
                    lineHeight = 13.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(4.dp))

                // Price and Quantity
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(2.dp)
                    ) {
                        Text(
                            text = "${item.price / 1000}.000đ combo +\n${item.toppingPrice / 1000}.000đ topping",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF666666),
                            lineHeight = 13.sp
                        )
                        Text(
                            text = "${item.quantity} × ${(item.price + item.toppingPrice) / 1000}.000đ",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF222222)
                        )
                    }

                    // Quantity Controls
                    Row(
                        modifier = Modifier
                            .background(Color(0xFFF5F5F5), RoundedCornerShape(999.dp))
                            .padding(horizontal = 6.dp, vertical = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(26.dp)
                                .background(Color.White, CircleShape)
                                .clickable { if (item.quantity > 1) onQuantityChange(item.quantity - 1) },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "−",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Normal,
                                color = Color(0xFFFF6F3C)
                            )
                        }

                        Text(
                            text = item.quantity.toString(),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF222222),
                            modifier = Modifier.widthIn(min = 22.dp),
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )

                        Box(
                            modifier = Modifier
                                .size(26.dp)
                                .background(Color.White, CircleShape)
                                .clickable { onQuantityChange(item.quantity + 1) },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "+",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Normal,
                                color = Color(0xFFFF6F3C)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                if (item.note != null) {
                    Text(
                        text = item.note,
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
private fun OrderSummary(
    subtotal: Int,
    shippingFee: Int,
    discount: Int,
    total: Int
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .padding(10.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        SummaryRow("Tạm tính", "${subtotal / 1000}.000đ")
        SummaryRow("Thuế & phí dự kiến", "${shippingFee}đ")

        Spacer(modifier = Modifier.height(2.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Tổng cộng dự kiến",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222)
            )
            Text(
                text = "${total / 1000}.000đ",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFFFF6F3C)
            )
        }

        Spacer(modifier = Modifier.height(2.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0x1416A34A), RoundedCornerShape(999.dp))
                .padding(horizontal = 8.dp, vertical = 3.dp)
        ) {
            Text(
                text = "Ưu đãi -10% sẽ tự áp dụng khi thanh toán đủ điều kiện",
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF16A34A)
            )
        }

        Text(
            text = "Giá có thể thay đổi nếu bạn thêm/bớt món trước khi gửi order.",
            fontSize = 11.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF666666)
        )
    }
}

@Composable
private fun SummaryRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium,
            color = Color(0xFF666666)
        )
        Text(
            text = value,
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium,
            color = Color(0xFF222222)
        )
    }
}
