package com.qrdatmon.customer.ui.theme

import androidx.compose.ui.unit.dp

/**
 * Centralized dimension values for consistent spacing across the app
 */
object Dimensions {
    // Status Bar & System UI Padding
    val statusBarPadding = 40.dp  // Padding for top of screen to avoid status bar overlap
    
    // Bottom Navigation
    val bottomNavHeight = 74.dp  // Total height including padding
    val bottomNavPadding = 8.dp
    val bottomNavInternalHeight = 58.dp
    
    // Screen Padding
    val screenHorizontalPadding = 16.dp
    val screenVerticalPadding = 10.dp
    
    // Content Padding (for screens with bottom navigation)
    val contentBottomPadding = 140.dp  // Space for bottom nav + order bar
    val contentBottomPaddingSimple = 90.dp  // Space for bottom nav only
}
