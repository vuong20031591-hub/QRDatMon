package com.qrdatmon.staff.ui.table

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.text.NumberFormat
import java.util.*

data class TableDetail(
    val table: Table,
    val customer: Customer?,
    val orderItems: List<OrderItemDetail>,
    val subtotal: Double,
    val serviceCharge: Double,
    val vat: Double,
    val total: Double,
    val orderTime: String
)

data class Customer(
    val name: String,
    val phone: String?,
    val isGuest: Boolean
)

data class OrderItemDetail(
    val id: String,
    val name: String,
    val quantity: Int,
    val price: Double,
    val subtotal: Double,
    val note: String?,
    val status: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TableDetailScreen(
    table: Table,
    onBackClick: () -> Unit,
    onCheckout: () -> Unit,
    viewModel: TableDetailViewModel = androidx.lifecycle.viewmodel.compose.viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    // Load table detail when screen opens
    LaunchedEffect(table.id) {
        viewModel.loadTableDetail(table.id)
    }
    
    val tableDetail = uiState.tableDetail

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Bàn ${table.number}",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = table.areaName,
                            fontSize = 12.sp,
                            color = Color(0xFF666666)
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        when {
            uiState.isLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(
                        color = Color(0xFF4CAF50)
                    )
                }
            }
            uiState.errorMessage.isNotEmpty() -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Lỗi tải dữ liệu",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFFD32F2F)
                        )
                        Text(
                            text = uiState.errorMessage,
                            fontSize = 14.sp,
                            color = Color(0xFF666666),
                            modifier = Modifier.padding(top = 4.dp)
                        )
                        Button(
                            onClick = { viewModel.loadTableDetail(table.id) },
                            modifier = Modifier.padding(top = 16.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF4CAF50)
                            )
                        ) {
                            Text("Thử lại")
                        }
                    }
                }
            }
            tableDetail == null -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(
                        color = Color(0xFF4CAF50)
                    )
                }
            }
            tableDetail.table.status == TableStatus.AVAILABLE -> {
                // Empty state
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.EventAvailable,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = Color(0xFF4CAF50)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Bàn đang trống",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF222222)
                        )
                        Text(
                            text = "Chưa có khách sử dụng",
                            fontSize = 14.sp,
                            color = Color(0xFF666666),
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
            }
            else -> {
                LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFFF5F5F5))
                    .padding(paddingValues),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Customer Info
                if (tableDetail.customer != null) {
                    item {
                        CustomerInfoCard(customer = tableDetail.customer)
                    }
                }

                // Order Info Header
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = Color.White
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.AccessTime,
                                    contentDescription = null,
                                    tint = Color(0xFF4CAF50),
                                    modifier = Modifier.size(20.dp)
                                )
                                Text(
                                    text = "Giờ vào: ${tableDetail.orderTime}",
                                    fontSize = 14.sp,
                                    color = Color(0xFF666666)
                                )
                            }
                            Box(
                                modifier = Modifier
                                    .background(
                                        Color(0xFFE8F5E9),
                                        RoundedCornerShape(999.dp)
                                    )
                                    .padding(horizontal = 12.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = "${tableDetail.orderItems.size} món",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF4CAF50)
                                )
                            }
                        }
                    }
                }

                // Order Items
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = Color.White
                        )
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp)
                        ) {
                            Text(
                                text = "Chi tiết món ăn",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF222222)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            
                            tableDetail.orderItems.forEach { item ->
                                OrderItemRow(item = item)
                                if (item != tableDetail.orderItems.last()) {
                                    Divider(modifier = Modifier.padding(vertical = 12.dp))
                                }
                            }
                        }
                    }
                }

                // Payment Summary
                item {
                    PaymentSummaryCard(tableDetail = tableDetail)
                }

                // Action Buttons
                item {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Button(
                            onClick = onCheckout,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF4CAF50)
                            )
                        ) {
                            Icon(
                                imageVector = Icons.Default.Payment,
                                contentDescription = null
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Thanh toán",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }

                        OutlinedButton(
                            onClick = { /* TODO: Add more items */ },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = Color(0xFF4CAF50)
                            )
                        ) {
                            Icon(
                                imageVector = Icons.Default.Add,
                                contentDescription = null
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Thêm món",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }

                item { Spacer(modifier = Modifier.height(16.dp)) }
            }
        }
        }
    }
}

