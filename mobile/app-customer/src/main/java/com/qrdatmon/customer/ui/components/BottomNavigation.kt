package com.qrdatmon.customer.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun AppBottomNavigation(
    modifier: Modifier = Modifier,
    selectedTab: String,
    onMenuClick: () -> Unit,
    onCartClick: () -> Unit,
    onOrderStatusClick: () -> Unit
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 8.dp)
            .height(58.dp)
            .background(Color(0xFFF5F5F5), RoundedCornerShape(999.dp))
            .padding(horizontal = 4.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Menu Tab
        val menuBgColor by animateColorAsState(
            targetValue = if (selectedTab == "menu") Color.White else Color.Transparent,
            animationSpec = tween(durationMillis = 300),
            label = "menuBgColor"
        )
        val menuIconColor by animateColorAsState(
            targetValue = if (selectedTab == "menu") Color(0xFFFF6F3C) else Color(0xFF666666),
            animationSpec = tween(durationMillis = 300),
            label = "menuIconColor"
        )

        Column(
            modifier = Modifier
                .background(color = menuBgColor, shape = RoundedCornerShape(999.dp))
                .clickable { onMenuClick() }
                .padding(horizontal = 16.dp, vertical = 6.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Icon(
                imageVector = Icons.Outlined.Restaurant,
                contentDescription = "Menu",
                tint = menuIconColor,
                modifier = Modifier.size(18.dp)
            )
            Text(
                text = "Menu",
                fontSize = 11.sp,
                fontWeight = if (selectedTab == "menu") FontWeight.SemiBold else FontWeight.Medium,
                color = menuIconColor
            )
        }

        // Cart Tab
        val cartBgColor by animateColorAsState(
            targetValue = if (selectedTab == "cart") Color.White else Color.Transparent,
            animationSpec = tween(durationMillis = 300),
            label = "cartBgColor"
        )
        val cartIconColor by animateColorAsState(
            targetValue = if (selectedTab == "cart") Color(0xFFFF6F3C) else Color(0xFF666666),
            animationSpec = tween(durationMillis = 300),
            label = "cartIconColor"
        )

        Column(
            modifier = Modifier
                .background(color = cartBgColor, shape = RoundedCornerShape(999.dp))
                .clickable { onCartClick() }
                .padding(horizontal = 16.dp, vertical = 6.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Icon(
                imageVector = Icons.Outlined.ShoppingBag,
                contentDescription = "Giỏ hàng",
                tint = cartIconColor,
                modifier = Modifier.size(18.dp)
            )
            Text(
                text = "Giỏ hàng",
                fontSize = 11.sp,
                fontWeight = if (selectedTab == "cart") FontWeight.SemiBold else FontWeight.Medium,
                color = cartIconColor
            )
        }

        // Order Status Tab
        val statusBgColor by animateColorAsState(
            targetValue = if (selectedTab == "status") Color.White else Color.Transparent,
            animationSpec = tween(durationMillis = 300),
            label = "statusBgColor"
        )
        val statusIconColor by animateColorAsState(
            targetValue = if (selectedTab == "status") Color(0xFFFF6F3C) else Color(0xFF666666),
            animationSpec = tween(durationMillis = 300),
            label = "statusIconColor"
        )

        Column(
            modifier = Modifier
                .background(color = statusBgColor, shape = RoundedCornerShape(999.dp))
                .clickable { onOrderStatusClick() }
                .padding(horizontal = 16.dp, vertical = 6.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Icon(
                imageVector = Icons.Outlined.Receipt,
                contentDescription = "Trạng thái",
                tint = statusIconColor,
                modifier = Modifier.size(18.dp)
            )
            Text(
                text = "Trạng thái",
                fontSize = 11.sp,
                fontWeight = if (selectedTab == "status") FontWeight.SemiBold else FontWeight.Medium,
                color = statusIconColor
            )
        }
    }
}
