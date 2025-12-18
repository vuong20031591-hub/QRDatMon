package com.qrdatmon.core.domain.model

data class Order(
    val id: String,
    val billId: String,
    val userId: String,
    val orderNumber: String,
    val status: String,
    val totalAmount: Double,
    val note: String? = null,
    val items: List<OrderItem> = emptyList(),
    val createdAt: String,
    val confirmedAt: String? = null,
    val cancelledAt: String? = null,
    val cancelReason: String? = null
)

data class OrderItem(
    val id: String,
    val menuItemId: String,
    val menuItemName: String,
    val menuItemImage: String? = null,
    val quantity: Int,
    val unitPrice: Double,
    val subtotal: Double,
    val note: String? = null,
    val status: String,
    val toppings: List<OrderTopping> = emptyList(),
    val startedAt: String? = null,
    val completedAt: String? = null,
    val servedAt: String? = null
)

data class OrderTopping(
    val id: String,
    val toppingId: String,
    val name: String,
    val quantity: Int = 1,
    val price: Double
)
