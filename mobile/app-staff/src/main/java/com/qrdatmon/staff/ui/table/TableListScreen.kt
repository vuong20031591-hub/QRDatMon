package com.qrdatmon.staff.ui.table

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
import com.qrdatmon.staff.R

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
    onTableClick: (Table) -> Unit = {}
) {
    var selectedArea by remember { mutableStateOf("all") }
    var showAreaFilter by remember { mutableStateOf(false) }

    // Mock data
    val areas = listOf(
        "all" to "Tất cả",
        "area1" to "Tầng 1",
        "area2" to "Tầng 2",
        "area3" to "VIP"
    )

    val tables = remember {
        listOf(
            Table("1", "A01", "area1", "Tầng 1", 4, TableStatus.AVAILABLE),
            Table("2", "A02", "area1", "Tầng 1", 4, TableStatus.OCCUPIED),
            Table("3", "A03", "area1", "Tầng 1", 2, TableStatus.AVAILABLE),
            Table("4", "A04", "area1", "Tầng 1", 6, TableStatus.RESERVED),
            Table("5", "B01", "area2", "Tầng 2", 4, TableStatus.AVAILABLE),
            Table("6", "B02", "area2", "Tầng 2", 4, TableStatus.OCCUPIED),
            Table("7", "B03", "area2", "Tầng 2", 8, TableStatus.CLEANING),
            Table("8", "B04", "area2", "Tầng 2", 4, TableStatus.AVAILABLE),
            Table("9", "V01", "area3", "VIP", 10, TableStatus.OCCUPIED),
            Table("10", "V02", "area3", "VIP", 12, TableStatus.AVAILABLE)
        )
    }

    val filteredTables = if (selectedArea == "all") {
        tables
    } else {
        tables.filter { it.areaId == selectedArea }
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
                        count = filteredTables.count { it.status == TableStatus.AVAILABLE }
                    )
                    StatusLegend(
                        color = Color(0xFFFF9800),
                        label = "Đang dùng",
                        count = filteredTables.count { it.status == TableStatus.OCCUPIED }
                    )
                    StatusLegend(
                        color = Color(0xFF2196F3),
                        label = "Đã đặt",
                        count = filteredTables.count { it.status == TableStatus.RESERVED }
                    )
                }
            }
        }

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
    count: Int
) {
    Row(
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
            color = Color(0xFF666666)
        )
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
            .aspectRatio(1.2f)
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
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Table Icon
            Image(
                painter = painterResource(id = R.drawable.table),
                contentDescription = "Table icon",
                modifier = Modifier.size(48.dp),
                colorFilter = ColorFilter.tint(textColor)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = table.number,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = textColor
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = statusText,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = textColor
            )
            
            Spacer(modifier = Modifier.height(2.dp))
            
            Text(
                text = "${table.capacity} chỗ",
                fontSize = 11.sp,
                color = textColor.copy(alpha = 0.7f)
            )
        }
    }
}
