package com.qrdatmon.core.network.dto.cart

import kotlinx.serialization.Serializable

@Serializable
data class CartResponse(
    val id: String,
    val userId: String,
    val tableId: String,
    val items: List<CartItemResponse> = emptyList(),
    val totalAmount: Double = 0.0,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class CartItemResponse(
    val id: String,
    val menuItemId: String,
    val menuItemName: String,
    val menuItemImage: String? = null,
    val quantity: Int,
    val unitPrice: Double,
    val subtotal: Double,
    val note: String? = null,
    val toppings: List<CartToppingResponse> = emptyList()
)

@Serializable
data class CartToppingResponse(
    val id: String,
    val toppingId: String,
    val name: String,
    val quantity: Int = 1,
    val price: Double
)

@Serializable
data class AddToCartRequest(
    val tableId: String,
    val menuItemId: String,
    val quantity: Int = 1,
    val note: String? = null,
    val toppings: List<CartToppingRequest> = emptyList()
)

@Serializable
data class CartToppingRequest(
    val toppingId: String,
    val quantity: Int = 1
)

@Serializable
data class UpdateCartItemRequest(
    val quantity: Int,
    val note: String? = null,
    val toppings: List<CartToppingRequest> = emptyList()
)
