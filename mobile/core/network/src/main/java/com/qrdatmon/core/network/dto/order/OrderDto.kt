package com.qrdatmon.core.network.dto.order

import kotlinx.serialization.Serializable

@Serializable
data class OrderResponse(
    val id: String,
    val billId: String,
    val userId: String,
    val orderNumber: String,
    val status: String,
    val totalAmount: Double,
    val note: String? = null,
    val items: List<OrderItemResponse> = emptyList(),
    val createdAt: String,
    val confirmedAt: String? = null,
    val cancelledAt: String? = null,
    val cancelReason: String? = null
)

@Serializable
data class OrderItemResponse(
    val id: String,
    val menuItemId: String,
    val menuItemName: String,
    val menuItemImage: String? = null,
    val quantity: Int,
    val unitPrice: Double,
    val subtotal: Double,
    val note: String? = null,
    val status: String,
    val toppings: List<OrderToppingResponse> = emptyList(),
    val startedAt: String? = null,
    val completedAt: String? = null,
    val servedAt: String? = null
)

@Serializable
data class OrderToppingResponse(
    val id: String,
    val toppingId: String,
    val name: String,
    val quantity: Int = 1,
    val price: Double
)

@Serializable
data class CreateOrderRequest(
    val tableId: String,
    val note: String? = null
)
