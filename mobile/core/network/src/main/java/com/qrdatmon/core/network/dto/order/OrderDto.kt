package com.qrdatmon.core.network.dto.order

import kotlinx.serialization.Serializable

@Serializable
data class OrderResponse(
    val id: String,
    val orderNumber: String,
    val status: String,
    val totalAmount: Double,
    val note: String? = null,
    val user: UserInfo? = null,
    val bill: BillInfo? = null,
    val confirmedBy: StaffInfo? = null,
    val cancelledBy: StaffInfo? = null,
    val items: List<OrderItemResponse> = emptyList(),
    val createdAt: String,
    val updatedAt: String,
    val confirmedAt: String? = null,
    val completedAt: String? = null,
    val cancelledAt: String? = null,
    val cancelReason: String? = null
)

@Serializable
data class UserInfo(
    val id: String,
    val name: String? = null,
    val email: String? = null
)

@Serializable
data class BillInfo(
    val id: String,
    val billNumber: String? = null,
    val tableNumber: String? = null
)

@Serializable
data class StaffInfo(
    val id: String,
    val name: String? = null
)

@Serializable
data class OrderItemResponse(
    val id: String,
    val menuItem: MenuItemInfo? = null,
    val combo: ComboInfo? = null,
    val itemName: String,
    val quantity: Int,
    val unitPrice: Double,
    val subtotal: Double,
    val note: String? = null,
    val status: String,
    val toppings: List<OrderToppingResponse> = emptyList(),
    val priority: Int = 0,
    val startedAt: String? = null,
    val completedAt: String? = null,
    val servedAt: String? = null,
    val cancelledAt: String? = null,
    val cancelReason: String? = null
)

@Serializable
data class MenuItemInfo(
    val id: String,
    val name: String,
    val imageUrl: String? = null
)

@Serializable
data class ComboInfo(
    val id: String,
    val name: String,
    val imageUrl: String? = null
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

@Serializable
data class CancelOrderRequest(
    val reason: String
)

@Serializable
data class OrderDetailWrapper(
    val order: OrderResponse
)
