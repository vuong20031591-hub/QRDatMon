package com.qrdatmon.staff.ui.order

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.text.NumberFormat
import java.util.*

data class OrderItem(
    val id: String,
    val orderNumber: String,
    val tableNumber: String,
    val items: List<String>,
    val totalAmount: Double,
    val status: OrderItemStatus,
    val createdAt: String,
    val customerName: String?
)

enum class OrderItemStatus {
    PENDING,      // Chờ xác nhận
    CONFIRMED,    // Đã xác nhận
    PREPARING,    // Đang chuẩn bị
    READY,        // Sẵn sàng
    SERVED,       // Đã phục vụ
    COMPLETED     // Hoàn thành
}

@Composable
fun OrderListScreen() {
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Chờ xác nhận", "Đang xử lý", "Hoàn thành")

    // Mock data
    val orders = remember {
        listOf(
            OrderItem(
                "1", "#1001", "A01",
                listOf("Phở bò", "Cà phê sữa"),
                125000.0,
                OrderItemStatus.PENDING,
                "10:30",
                "Nguyễn Văn A"
            ),
            OrderItem(
                "2", "#1002", "B02",
                listOf("Bún chả", "Trà đá"),
                85000.0,
                OrderItemStatus.CONFIRMED,
                "10:45",
                null
            ),
            OrderItem(
                "3", "#1003", "A03",
                listOf("Cơm gà", "Nước cam"),
                95000.0,
                OrderItemStatus.PREPARING,
                "11:00",
                "Trần Thị B"
            ),
            OrderItem(
                "4", "#1004", "V01",
                listOf("Lẩu hải sản", "Bia Heineken"),
                450000.0,
                OrderItemStatus.READY,
                "11:15",
                "Lê Văn C"
            ),
            OrderItem(
                "5", "#1005", "B03",
                listOf("Bánh mì", "Cà phê đen"),
                45000.0,
                OrderItemStatus.SERVED,
                "09:30",
                null
            )
        )
    }

    val filteredOrders = when (selectedTab) {
        0 -> orders.filter { it.status == OrderItemStatus.PENDING }
        1 -> orders.filter { 
            it.status in listOf(
                OrderItemStatus.CONFIRMED,
                OrderItemStatus.PREPARING,
                OrderItemStatus.READY
            )
        }
        2 -> orders.filter { 
            it.status in listOf(
                OrderItemStatus.SERVED,
                OrderItemStatus.COMPLETED
            )
        }
        else -> orders
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5))
    ) {
        // Header
        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = Color.White,
            shadowElevation = 2.dp
        ) {
            Column {
                Text(
                    text = "Đơn hàng ca hiện tại",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF222222),
                    modifier = Modifier.padding(16.dp)
                )

                // Tabs
                TabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = Color.White,
                    contentColor = Color(0xFF4CAF50)
                ) {
                    tabs.forEachIndexed { index, title ->
                        Tab(
                            selected = selectedTab == index,
                            onClick = { selectedTab = index },
                            text = {
                                Text(
                                    text = title,
                                    fontSize = 14.sp,
                                    fontWeight = if (selectedTab == index) 
                                        FontWeight.Bold 
                                    else 
                                        FontWeight.Normal
                                )
                            }
                        )
                    }
                }
            }
        }

        // Order List
        if (filteredOrders.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Không có đơn hàng",
                        fontSize = 16.sp,
                        color = Color(0xFF666666)
                    )
                    Text(
                        text = "Danh sách đơn hàng sẽ hiển thị ở đây",
                        fontSize = 12.sp,
                        color = Color(0xFF999999),
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredOrders) { order ->
                    OrderCard(order = order)
                }
            }
        }
    }
}

@Composable
private fun OrderCard(order: OrderItem) {
    val (statusColor, statusText) = when (order.status) {
        OrderItemStatus.PENDING -> Color(0xFFFF9800) to "Chờ xác nhận"
        OrderItemStatus.CONFIRMED -> Color(0xFF2196F3) to "Đã xác nhận"
        OrderItemStatus.PREPARING -> Color(0xFF9C27B0) to "Đang chuẩn bị"
        OrderItemStatus.READY -> Color(0xFF4CAF50) to "Sẵn sàng"
        OrderItemStatus.SERVED -> Color(0xFF607D8B) to "Đã phục vụ"
        OrderItemStatus.COMPLETED -> Color(0xFF4CAF50) to "Hoàn thành"
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* TODO: Navigate to order detail */ },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 2.dp
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = order.orderNumber,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF222222)
                    )
                    Box(
                        modifier = Modifier
                            .background(
                                color = Color(0xFFE8F5E9),
                                shape = RoundedCornerShape(4.dp)
                            )
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = order.tableNumber,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF4CAF50)
                        )
                    }
                }

                Row(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.AccessTime,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = Color(0xFF666666)
                    )
                    Text(
                        text = order.createdAt,
                        fontSize = 12.sp,
                        color = Color(0xFF666666)
                    )
                }
            }

            // Customer name
            if (order.customerName != null) {
                Text(
                    text = "Khách: ${order.customerName}",
                    fontSize = 12.sp,
                    color = Color(0xFF666666),
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Items
            order.items.forEach { item ->
                Row(
                    modifier = Modifier.padding(vertical = 2.dp)
                ) {
                    Text(
                        text = "• ",
                        fontSize = 14.sp,
                        color = Color(0xFF666666)
                    )
                    Text(
                        text = item,
                        fontSize = 14.sp,
                        color = Color(0xFF666666)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Footer
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = NumberFormat.getCurrencyInstance(Locale("vi", "VN"))
                        .format(order.totalAmount),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF4CAF50)
                )

                Box(
                    modifier = Modifier
                        .background(
                            color = statusColor.copy(alpha = 0.1f),
                            shape = RoundedCornerShape(8.dp)
                        )
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = statusText,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = statusColor
                    )
                }
            }

            // Action buttons for pending orders
            if (order.status == OrderItemStatus.PENDING) {
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = { /* TODO: Reject order */ },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = Color(0xFFD32F2F)
                        )
                    ) {
                        Text("Từ chối")
                    }
                    Button(
                        onClick = { /* TODO: Confirm order */ },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF4CAF50)
                        )
                    ) {
                        Text("Xác nhận")
                    }
                }
            }
        }
    }
}
