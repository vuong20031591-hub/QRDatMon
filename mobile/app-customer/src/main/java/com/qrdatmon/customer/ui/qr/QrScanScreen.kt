package com.qrdatmon.customer.ui.qr

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import timber.log.Timber

/**
 * QR Scan Screen với ML Kit integration và Deep Link support
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.4, 7.3, 7.4
 */
@Composable
fun QrScanScreen(
    onBackClick: () -> Unit,
    onManualInputClick: () -> Unit,
    onQrScanned: (String) -> Unit,
    deepLinkQrToken: String? = null,
    viewModel: QrScanViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
        )
    }
    
    // Camera permission launcher
    val cameraPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
        if (!isGranted) {
            viewModel.clearError()
            // Show error about camera permission
            Timber.w("Camera permission denied")
        }
    }
    
    // Request camera permission on first launch
    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
        // Reset state when screen opens (clear errors, dialogs, etc.)
        // But keep sessionInfo to enable table transfer
        viewModel.clearError()
        viewModel.cancelConfirmation()
        viewModel.cancelTransfer()
    }
    
    // Auto-trigger join from deep link
    // Requirements: 3.4, 7.3, 7.4
    LaunchedEffect(deepLinkQrToken) {
        if (deepLinkQrToken != null && deepLinkQrToken.isNotEmpty()) {
            Timber.d("Auto-triggering join from deep link: $deepLinkQrToken")
            viewModel.joinTable(deepLinkQrToken)
        }
    }
    
    // Handle QR code scan
    val onQrCodeDetected: (String) -> Unit = { qrContent ->
        Timber.d("QR Code detected: $qrContent")
        
        // Parse Universal Link to extract qrToken
        val qrToken = viewModel.parseUniversalLink(qrContent)
        
        if (qrToken != null) {
            // Valid QR token - handle (join or transfer)
            viewModel.handleQrCodeDetected(qrToken)
        } else {
            // Invalid QR format
            Timber.w("Invalid QR format: $qrContent")
        }
    }
    
    // Navigate to menu when join/transfer successful
    LaunchedEffect(uiState.shouldNavigateToMenu) {
        if (uiState.shouldNavigateToMenu && uiState.sessionInfo != null) {
            Timber.d("Navigating to menu: ${uiState.sessionInfo!!.tableNumber}")
            viewModel.clearNavigationFlag()  // Clear flag before navigating
            onQrScanned(uiState.sessionInfo!!.tableNumber)
        }
    }

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
                    radius = 1200f
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
                QrScanHeader(onBackClick = onBackClick)

                Spacer(modifier = Modifier.height(16.dp))

                // App Branding
                QrAppBranding()

                Spacer(modifier = Modifier.height(16.dp))

                // Title and Description
                QrScanTitle()

                Spacer(modifier = Modifier.height(16.dp))

                // QR Scanner View with Camera
                if (hasCameraPermission) {
                    CameraPreviewWithScanner(
                        onQrCodeDetected = onQrCodeDetected,
                        isScanning = !uiState.isJoining && !uiState.needsConfirmation
                    )
                } else {
                    // Show permission required message
                    QrScannerPermissionRequired(
                        onRequestPermission = {
                            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
                        }
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Instructions
                QrScanInstructions()

                Spacer(modifier = Modifier.height(8.dp))

                // Connection Status
                if (uiState.isJoining) {
                    ConnectionStatus(isConnecting = true)
                    Spacer(modifier = Modifier.height(18.dp))
                }

                // Manual Input Button
                Button(
                    onClick = onManualInputClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(24.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFFF6F3C)
                    ),
                    enabled = !uiState.isJoining
                ) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(16.dp)
                                .border(2.dp, Color.White, RoundedCornerShape(4.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Box(
                                modifier = Modifier
                                    .width(8.dp)
                                    .height(2.dp)
                                    .background(Color.White, RoundedCornerShape(999.dp))
                            )
                        }
                        Text(
                            text = "Nhập mã bàn",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color.White
                        )
                    }
                }
            }

            // Terms
            Text(
                text = "Bằng việc tiếp tục, bạn đồng ý với việc nhà hàng ghi nhận order cho đúng bàn và thời gian hiện tại.",
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
        
        // Confirmation Dialog
        if (uiState.needsConfirmation) {
            JoinConfirmationDialog(
                existingUsers = uiState.existingUsers,
                sessionAge = uiState.sessionAge,
                onConfirm = {
                    viewModel.confirmJoin()
                },
                onDismiss = {
                    viewModel.cancelConfirmation()
                }
            )
        }
        
        // Table Transfer Dialog
        if (uiState.needsTransferConfirmation && uiState.sessionInfo != null) {
            TableTransferDialog(
                currentTableNumber = uiState.sessionInfo!!.tableNumber,
                newTableNumber = uiState.pendingTransferTableNumber ?: "",
                isTransferring = uiState.isTransferring,
                onConfirm = {
                    viewModel.confirmTransferTable()
                },
                onDismiss = {
                    viewModel.cancelTransfer()
                }
            )
        }
        
        // Error Dialog
        if (uiState.error != null) {
            ErrorDialog(
                error = uiState.error!!,
                onDismiss = {
                    viewModel.clearError()
                },
                onRetry = {
                    viewModel.clearError()
                }
            )
        }
    }
}

