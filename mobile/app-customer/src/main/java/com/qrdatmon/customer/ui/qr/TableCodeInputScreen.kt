package com.qrdatmon.customer.ui.qr

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.hilt.navigation.compose.hiltViewModel

@Composable
fun TableCodeInputScreen(
    onBackClick: () -> Unit,
    onConfirmClick: (String) -> Unit,
    onScanQrClick: () -> Unit,
    viewModel: TableCodeInputViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedTable by remember { mutableStateOf<TableItem?>(null) }
    var showErrorDialog by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    val isCodeValid = selectedTable != null

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .background(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color(0x1FFF6F3C),
                        Color.Transparent
                    ),
                    center = androidx.compose.ui.geometry.Offset(0.5f, 0f),
                    radius = 1000f
                )
            )
            .padding(horizontal = 20.dp, vertical = 16.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(
                modifier = Modifier.fillMaxWidth()
            ) {
                // Header
                TableCodeHeader(onBackClick = onBackClick)

                Spacer(modifier = Modifier.height(20.dp))

                // App Branding
                TableCodeAppBranding()

                Spacer(modifier = Modifier.height(20.dp))

                // Title and Description
                TableCodeTitle()

                Spacer(modifier = Modifier.height(20.dp))

                // Input Card
                TableCodeInputCard(
                    selectedTable = selectedTable,
                    tables = uiState.tables,
                    isLoading = uiState.isLoading,
                    onTableSelected = { selectedTable = it }
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Confirm Button
                Button(
                    onClick = { 
                        if (isCodeValid && selectedTable != null) {
                            // Validate table status
                            val validationError = viewModel.validateTableStatus(selectedTable!!.status)
                            if (validationError != null) {
                                // Show error dialog
                                errorMessage = validationError
                                showErrorDialog = true
                            } else {
                                // Save table info to TableManager
                                com.qrdatmon.customer.data.TableManager.setTable(
                                    com.qrdatmon.customer.data.SelectedTable(
                                        id = selectedTable!!.id,
                                        tableNumber = selectedTable!!.tableNumber,
                                        areaName = selectedTable!!.areaName,
                                        displayName = selectedTable!!.displayName
                                    )
                                )
                                onConfirmClick(selectedTable!!.id)
                            }
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(24.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isCodeValid) Color(0xFFFF6F3C) else Color(0x66FF6F3C),
                        disabledContainerColor = Color(0x66FF6F3C)
                    ),
                    enabled = isCodeValid
                ) {
                    Text(
                        text = "Xác nhận",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.White
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Back to QR Scan
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(40.dp)
                        .clickable { onScanQrClick() },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Quay lại quét QR",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFFFF6F3C),
                        modifier = Modifier
                            .border(
                                width = 1.dp,
                                color = Color(0x4DFF6F3C),
                                shape = RoundedCornerShape(0.dp)
                            )
                            .padding(bottom = 2.dp)
                    )
                }
            }

            // Terms
            Text(
                text = "Tiếp tục đồng nghĩa với việc bạn đồng ý để nhà hàng ghi nhận order cho bàn này.",
                fontSize = 12.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666),
                textAlign = TextAlign.Center,
                lineHeight = 17.sp,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            )
        }
    }
    
    // Error Dialog
    if (showErrorDialog) {
        TableUnavailableDialog(
            message = errorMessage,
            onDismiss = { 
                showErrorDialog = false
                selectedTable = null // Clear selection
            },
            onRetry = {
                showErrorDialog = false
                selectedTable = null
                viewModel.retryLoadTables() // Reload tables
            }
        )
    }
}

@Composable
private fun TableCodeHeader(onBackClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Back Button
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(Color(0xFFF5F5F5))
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

        // Title
        Text(
            text = "Nhập mã bàn",
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF222222)
        )
    }
}

@Composable
private fun TableCodeAppBranding() {
    Row(
        modifier = Modifier.fillMaxWidth(),
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
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222)
            )
            Text(
                text = "Kết nối đúng bàn, phục vụ chính xác",
                fontSize = 12.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666)
            )
        }
    }
}

@Composable
private fun TableCodeTitle() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(5.dp)
    ) {
        Text(
            text = "Chọn bàn của bạn",
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF222222)
        )
        Text(
            text = "Nếu không quét được QR, hãy chọn bàn từ danh sách bên dưới để bắt đầu đặt món.",
            fontSize = 14.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF666666),
            lineHeight = 20.sp
        )
    }
}

