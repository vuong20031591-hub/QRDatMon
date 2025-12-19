package com.qrdatmon.staff.ui.table

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.qrdatmon.staff.R
import com.qrdatmon.staff.ui.theme.Dimensions

data class Table(
    val id: String,
    val number: String,
    val areaId: String,
    val areaName: String,
    val capacity: Int,
    val status: TableStatus
)

enum class TableStatus {
    AVAILABLE,    // Trống
    OCCUPIED,     // Đang dùng
    RESERVED,     // Đã đặt
    CLEANING      // Đang dọn
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TableListScreen(
    viewModel: TableViewModel = androidx.lifecycle.viewmodel.compose.viewModel(),
    onTableClick: (Table) -> Unit = {}
) {
    var selectedArea by remember { mutableStateOf("all") }
    var showAreaFilter by remember { mutableStateOf(false) }
    var selectedStatuses by remember { mutableStateOf(setOf<TableStatus>()) }
    
    val uiState by viewModel.uiState.collectAsState()

    // Get unique areas from tables
    val areas = remember(uiState.tables) {
        val areaMap = mutableMapOf("all" to "Tất cả")
        uiState.tables.forEach { table ->
            if (!areaMap.containsKey(table.areaId)) {
                areaMap[table.areaId] = table.areaName
            }
        }
        areaMap.toList()
    }

    val filteredTables = uiState.tables
        .filter { table ->
            // Filter by area
            val matchesArea = selectedArea == "all" || table.areaId == selectedArea
            // Filter by status (if any status is selected)
            val matchesStatus = selectedStatuses.isEmpty() || table.status in selectedStatuses
            matchesArea && matchesStatus
        }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5))
            .padding(top = Dimensions.statusBarPadding)
    ) {
        // Header
        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = Color.White,
            shadowElevation = 2.dp
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Danh sách bàn",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF222222)
                        )
                        Text(
                            text = "${filteredTables.size} bàn",
                            fontSize = 14.sp,
                            color = Color(0xFF666666)
                        )
                    }

                    IconButton(onClick = { showAreaFilter = true }) {
                        Icon(
                            imageVector = Icons.Default.FilterList,
                            contentDescription = "Lọc theo khu vực",
                            tint = Color(0xFF4CAF50)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Status Legend
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatusLegend(
                        color = Color(0xFF4CAF50),
                        label = "Trống",
                        count = uiState.tables.count { it.status == TableStatus.AVAILABLE },
                        isSelected = TableStatus.AVAILABLE in selectedStatuses,
                        onClick = {
                            selectedStatuses = if (TableStatus.AVAILABLE in selectedStatuses) {
                                selectedStatuses - TableStatus.AVAILABLE
                            } else {
                                selectedStatuses + TableStatus.AVAILABLE
                            }
                        }
                    )
                    StatusLegend(
                        color = Color(0xFFFF9800),
                        label = "Đang dùng",
                        count = uiState.tables.count { it.status == TableStatus.OCCUPIED },
                        isSelected = TableStatus.OCCUPIED in selectedStatuses,
                        onClick = {
                            selectedStatuses = if (TableStatus.OCCUPIED in selectedStatuses) {
                                selectedStatuses - TableStatus.OCCUPIED
                            } else {
                                selectedStatuses + TableStatus.OCCUPIED
                            }
                        }
                    )
                    StatusLegend(
                        color = Color(0xFF2196F3),
                        label = "Đã đặt",
                        count = uiState.tables.count { it.status == TableStatus.RESERVED },
                        isSelected = TableStatus.RESERVED in selectedStatuses,
                        onClick = {
                            selectedStatuses = if (TableStatus.RESERVED in selectedStatuses) {
                                selectedStatuses - TableStatus.RESERVED
                            } else {
                                selectedStatuses + TableStatus.RESERVED
                            }
                        }
                    )
                }
            }
        }

        // Content
        Box(modifier = Modifier.fillMaxSize()) {
            when {
                uiState.isLoading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(
                            color = Color(0xFF4CAF50)
                        )
                    }
                }
                uiState.errorMessage.isNotEmpty() -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
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
                                onClick = { viewModel.loadTables() },
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
                filteredTables.isEmpty() -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Không có bàn nào",
                            fontSize = 16.sp,
                            color = Color(0xFF666666)
                        )
                    }
                }
                else -> {
                    // Table Grid - 2 columns per row
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        contentPadding = PaddingValues(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(filteredTables) { table ->
                            TableCard(
                                table = table,
                                onClick = { onTableClick(table) }
                            )
                        }
                    }
                }
            }
        }
    }

    // Area Filter Bottom Sheet
    if (showAreaFilter) {
        ModalBottomSheet(
            onDismissRequest = { showAreaFilter = false }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Text(
                    text = "Chọn khu vực",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                areas.forEach { (id, name) ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                selectedArea = id
                                showAreaFilter = false
                            }
                            .padding(vertical = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = name,
                            fontSize = 16.sp,
                            color = if (selectedArea == id) 
                                Color(0xFF4CAF50) 
                            else 
                                Color(0xFF222222)
                        )
                        if (selectedArea == id) {
                            Icon(
                                imageVector = Icons.Default.FilterList,
                                contentDescription = null,
                                tint = Color(0xFF4CAF50)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}

@Composable
private fun StatusLegend(
    color: Color,
    label: String,
    count: Int,
    isSelected: Boolean = false,
    onClick: () -> Unit = {}
) {
    Surface(
        modifier = Modifier.clickable { onClick() },
        shape = RoundedCornerShape(8.dp),
        color = if (isSelected) color.copy(alpha = 0.15f) else Color.Transparent,
        border = if (isSelected) androidx.compose.foundation.BorderStroke(1.dp, color) else null
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(12.dp)
                    .background(color, RoundedCornerShape(2.dp))
            )
            Text(
                text = "$label ($count)",
                fontSize = 12.sp,
                color = if (isSelected) color else Color(0xFF666666),
                fontWeight = if (isSelected) FontWeight.Medium else FontWeight.Normal
            )
            if (isSelected) {
                Icon(
                    imageVector = Icons.Default.FilterList,
                    contentDescription = null,
                    modifier = Modifier.size(14.dp),
                    tint = color
                )
            }
        }
    }
}

@Composable
private fun TableCard(
    table: Table,
    onClick: () -> Unit = {}
) {
    val (backgroundColor, textColor) = when (table.status) {
        TableStatus.AVAILABLE -> Color(0xFFE8F5E9) to Color(0xFF4CAF50)
        TableStatus.OCCUPIED -> Color(0xFFFFF3E0) to Color(0xFFFF9800)
        TableStatus.RESERVED -> Color(0xFFE3F2FD) to Color(0xFF2196F3)
        TableStatus.CLEANING -> Color(0xFFF5F5F5) to Color(0xFF9E9E9E)
    }

    val statusText = when (table.status) {
        TableStatus.AVAILABLE -> "Trống"
        TableStatus.OCCUPIED -> "Đang dùng"
        TableStatus.RESERVED -> "Đã đặt"
        TableStatus.CLEANING -> "Đang dọn"
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(1.0f)
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = backgroundColor
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 2.dp
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Table Icon
            Image(
                painter = painterResource(id = R.drawable.table),
                contentDescription = "Table icon",
                modifier = Modifier.size(40.dp),
                colorFilter = ColorFilter.tint(textColor)
            )
            
            Spacer(modifier = Modifier.height(6.dp))
            
            Text(
                text = table.number,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = textColor
            )
            
            Spacer(modifier = Modifier.height(3.dp))
            
            Text(
                text = statusText,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = textColor
            )
            
            Spacer(modifier = Modifier.height(2.dp))
            
            Text(
                text = "${table.capacity} chỗ",
                fontSize = 10.sp,
                color = textColor.copy(alpha = 0.7f)
            )
        }
    }
}
