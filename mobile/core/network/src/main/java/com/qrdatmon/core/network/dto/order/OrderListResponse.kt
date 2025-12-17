package com.qrdatmon.core.network.dto.order

import kotlinx.serialization.Serializable

@Serializable
data class OrderListResponse(
    val orders: List<OrderResponse>
)
