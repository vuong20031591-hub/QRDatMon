package com.qrdatmon.core.domain.model

data class MenuItem(
    val id: String,
    val name: String,
    val description: String,
    val price: Double,
    val imageUrl: String?,
    val category: String,
    val isAvailable: Boolean,
    val preparationTime: Int,
    val toppings: List<Topping> = emptyList()
)

data class Topping(
    val id: String,
    val name: String,
    val price: Double
)
