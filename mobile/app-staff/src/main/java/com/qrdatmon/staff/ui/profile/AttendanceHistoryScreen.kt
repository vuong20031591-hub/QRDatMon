package com.qrdatmon.staff.ui.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.text.SimpleDateFormat
import java.util.*

data class AttendanceRecord(
    val id: String,
    val date: String,
    val checkInTime: String,
    val checkOutTime: String?,
    val workHours: Double,
    val status: AttendanceStatus
)

enum class AttendanceStatus {
    COMPLETED,  // Hoàn thành
    IN_PROGRESS, // Đang làm
    LATE,       // Đi muộn
    EARLY_LEAVE // Về sớm
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AttendanceHistoryScreen(
    onBackClick: () -> Unit
) {
    var selectedMonth by remember { mutableStateOf(Calendar.getInstance().get(Calendar.MONTH)) }
    var selectedYear by remember { mutableStateOf(Calendar.getInstance().get(Calendar.YEAR)) }

    // Mock data
    val attendanceRecords = remember {
        listOf(
            AttendanceRecord(
                "1", "17/12/2024", "08:00", "16:30", 8.5, AttendanceStatus.COMPLETED
            ),
            AttendanceRecord(
                "2", "16/12/2024", "08:15", "16:00", 7.75, AttendanceStatus.LATE
            ),
            AttendanceRecord(
                "3", "15/12/2024", "08:00", "15:30", 7.5, AttendanceStatus.EARLY_LEAVE
            ),
            AttendanceRecord(
                "4", "14/12/2024", "08:00", null, 0.0, AttendanceStatus.IN_PROGRESS
            ),
            AttendanceRecord(
                "5", "13/12/2024", "08:00", "16:00", 8.0, AttendanceStatus.COMPLETED
            ),
            AttendanceRecord(
                "6", "12/12/2024", "08:00", "16:00", 8.0, AttendanceStatus.COMPLETED
            ),
            AttendanceRecord(
                "7", "11/12/2024", "08:30", "16:00", 7.5, AttendanceStatus.LATE
            )
        )
    }

    val totalWorkHours = attendanceRecords.sumOf { it.workHours }
    val totalDays = attendanceRecords.size

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Lịch sử chấm công",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
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
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF5F5F5))
                .padding(paddingValues),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Summary Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFF4CAF50)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp)
                    ) {
                        Text(
                            text = "Tháng ${selectedMonth + 1}/${selectedYear}",
                            fontSize = 14.sp,
                            color = Color.White.copy(alpha = 0.9f)
                        )
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(
                                    text = "$totalDays ngày",
                                    fontSize = 28.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Text(
                                    text = "Tổng số ngày làm",
                                    fontSize = 12.sp,
                                    color = Color.White.copy(alpha = 0.9f),
                                    modifier = Modifier.padding(top = 4.dp)
                                )
                            }
                            
                            Column(
                                horizontalAlignment = Alignment.End
                            ) {
                                Text(
                                    text = String.format("%.1f giờ", totalWorkHours),
                                    fontSize = 28.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Text(
                                    text = "Tổng giờ làm",
                                    fontSize = 12.sp,
                                    color = Color.White.copy(alpha = 0.9f),
                                    modifier = Modifier.padding(top = 4.dp)
                                )
                            }
                        }
                    }
                }
            }

            // Status Legend
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
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        StatusBadge(
                            color = Color(0xFF4CAF50),
                            label = "Hoàn thành",
                            count = attendanceRecords.count { it.status == AttendanceStatus.COMPLETED }
                        )
                        StatusBadge(
                            color = Color(0xFFFF9800),
                            label = "Đi muộn",
                            count = attendanceRecords.count { it.status == AttendanceStatus.LATE }
                        )
                        StatusBadge(
                            color = Color(0xFF2196F3),
                            label = "Về sớm",
                            count = attendanceRecords.count { it.status == AttendanceStatus.EARLY_LEAVE }
                        )
                    }
                }
            }

            // Attendance Records
            items(attendanceRecords) { record ->
                AttendanceRecordCard(record = record)
            }

            item { Spacer(modifier = Modifier.height(16.dp)) }
        }
    }
}

@Composable
private fun StatusBadge(
    color: Color,
    label: String,
    count: Int
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .background(color.copy(alpha = 0.1f), RoundedCornerShape(8.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "$count",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = color
            )
        }
        Text(
            text = label,
            fontSize = 11.sp,
            color = Color(0xFF666666),
            modifier = Modifier.padding(top = 4.dp)
        )
    }
}

@Composable
private fun AttendanceRecordCard(record: AttendanceRecord) {
    val (statusColor, statusText) = when (record.status) {
        AttendanceStatus.COMPLETED -> Color(0xFF4CAF50) to "Hoàn thành"
        AttendanceStatus.IN_PROGRESS -> Color(0xFF2196F3) to "Đang làm"
        AttendanceStatus.LATE -> Color(0xFFFF9800) to "Đi muộn"
        AttendanceStatus.EARLY_LEAVE -> Color(0xFFFF9800) to "Về sớm"
    }

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
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.CalendarToday,
                        contentDescription = null,
                        tint = Color(0xFF4CAF50),
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = record.date,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF222222)
                    )
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Column {
                        Text(
                            text = "Giờ vào",
                            fontSize = 11.sp,
                            color = Color(0xFF999999)
                        )
                        Text(
                            text = record.checkInTime,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF222222),
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }
                    
                    Column {
                        Text(
                            text = "Giờ ra",
                            fontSize = 11.sp,
                            color = Color(0xFF999999)
                        )
                        Text(
                            text = record.checkOutTime ?: "--:--",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF222222),
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }
                }
            }
            
            Column(
                horizontalAlignment = Alignment.End
            ) {
                Box(
                    modifier = Modifier
                        .background(
                            statusColor.copy(alpha = 0.1f),
                            RoundedCornerShape(4.dp)
                        )
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = statusText,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = statusColor
                    )
                }
                
                if (record.workHours > 0) {
                    Text(
                        text = "${record.workHours} giờ",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF4CAF50),
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }
        }
    }
}
