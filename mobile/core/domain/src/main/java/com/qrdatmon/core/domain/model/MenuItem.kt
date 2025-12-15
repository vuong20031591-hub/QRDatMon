package com.qrdatmon.core.domain.model

data class MenuItem(
    val id: String,
    val categoryId: String,
    val name: String,
    val description: String?,
    val imageUrl: String?,
    val price: Double,
    val unit: String = "phần",
    val status: String = "available",
    val isPopular: Boolean = false,
    val isNew: Boolean = false,
    val preparationTime: Int = 15,
    val toppingGroups: List<ToppingGroup> = emptyList()
)

data class ToppingGroup(
    val id: String,
    val name: String,
    val isRequired: Boolean = false,
    val minSelect: Int = 0,
    val maxSelect: Int = 1,
    val toppings: List<Topping> = emptyList()
)

data class Topping(
    val id: String,
    val name: String,
    val extraPrice: Double = 0.0,
    val isDefault: Boolean = false,
    val isAvailable: Boolean = true
)