@Composable
private fun QrScanHeader(onBackClick: () -> Unit) {
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
            text = "Quét QR bàn",
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF222222)
        )
    }
}

@Composable
private fun QrAppBranding() {
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
            Image(
                painter = painterResource(id = com.qrdatmon.customer.R.drawable.logo),
                contentDescription = "Logo",
                modifier = Modifier
                    .size(28.dp)
                    .clip(CircleShape),
                contentScale = ContentScale.Crop
            )
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
                text = "Gọi món nhanh, không cần chờ",
                fontSize = 12.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666)
            )
        }
    }
}

@Composable
private fun QrScanTitle() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Text(
            text = "Hãy quét QR trên bàn của bạn",
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF222222)
        )
        Text(
            text = "Kết nối vào đúng bàn để nhà hàng phục vụ chính xác món Ơn của bạn.",
            fontSize = 14.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF666666),
            lineHeight = 17.sp
        )
    }
}

@Composable
private fun QrScanInstructions() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Text(
            text = "Hãy quét QR trên bàn của bạn.",
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF222222)
        )
        Text(
            text = "Giữ máy ổn định và cách mã khoảng 10-15cm.",
            fontSize = 13.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF666666)
        )
        Text(
            text = "Nếu không quét được, bạn có thể nhập mã bàn thủ công bên dưới.",
            fontSize = 12.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF666666),
            lineHeight = 15.sp
        )
    }
}

/**
 * Camera permission required message
 * Requirements: 9.5
 */
@Composable
private fun QrScannerPermissionRequired(
    onRequestPermission: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(240.dp)
            .background(
                brush = Brush.linearGradient(
                    colors = listOf(
                        Color(0xFF111111),
                        Color(0xFF333333)
                    )
                ),
                shape = RoundedCornerShape(24.dp)
            )
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                painter = painterResource(id = android.R.drawable.ic_menu_camera),
                contentDescription = "Camera",
                tint = Color.White,
                modifier = Modifier.size(48.dp)
            )
            
            Text(
                text = "Cần quyền truy cập camera",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White,
                textAlign = TextAlign.Center
            )
            
            Text(
                text = "Để quét mã QR, ứng dụng cần quyền truy cập camera của bạn.",
                fontSize = 14.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFFCCCCCC),
                textAlign = TextAlign.Center
            )
            
            Button(
                onClick = onRequestPermission,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFFF6F3C)
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "Cấp quyền camera",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

@Composable
private fun ConnectionStatus(isConnecting: Boolean) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFFFE4D6), RoundedCornerShape(12.dp))
            .padding(horizontal = 10.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .background(Color(0xFFFF6F3C), CircleShape)
        )
        Column(
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Text(
                text = "Đang kết nối với bàn...",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFFFF6F3C)
            )
            Text(
                text = "Vui lòng giữ nguyên trong giây lát.",
                fontSize = 12.sp,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF666666)
            )
        }
    }
}
