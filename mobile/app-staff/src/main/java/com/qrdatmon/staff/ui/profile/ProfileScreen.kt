package com.qrdatmon.staff.ui.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.text.SimpleDateFormat
import java.util.*
import androidx.compose.runtime.collectAsState
import com.qrdatmon.staff.ui.theme.Dimensions

@Composable
fun ProfileScreen(
    onLogout: () -> Unit,
    onNavigateToPersonalInfo: () -> Unit = {},
    onNavigateToAttendanceHistory: () -> Unit = {},
    onNavigateToSettings: () -> Unit = {},
    authManager: com.qrdatmon.core.common.auth.AuthManager,
    viewModel: AttendanceViewModel
) {
    var showCheckInDialog by remember { mutableStateOf(false) }
    var showCheckOutDialog by remember { mutableStateOf(false) }
    var selectedShiftType by remember { mutableStateOf("morning") }
    var showShiftTypeDialog by remember { mutableStateOf(false) }
    
    val attendanceState by viewModel.attendanceState.collectAsState()
    val uiState by viewModel.uiState.collectAsState()
    
    // Get user info from AuthManager
    val userName = authManager.getUserName() ?: "Nhân viên"
    val employeeCode = authManager.getEmployeeCode() ?: "N/A"
    val staffRole = when(authManager.getStaffRole()) {
        "waiter" -> "Nhân viên phục vụ"
        "cashier" -> "Thu ngân"
        "kitchen" -> "Bếp"
        "manager" -> "Quản lý"
        "admin" -> "Quản trị viên"
        else -> "Nhân viên"
    }
    val initials = userName.split(" ").takeLast(2).joinToString("") { it.first().toString() }.uppercase()
    
    // Handle UI state
    LaunchedEffect(uiState) {
        when (uiState) {
            is AttendanceUiState.Success -> {
                // Show success message if needed
                viewModel.resetUiState()
            }
            is AttendanceUiState.Error -> {
                // Show error message if needed
                viewModel.resetUiState()
            }
            else -> {}
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5))
            .padding(top = Dimensions.statusBarPadding)
    ) {
        // Profile Header
        item {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Color.White
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Avatar
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF4CAF50)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = initials,
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = userName,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF222222)
                    )

                    Text(
                        text = "Mã NV: $employeeCode",
                        fontSize = 14.sp,
                        color = Color(0xFF666666),
                        modifier = Modifier.padding(top = 4.dp)
                    )

                    Box(
                        modifier = Modifier
                            .padding(top = 8.dp)
                            .background(
                                color = Color(0xFFE8F5E9),
                                shape = RoundedCornerShape(999.dp)
                            )
                            .padding(horizontal = 12.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = staffRole,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF4CAF50)
                        )
                    }
                }
            }
        }

        item { Spacer(modifier = Modifier.height(16.dp)) }

        // Check In/Out Section
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
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
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Chấm công",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF222222)
                        )

                        if (attendanceState.isCheckedIn) {
                            Box(
                                modifier = Modifier
                                    .background(
                                        color = Color(0xFFE8F5E9),
                                        shape = RoundedCornerShape(999.dp)
                                    )
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = "Đang làm việc",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF4CAF50)
                                )
                            }
                        }
                    }

                    if (attendanceState.checkInTime != null) {
                        Text(
                            text = "Giờ vào: ${attendanceState.checkInTime}",
                            fontSize = 14.sp,
                            color = Color(0xFF666666),
                            modifier = Modifier.padding(top = 8.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        if (!attendanceState.isCheckedIn) {
                            Button(
                                onClick = { showShiftTypeDialog = true },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color(0xFF4CAF50)
                                ),
                                enabled = !attendanceState.isLoading
                            ) {
                                if (attendanceState.isLoading) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(18.dp),
                                        color = Color.White,
                                        strokeWidth = 2.dp
                                    )
                                } else {
                                    Icon(
                                        imageVector = Icons.Default.Login,
                                        contentDescription = null,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Chấm công vào")
                                }
                            }
                        } else {
                            Button(
                                onClick = { showCheckOutDialog = true },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color(0xFFFF9800)
                                ),
                                enabled = !attendanceState.isLoading
                            ) {
                                if (attendanceState.isLoading) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(18.dp),
                                        color = Color.White,
                                        strokeWidth = 2.dp
                                    )
                                } else {
                                    Icon(
                                        imageVector = Icons.Default.Logout,
                                        contentDescription = null,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Chấm công ra")
                                }
                            }
                        }
                    }
                }
            }
        }

        item { Spacer(modifier = Modifier.height(16.dp)) }

        // Menu Items
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = Color.White
                ),
                elevation = CardDefaults.cardElevation(
                    defaultElevation = 2.dp
                )
            ) {
                Column {
                    ProfileMenuItem(
                        icon = Icons.Default.Person,
                        title = "Thông tin cá nhân",
                        onClick = onNavigateToPersonalInfo
                    )
                    Divider()
                    ProfileMenuItem(
                        icon = Icons.Default.Schedule,
                        title = "Lịch sử chấm công",
                        onClick = onNavigateToAttendanceHistory
                    )
                    Divider()
                    ProfileMenuItem(
                        icon = Icons.Default.Settings,
                        title = "Cài đặt",
                        onClick = onNavigateToSettings
                    )
                }
            }
        }

        item { Spacer(modifier = Modifier.height(16.dp)) }

        // Logout Button
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .clickable { onLogout() },
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = Color.White
                ),
                elevation = CardDefaults.cardElevation(
                    defaultElevation = 2.dp
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Logout,
                        contentDescription = null,
                        tint = Color(0xFFD32F2F)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Đăng xuất",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFFD32F2F)
                    )
                }
            }
        }

        item { Spacer(modifier = Modifier.height(32.dp)) }
    }

    // Shift Type Selection Dialog
    if (showShiftTypeDialog) {
        AlertDialog(
            onDismissRequest = { showShiftTypeDialog = false },
            title = { Text("Chọn ca làm việc") },
            text = {
                Column {
                    ShiftTypeOption("Ca sáng", "morning", selectedShiftType) {
                        selectedShiftType = it
                    }
                    ShiftTypeOption("Ca chiều", "afternoon", selectedShiftType) {
                        selectedShiftType = it
                    }
                    ShiftTypeOption("Ca tối", "evening", selectedShiftType) {
                        selectedShiftType = it
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showShiftTypeDialog = false
                        showCheckInDialog = true
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF4CAF50)
                    )
                ) {
                    Text("Tiếp tục")
                }
            },
            dismissButton = {
                TextButton(onClick = { showShiftTypeDialog = false }) {
                    Text("Hủy")
                }
            }
        )
    }

    // Check In Dialog
    if (showCheckInDialog) {
        val shiftTypeName = when(selectedShiftType) {
            "morning" -> "ca sáng"
            "afternoon" -> "ca chiều"
            "evening" -> "ca tối"
            else -> "ca làm việc"
        }
        
        AlertDialog(
            onDismissRequest = { showCheckInDialog = false },
            title = { Text("Xác nhận chấm công vào") },
            text = { 
                Text("Bạn có chắc chắn muốn chấm công vào $shiftTypeName?")
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.clockIn(selectedShiftType)
                        showCheckInDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF4CAF50)
                    )
                ) {
                    Text("Xác nhận")
                }
            },
            dismissButton = {
                TextButton(onClick = { showCheckInDialog = false }) {
                    Text("Hủy")
                }
            }
        )
    }

    // Check Out Dialog
    if (showCheckOutDialog) {
        AlertDialog(
            onDismissRequest = { showCheckOutDialog = false },
            title = { Text("Xác nhận chấm công ra") },
            text = { 
                Text("Bạn có chắc chắn muốn chấm công ra và kết thúc ca làm việc?")
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.clockOut()
                        showCheckOutDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFFF9800)
                    )
                ) {
                    Text("Xác nhận")
                }
            },
            dismissButton = {
                TextButton(onClick = { showCheckOutDialog = false }) {
                    Text("Hủy")
                }
            }
        )
    }
}

@Composable
private fun ShiftTypeOption(
    label: String,
    value: String,
    selectedValue: String,
    onSelect: (String) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onSelect(value) }
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        RadioButton(
            selected = selectedValue == value,
            onClick = { onSelect(value) },
            colors = RadioButtonDefaults.colors(
                selectedColor = Color(0xFF4CAF50)
            )
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(text = label, fontSize = 16.sp)
    }
}

@Composable
private fun ProfileMenuItem(
    icon: ImageVector,
    title: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = Color(0xFF4CAF50)
            )
            Text(
                text = title,
                fontSize = 16.sp,
                color = Color(0xFF222222)
            )
        }
        Icon(
            imageVector = Icons.Default.ChevronRight,
            contentDescription = null,
            tint = Color(0xFF999999)
        )
    }
}
