package com.qrdatmon.customer.ui.qr

import android.annotation.SuppressLint
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner as ComposeLocalLifecycleOwner
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import timber.log.Timber
import java.util.concurrent.Executors

/**
 * Camera Preview with ML Kit Barcode Scanner
 * Requirements: 2.1, 2.2
 */
@SuppressLint("UnsafeOptInUsageError")
@Composable
fun CameraPreviewWithScanner(
    onQrCodeDetected: (String) -> Unit,
    isScanning: Boolean = true
) {
    val context = LocalContext.current
    val lifecycleOwner = ComposeLocalLifecycleOwner.current
    val cameraProviderFuture = remember { ProcessCameraProvider.getInstance(context) }
    
    var isCameraReady by remember { mutableStateOf(false) }
    var lastScannedCode by remember { mutableStateOf<String?>(null) }
    var lastScanTime by remember { mutableStateOf(0L) }
    
    // Debounce time to prevent multiple scans (1 second)
    val scanDebounceMs = 1000L
    
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(240.dp)
            .clip(RoundedCornerShape(24.dp))
    ) {
        // Camera Preview
        AndroidView(
            factory = { ctx ->
                val previewView = PreviewView(ctx)
                val executor = ContextCompat.getMainExecutor(ctx)
                
                cameraProviderFuture.addListener({
                    val cameraProvider = cameraProviderFuture.get()
                    
                    // Preview use case
                    val preview = Preview.Builder().build().also {
                        it.setSurfaceProvider(previewView.surfaceProvider)
                    }
                    
                    // Image analysis use case for ML Kit
                    val imageAnalysis = ImageAnalysis.Builder()
                        .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                        .build()
                    
                    // ML Kit Barcode Scanner
                    val barcodeScanner = BarcodeScanning.getClient()
                    
                    imageAnalysis.setAnalyzer(Executors.newSingleThreadExecutor()) { imageProxy ->
                        val mediaImage = imageProxy.image
                        if (mediaImage != null && isScanning) {
                            val image = InputImage.fromMediaImage(
                                mediaImage,
                                imageProxy.imageInfo.rotationDegrees
                            )
                            
                            barcodeScanner.process(image)
                                .addOnSuccessListener { barcodes ->
                                    for (barcode in barcodes) {
                                        when (barcode.valueType) {
                                            Barcode.TYPE_URL, Barcode.TYPE_TEXT -> {
                                                val rawValue = barcode.rawValue
                                                if (rawValue != null) {
                                                    val currentTime = System.currentTimeMillis()
                                                    
                                                    // Debounce: only process if different code or enough time passed
                                                    if (rawValue != lastScannedCode || 
                                                        currentTime - lastScanTime > scanDebounceMs) {
                                                        
                                                        Timber.d("QR Code scanned: $rawValue")
                                                        lastScannedCode = rawValue
                                                        lastScanTime = currentTime
                                                        
                                                        // Notify callback
                                                        onQrCodeDetected(rawValue)
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                .addOnFailureListener { e ->
                                    Timber.e(e, "Barcode scanning failed")
                                }
                                .addOnCompleteListener {
                                    imageProxy.close()
                                }
                        } else {
                            imageProxy.close()
                        }
                    }
                    
                    // Camera selector (back camera)
                    val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
                    
                    try {
                        // Unbind all use cases before rebinding
                        cameraProvider.unbindAll()
                        
                        // Bind use cases to camera
                        cameraProvider.bindToLifecycle(
                            lifecycleOwner,
                            cameraSelector,
                            preview,
                            imageAnalysis
                        )
                        
                        isCameraReady = true
                        Timber.d("Camera initialized successfully")
                    } catch (e: Exception) {
                        Timber.e(e, "Camera initialization failed")
                    }
                }, executor)
                
                previewView
            },
            modifier = Modifier
                .fillMaxSize()
                .clip(RoundedCornerShape(24.dp))
        )
        
        // Overlay UI
        Box(
            modifier = Modifier.fillMaxSize()
        ) {
            // Top status bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(13.dp)
                    .align(Alignment.TopCenter),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Camera status
                Row(
                    modifier = Modifier
                        .background(Color(0x85000000), RoundedCornerShape(999.dp))
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .background(
                                if (isCameraReady) Color(0xFF22C55E) else Color(0xFFFFAA00),
                                CircleShape
                            )
                    )
                    Text(
                        text = if (isCameraReady) "Camera sẵn sàng" else "Đang mở camera...",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFFF9FAFB)
                    )
                }
            }
            
            // Scanning frame
            Box(
                modifier = Modifier
                    .size(207.dp)
                    .align(Alignment.Center)
                    .border(
                        width = 1.dp,
                        color = Color(0x42FFFFFF),
                        shape = RoundedCornerShape(24.dp)
                    )
                    .padding(1.dp),
                contentAlignment = Alignment.Center
            ) {
                // Corner borders
                // Top-left
                Box(
                    modifier = Modifier
                        .size(26.dp)
                        .align(Alignment.TopStart)
                        .offset((-1).dp, (-1).dp)
                        .border(
                            width = 3.dp,
                            color = if (isScanning) Color.White else Color(0x80FFFFFF),
                            shape = RoundedCornerShape(topStart = 10.dp)
                        )
                )
                // Top-right
                Box(
                    modifier = Modifier
                        .size(26.dp)
                        .align(Alignment.TopEnd)
                        .offset(1.dp, (-1).dp)
                        .border(
                            width = 3.dp,
                            color = if (isScanning) Color.White else Color(0x80FFFFFF),
                            shape = RoundedCornerShape(topEnd = 10.dp)
                        )
                )
                // Bottom-left
                Box(
                    modifier = Modifier
                        .size(26.dp)
                        .align(Alignment.BottomStart)
                        .offset((-1).dp, 1.dp)
                        .border(
                            width = 3.dp,
                            color = if (isScanning) Color.White else Color(0x80FFFFFF),
                            shape = RoundedCornerShape(bottomStart = 10.dp)
                        )
                )
                // Bottom-right
                Box(
                    modifier = Modifier
                        .size(26.dp)
                        .align(Alignment.BottomEnd)
                        .offset(1.dp, 1.dp)
                        .border(
                            width = 3.dp,
                            color = if (isScanning) Color.White else Color(0x80FFFFFF),
                            shape = RoundedCornerShape(bottomEnd = 10.dp)
                        )
                )
                
                // Center dot
                Box(
                    modifier = Modifier
                        .size(6.dp)
                        .background(Color(0xE6FFFFFF), CircleShape)
                )
            }
            
            // Bottom instruction
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(13.dp)
                    .align(Alignment.BottomCenter),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .background(Color(0x8C000000), RoundedCornerShape(999.dp))
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = if (isScanning) 
                            "Đưa mã QR vào trong khung để quét" 
                        else 
                            "Đang xử lý...",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFFE5E7EB)
                    )
                }
            }
        }
    }
}