@Composable
private fun CustomerInfoCard(customer: Customer) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFE8F5E9)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = null,
                    tint = Color(0xFF4CAF50),
                    modifier = Modifier.size(28.dp)
                )
            }

            Column(
                modifier = Modifier.weight(1f)
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = customer.name,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF222222)
                    )
                    if (!customer.isGuest) {
                        Box(
                            modifier = Modifier
                                .background(
                                    Color(0xFFE3F2FD),
                                    RoundedCornerShape(4.dp)
                                )
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "Thành viên",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF2196F3)
                            )
                        }
                    }
                }
                if (customer.phone != null) {
                    Text(
                        text = customer.phone,
                        fontSize = 14.sp,
                        color = Color(0xFF666666),
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }
            }

            IconButton(onClick = { /* TODO: Call customer */ }) {
                Icon(
                    imageVector = Icons.Default.Phone,
                    contentDescription = "Call",
                    tint = Color(0xFF4CAF50)
                )
            }
        }
    }
}

@Composable
private fun OrderItemRow(item: OrderItemDetail) {
    val statusColor = when (item.status) {
        "preparing" -> Color(0xFFFF9800)
        "ready" -> Color(0xFF4CAF50)
        "served" -> Color(0xFF607D8B)
        else -> Color(0xFF999999)
    }

    val statusText = when (item.status) {
        "preparing" -> "Đang chuẩn bị"
        "ready" -> "Sẵn sàng"
        "served" -> "Đã phục vụ"
        else -> "Chờ xử lý"
    }

    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = item.name,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF222222)
                )
                if (item.note != null) {
                    Text(
                        text = "Ghi chú: ${item.note}",
                        fontSize = 12.sp,
                        color = Color(0xFF999999),
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }
                Box(
                    modifier = Modifier
                        .padding(top = 4.dp)
                        .background(
                            statusColor.copy(alpha = 0.1f),
                            RoundedCornerShape(4.dp)
                        )
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = statusText,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = statusColor
                    )
                }
            }
            Column(
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = "x${item.quantity}",
                    fontSize = 14.sp,
                    color = Color(0xFF666666)
                )
                Text(
                    text = NumberFormat.getCurrencyInstance(Locale("vi", "VN"))
                        .format(item.subtotal),
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF4CAF50),
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }
    }
}

@Composable
private fun PaymentSummaryCard(tableDetail: TableDetail) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Thanh toán",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF222222)
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            PaymentRow(
                label = "Tạm tính",
                value = tableDetail.subtotal,
                isTotal = false
            )
            PaymentRow(
                label = "Phí phục vụ (10%)",
                value = tableDetail.serviceCharge,
                isTotal = false
            )
            PaymentRow(
                label = "VAT (10%)",
                value = tableDetail.vat,
                isTotal = false
            )
            
            Divider(modifier = Modifier.padding(vertical = 12.dp))
            
            PaymentRow(
                label = "Tổng cộng",
                value = tableDetail.total,
                isTotal = true
            )
        }
    }
}

@Composable
private fun PaymentRow(
    label: String,
    value: Double,
    isTotal: Boolean
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            fontSize = if (isTotal) 16.sp else 14.sp,
            fontWeight = if (isTotal) FontWeight.Bold else FontWeight.Normal,
            color = if (isTotal) Color(0xFF222222) else Color(0xFF666666)
        )
        Text(
            text = NumberFormat.getCurrencyInstance(Locale("vi", "VN"))
                .format(value),
            fontSize = if (isTotal) 18.sp else 14.sp,
            fontWeight = if (isTotal) FontWeight.Bold else FontWeight.Normal,
            color = if (isTotal) Color(0xFF4CAF50) else Color(0xFF222222)
        )
    }
}
