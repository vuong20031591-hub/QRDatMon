package com.qrdatmon.core.network.dto.order

import kotlinx.serialization.Serializable

// For getOrders (paginated): data is array directly
// For getOrdersByBill: data is { orders: [...] }
// We need to handle both cases

@Serializable
data class OrderListWrapper(
    val orders: List<OrderResponse>
)

// For paginated responses (getOrders)
typealias OrderListResponse = List<OrderResponse>
