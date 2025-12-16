package com.qrdatmon.staff.ui.main

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material.icons.filled.TableRestaurant
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Receipt
import androidx.compose.material.icons.outlined.TableRestaurant
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import com.qrdatmon.staff.ui.order.OrderListScreen
import com.qrdatmon.staff.ui.profile.ProfileScreen
import com.qrdatmon.staff.ui.table.TableListScreen

sealed class BottomNavItem(
    val route: String,
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
) {
    object Tables : BottomNavItem(
        route = "tables",
        title = "Bàn",
        selectedIcon = Icons.Filled.TableRestaurant,
        unselectedIcon = Icons.Outlined.TableRestaurant
    )
    
    object Orders : BottomNavItem(
        route = "orders",
        title = "Đơn hàng",
        selectedIcon = Icons.Filled.Receipt,
        unselectedIcon = Icons.Outlined.Receipt
    )
    
    object Profile : BottomNavItem(
        route = "profile",
        title = "Thông tin",
        selectedIcon = Icons.Filled.Person,
        unselectedIcon = Icons.Outlined.Person
    )
}

@Composable
fun MainScreen(
    onLogout: () -> Unit,
    onTableClick: (com.qrdatmon.staff.ui.table.Table) -> Unit = {},
    shouldSwitchToOrderTab: Boolean = false,
    onOrderTabSwitched: () -> Unit = {}
) {
    var selectedItem by remember { mutableStateOf(0) }
    val items = listOf(
        BottomNavItem.Tables,
        BottomNavItem.Orders,
        BottomNavItem.Profile
    )

    // Switch to order tab when requested
    LaunchedEffect(shouldSwitchToOrderTab) {
        if (shouldSwitchToOrderTab) {
            selectedItem = 1 // Switch to Orders tab
            onOrderTabSwitched()
        }
    }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = Color.White,
                contentColor = Color(0xFF4CAF50)
            ) {
                items.forEachIndexed { index, item ->
                    NavigationBarItem(
                        icon = {
                            Icon(
                                imageVector = if (selectedItem == index) 
                                    item.selectedIcon 
                                else 
                                    item.unselectedIcon,
                                contentDescription = item.title
                            )
                        },
                        label = { Text(item.title) },
                        selected = selectedItem == index,
                        onClick = { selectedItem = index },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color(0xFF4CAF50),
                            selectedTextColor = Color(0xFF4CAF50),
                            indicatorColor = Color(0xFFE8F5E9),
                            unselectedIconColor = Color(0xFF999999),
                            unselectedTextColor = Color(0xFF999999)
                        )
                    )
                }
            }
        }
    ) { paddingValues ->
        when (selectedItem) {
            0 -> TableListScreen(onTableClick = onTableClick)
            1 -> OrderListScreen()
            2 -> ProfileScreen(onLogout = onLogout)
        }
    }
}
