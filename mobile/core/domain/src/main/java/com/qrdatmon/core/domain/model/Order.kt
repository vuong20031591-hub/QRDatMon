package com.qrdatmon.core.domain.model

import java.time.LocalDateTime

data class Order(
    val id: String,
    val tableId: String,
    val items: List<OrderItem>,
    val status: OrderStatus,
    val totalAmount: Double,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val notes: String? = null
)

data class OrderItem(
    val menuItemId: String,
    val menuItemName: String,
    val quantity: Int,
    val price: Double,
    val toppings: List<Topping> = emptyList(),
    val notes: String? = null
)

enum class OrderStatus {
    PENDING,
    CONFIRMED,
    PREPARING,
    READY,
    SERVED,
    CANCELLED
}
