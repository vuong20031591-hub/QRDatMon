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
    val cartItemId: String, // Unique ID for each cart item
    val id: String, // Menu item ID
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
    onNavigateToOrderStatus: () -> Unit,
    onNavigateToLogin: () -> Unit = {},
    viewModel: CartViewModel = androidx.lifecycle.viewmodel.compose.viewModel()
) {
    val cartItems by com.qrdatmon.customer.data.CartManager.cartItems.collectAsState()
    val selectedTable by com.qrdatmon.customer.data.TableManager.selectedTable.collectAsState()
    val selectedPromotion by com.qrdatmon.customer.data.PromotionManager.selectedPromotion.collectAsState()
    val currentOrder by com.qrdatmon.customer.data.OrderManager.currentOrder.collectAsState()
    val context = androidx.compose.ui.platform.LocalContext.current
    
    // ViewModel states
    val isCreatingOrder by viewModel.isCreatingOrder.collectAsState()
    val orderResult by viewModel.orderResult.collectAsState()
    
    // Get AuthManager to check login state
    val authManager = remember { 
        com.qrdatmon.core.common.auth.AuthManager(context, "customer_auth_prefs")
    }
    val isLoggedIn = authManager.isLoggedIn()
    
    // Show login dialog state
    var showLoginDialog by remember { mutableStateOf(false) }
    
    // Get table display name or fallback to tableCode
    val tableDisplayName = selectedTable?.displayName ?: "Bàn $tableCode"
    val tableId = selectedTable?.id ?: tableCode

    val subtotal = cartItems.sumOf { (it.price + it.toppingPrice) * it.quantity }
    val shippingFee = 0
    val total = subtotal + shippingFee
    
    // Calculate discount from promotion only
    val discount = if (selectedPromotion != null) {
        com.qrdatmon.customer.data.PromotionManager.calculateDiscount(total)
    } else {
        0
    }
    
    val finalTotal = total - discount
    
    // Handle order result
    LaunchedEffect(orderResult) {
        orderResult?.let { result ->
            result.onSuccess { orderResponse ->
                // Convert OrderResponse to OrderInfo and save to OrderManager
                val orderInfo = com.qrdatmon.customer.data.OrderInfo(
                    orderId = orderResponse.id,
                    orderNumber = orderResponse.orderNumber,
                    tableId = tableId,
                    tableDisplayName = tableDisplayName,
                    items = cartItems, // Use local cart items
                    subtotal = subtotal,
                    discount = discount,
                    total = finalTotal,
                    orderTime = java.text.SimpleDateFormat("HH:mm, dd/MM/yyyy", java.util.Locale.getDefault()).format(java.util.Date()),
                    status = when (orderResponse.status) {
                        "pending" -> com.qrdatmon.customer.data.OrderStatus.PREPARING
                        "confirmed" -> com.qrdatmon.customer.data.OrderStatus.PREPARING
                        "preparing" -> com.qrdatmon.customer.data.OrderStatus.PREPARING
                        "ready" -> com.qrdatmon.customer.data.OrderStatus.READY
                        "served" -> com.qrdatmon.customer.data.OrderStatus.SERVING
                        "completed" -> com.qrdatmon.customer.data.OrderStatus.COMPLETED
                        else -> com.qrdatmon.customer.data.OrderStatus.PREPARING
                    }
                )
                
                // Check if there's already an order
                if (currentOrder != null) {
                    // Add items to existing order
                    com.qrdatmon.customer.data.OrderManager.addItemsToCurrentOrder(
                        newItems = cartItems,
                        additionalSubtotal = subtotal,
                        additionalDiscount = discount,
                        additionalTotal = finalTotal
                    )
                } else {
                    // Save new order
                    com.qrdatmon.customer.data.OrderManager.setOrder(orderInfo)
                }
                
                // Clear cart after successful order
                com.qrdatmon.customer.data.CartManager.clearCart()
                
                // Reset order result
                viewModel.resetOrderResult()
                
                // Navigate to order status
                onCheckoutClick()
            }
            result.onFailure { error ->
                // Show error (you can add a Snackbar or Toast here)
                android.util.Log.e("CartScreen", "Failed to create order: ${error.message}")
                viewModel.resetOrderResult()
            }
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
            CartHeader(
                tableDisplayName = tableDisplayName,
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
                // Discount Banner - Only show if there's a promotion
                if (selectedPromotion != null) {
                    item {
                        DiscountBanner(
                            isLoggedIn = isLoggedIn,
                            selectedPromotion = selectedPromotion,
                            orderAmount = total,
                            onLoginClick = { showLoginDialog = true },
                            onRemovePromotion = {
                                com.qrdatmon.customer.data.PromotionManager.clearPromotion()
                            }
                        )
                    }
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
                                        com.qrdatmon.customer.data.CartManager.updateQuantity(item.cartItemId, newQuantity)
                                    },
                                    onRemove = {
                                        com.qrdatmon.customer.data.CartManager.removeItem(item.cartItemId)
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
                    onClick = {
                        // Call ViewModel to create order
                        viewModel.createOrder(
                            cartItems = cartItems,
                            tableId = tableId,
                            note = null
                        )
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(24.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFFF6F3C)
                    ),
                    enabled = cartItems.isNotEmpty() && !isCreatingOrder
                ) {
                    if (isCreatingOrder) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = Color.White,
                            strokeWidth = 2.dp
                        )
                    } else {
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
                                text = "$tableDisplayName • ${cartItems.sumOf { it.quantity }} món",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color.White,
                                modifier = Modifier.alpha(0.9f)
                            )
                        }
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
    
    // Show login dialog when needed
    if (showLoginDialog) {
        com.qrdatmon.customer.ui.promo.RequireLoginDialog(
            onDismiss = { showLoginDialog = false },
            onLoginClick = {
                showLoginDialog = false
                onNavigateToLogin()
            }
        )
    }
}

@Composable
private fun CartHeader(
    tableDisplayName: String,
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
                text = "$tableDisplayName • $itemCount món trong giỏ",
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
private fun DiscountBanner(
    isLoggedIn: Boolean,
    selectedPromotion: com.qrdatmon.core.network.dto.promotion.PromotionResponse?,
    orderAmount: Int,
    onLoginClick: () -> Unit,
    onRemovePromotion: () -> Unit
) {
    // If promotion is applied
    if (selectedPromotion != null) {
        val isApplicable = orderAmount >= selectedPromotion.minOrderAmount
        val discountText = if (selectedPromotion.discountType == "percent") {
            "Giảm ${selectedPromotion.discountValue.toInt()}%"
        } else {
            "Giảm ${(selectedPromotion.discountValue / 1000).toInt()}.000đ"
        }
        
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    if (isApplicable) Color(0x1A16A34A) else Color(0x1AEF4444),
                    RoundedCornerShape(16.dp)
                )
                .padding(horizontal = 10.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.Top
        ) {
            Box(
                modifier = Modifier
                    .size(18.dp)
                    .background(
                        if (isApplicable) Color(0xFF16A34A) else Color(0xFFEF4444),
                        CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (isApplicable) "✓" else "!",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                Text(
                    text = if (isApplicable) {
                        "Đã áp dụng: $discountText"
                    } else {
                        "Chưa đủ điều kiện áp dụng"
                    },
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF222222)
                )
                Text(
                    text = if (isApplicable) {
                        selectedPromotion.name
                    } else {
                        "Cần thêm ${((selectedPromotion.minOrderAmount - orderAmount) / 1000).toInt()}.000đ để áp dụng mã"
                    },
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Normal,
                    color = Color(0xFF666666),
                    lineHeight = 13.sp
                )
            }
            
            // Remove button
            Box(
                modifier = Modifier
                    .size(24.dp)
                    .background(Color(0xFFF5F5F5), CircleShape)
                    .clickable { onRemovePromotion() },
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
    } else {
        // No promotion applied - show login banner or default message
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0x0FFF6F3C), RoundedCornerShape(16.dp))
                .clickable { if (!isLoggedIn) onLoginClick() }
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
                    text = if (isLoggedIn) "%" else "🔒",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
            }

            Column(
                verticalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                Text(
                    text = if (isLoggedIn) {
                        "Sắp đạt ưu đãi -10% cho hóa đơn"
                    } else {
                        "Đăng nhập để nhận ưu đãi -10%"
                    },
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF222222)
                )
                Text(
                    text = if (isLoggedIn) {
                        "Thêm món ăn vật hoặc đồ uống để dễ đạt mốc giảm cho toàn bộ bàn."
                    } else {
                        "Nhấn vào đây để đăng nhập và tận hưởng ưu đãi"
                    },
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Normal,
                    color = Color(0xFF666666),
                    lineHeight = 13.sp
                )
            }
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
        
        // Show discount row only if there's a discount
        if (discount > 0) {
            SummaryRow(
                "Giảm giá",
                "-${discount / 1000}.000đ",
                valueColor = Color(0xFF16A34A)
            )
        }

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

        // Show discount info only if there's a discount
        if (discount > 0) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0x1416A34A), RoundedCornerShape(999.dp))
                    .padding(horizontal = 8.dp, vertical = 3.dp)
            ) {
                Text(
                    text = "Đã áp dụng giảm giá ${discount / 1000}.000đ",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF16A34A)
                )
            }
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
private fun SummaryRow(
    label: String,
    value: String,
    valueColor: Color = Color(0xFF222222)
) {
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
            color = valueColor
        )
    }
}
