package com.qrdatmon.core.network.dto.order

import kotlinx.serialization.Serializable

// For getOrders (paginated): data is { orders: [...], pagination: {...} }
// For getOrdersByBill: data is { orders: [...] }

@Serializable
data class OrderListWrapper(
    val orders: List<OrderResponse>
)

// For paginated responses (getOrders) - same structure as OrderListWrapper
@Serializable
data class OrderListResponse(
    val orders: List<OrderResponse>,
    val pagination: PaginationInfo? = null
)

@Serializable
data class PaginationInfo(
    val page: Int = 1,
    val limit: Int = 20,
    val total: Int = 0,
    val pages: Int = 0
)