@Composable
private fun TableCodeInputCard(
    selectedTable: TableItem?,
    tables: List<TableItem>,
    isLoading: Boolean,
    onTableSelected: (TableItem) -> Unit
) {
    var showDropdown by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.dp, Color(0x05000000), RoundedCornerShape(16.dp))
            .padding(horizontal = 14.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Label
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Chọn bàn",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF222222)
                )
                if (tables.isNotEmpty()) {
                    Text(
                        text = "${tables.size} bàn có sẵn",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Normal,
                        color = Color(0xFF666666)
                    )
                }
            }

            // Dropdown Field
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .background(Color(0xFFF5F5F5), RoundedCornerShape(8.dp))
                    .border(1.dp, Color(0xFFE0E0E0), RoundedCornerShape(8.dp))
                    .clickable { if (!isLoading && tables.isNotEmpty()) showDropdown = true }
                    .padding(horizontal = 12.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (isLoading) {
                        Text(
                            text = "Đang tải danh sách bàn...",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Normal,
                            color = Color(0xFF666666)
                        )
                    } else if (tables.isEmpty()) {
                        Text(
                            text = "Không có bàn nào",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Normal,
                            color = Color(0xFF666666)
                        )
                    } else {
                        Text(
                            text = selectedTable?.displayName ?: "Chọn bàn của bạn",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Normal,
                            color = if (selectedTable != null) Color(0xFF222222) else Color(0xFF666666)
                        )
                    }
                    
                    Icon(
                        imageVector = if (showDropdown) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                        contentDescription = null,
                        tint = Color(0xFF666666),
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }

        // Warning Note
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.Top
        ) {
            Box(
                modifier = Modifier
                    .width(3.5.dp)
                    .height(6.dp)
                    .background(Color(0xFFFF6F3C), RoundedCornerShape(999.dp))
                    .offset(y = 6.dp)
            )
            Text(
                text = "Hãy đảm bảo bạn chọn đúng bàn hiện tại để nhà hàng phục vụ chính xác cho bạn.",
                fontSize = 12.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666),
                lineHeight = 17.sp,
                modifier = Modifier.weight(1f)
            )
        }
    }

    // Dropdown Dialog
    if (showDropdown) {
        TableSelectionDialog(
            tables = tables,
            selectedTable = selectedTable,
            onTableSelected = { table ->
                onTableSelected(table)
                showDropdown = false
            },
            onDismiss = { showDropdown = false }
        )
    }
}

@Composable
private fun TableSelectionDialog(
    tables: List<TableItem>,
    selectedTable: TableItem?,
    onTableSelected: (TableItem) -> Unit,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(max = 500.dp),
            shape = RoundedCornerShape(16.dp),
            color = Color.White
        ) {
            Column(
                modifier = Modifier.fillMaxWidth()
            ) {
                // Header
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Text(
                        text = "Chọn bàn",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF222222)
                    )
                }

                Divider(color = Color(0xFFE0E0E0), thickness = 1.dp)

                // Table List
                LazyColumn(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(tables) { table ->
                        TableItemRow(
                            table = table,
                            isSelected = table.id == selectedTable?.id,
                            onClick = { onTableSelected(table) }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun TableItemRow(
    table: TableItem,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .background(if (isSelected) Color(0x1AFF6F3C) else Color.Transparent)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = table.displayName,
                fontSize = 15.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF222222)
            )
            Text(
                text = "Khu vực: ${table.areaName}",
                fontSize = 13.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666)
            )
        }

        if (isSelected) {
            Box(
                modifier = Modifier
                    .size(20.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFFF6F3C)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = android.R.drawable.ic_menu_close_clear_cancel),
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(12.dp)
                )
            }
        }
    }
}


@Composable
private fun TableUnavailableDialog(
    message: String,
    onDismiss: () -> Unit,
    onRetry: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = {
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(Color(0xFFFFEBEE)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "⚠️",
                    fontSize = 28.sp
                )
            }
        },
        title = {
            Text(
                text = "Bàn không khả dụng",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF222222),
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        },
        text = {
            Text(
                text = message,
                fontSize = 14.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666),
                textAlign = TextAlign.Center,
                lineHeight = 20.sp,
                modifier = Modifier.fillMaxWidth()
            )
        },
        confirmButton = {
            Button(
                onClick = onRetry,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFFF6F3C)
                )
            ) {
                Text(
                    text = "Chọn bàn khác",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.White
                )
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp)
            ) {
                Text(
                    text = "Đóng",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF666666)
                )
            }
        },
        shape = RoundedCornerShape(20.dp),
        containerColor = Color.White
    )
}
