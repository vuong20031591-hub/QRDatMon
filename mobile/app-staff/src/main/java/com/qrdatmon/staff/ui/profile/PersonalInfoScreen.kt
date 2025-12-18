package com.qrdatmon.staff.ui.profile

import androidx.compose.foundation.background
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PersonalInfoScreen(
    onBackClick: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Thông tin cá nhân",
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
            // Avatar Section
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color.White
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(100.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF4CAF50)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "NV",
                                fontSize = 40.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        TextButton(onClick = { /* TODO: Change avatar */ }) {
                            Text(
                                text = "Thay đổi ảnh đại diện",
                                color = Color(0xFF4CAF50)
                            )
                        }
                    }
                }
            }

            // Personal Information
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
                            text = "Thông tin cơ bản",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF222222)
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        InfoRow(
                            icon = Icons.Default.Badge,
                            label = "Mã nhân viên",
                            value = "NV001"
                        )
                        
                        Divider(modifier = Modifier.padding(vertical = 12.dp))
                        
                        InfoRow(
                            icon = Icons.Default.Person,
                            label = "Họ và tên",
                            value = "Nguyễn Văn A"
                        )
                        
                        Divider(modifier = Modifier.padding(vertical = 12.dp))
                        
                        InfoRow(
                            icon = Icons.Default.Phone,
                            label = "Số điện thoại",
                            value = "0901234567"
                        )
                        
                        Divider(modifier = Modifier.padding(vertical = 12.dp))
                        
                        InfoRow(
                            icon = Icons.Default.Email,
                            label = "Email",
                            value = "nguyenvana@qrdatmon.com"
                        )
                        
                        Divider(modifier = Modifier.padding(vertical = 12.dp))
                        
                        InfoRow(
                            icon = Icons.Default.Cake,
                            label = "Ngày sinh",
                            value = "15/03/1995"
                        )
                        
                        Divider(modifier = Modifier.padding(vertical = 12.dp))
                        
                        InfoRow(
                            icon = Icons.Default.Wc,
                            label = "Giới tính",
                            value = "Nam"
                        )
                    }
                }
            }

            // Work Information
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
                            text = "Thông tin công việc",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF222222)
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        InfoRow(
                            icon = Icons.Default.Work,
                            label = "Chức vụ",
                            value = "Nhân viên phục vụ"
                        )
                        
                        Divider(modifier = Modifier.padding(vertical = 12.dp))
                        
                        InfoRow(
                            icon = Icons.Default.CalendarToday,
                            label = "Ngày vào làm",
                            value = "01/01/2024"
                        )
                        
                        Divider(modifier = Modifier.padding(vertical = 12.dp))
                        
                        InfoRow(
                            icon = Icons.Default.Schedule,
                            label = "Ca làm việc",
                            value = "Ca sáng (8:00 - 16:00)"
                        )
                    }
                }
            }

            item { Spacer(modifier = Modifier.height(16.dp)) }
        }
    }
}

@Composable
private fun InfoRow(
    icon: ImageVector,
    label: String,
    value: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = Color(0xFF4CAF50),
            modifier = Modifier.size(20.dp)
        )
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = label,
                fontSize = 12.sp,
                color = Color(0xFF999999)
            )
            Text(
                text = value,
                fontSize = 15.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF222222),
                modifier = Modifier.padding(top = 4.dp)
            )
        }
    }
}
