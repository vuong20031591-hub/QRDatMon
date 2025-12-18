package com.qrdatmon.core.network.dto.menu

import kotlinx.serialization.Serializable

@Serializable
data class CategoryResponse(
    val id: String,
    val name: String,
    val description: String? = null,
    val imageUrl: String? = null,
    val sortOrder: Int = 0,
    val isActive: Boolean = true
)

@Serializable
data class MenuItemResponse(
    val id: String,
    val name: String,
    val description: String? = null,
    val imageUrl: String? = null,
    val price: Double,
    val costPrice: Double = 0.0,
    val unit: String = "phần",
    val status: String = "available",
    val isPopular: Boolean = false,
    val isNew: Boolean = false,
    val preparationTime: Int = 15,
    val sortOrder: Int = 0,
    val category: MenuCategoryInfo? = null,
    val toppingGroups: List<ToppingGroupResponse> = emptyList(),
    val createdAt: String? = null,
    val updatedAt: String? = null
)

@Serializable
data class MenuCategoryInfo(
    val id: String,
    val name: String? = null
)

@Serializable
data class ToppingGroupResponse(
    val id: String,
    val name: String,
    val isRequired: Boolean = false,
    val minSelect: Int = 0,
    val maxSelect: Int = 1,
    val sortOrder: Int = 0,
    val toppings: List<ToppingResponse> = emptyList()
)

@Serializable
data class ToppingResponse(
    val id: String,
    val name: String,
    val extraPrice: Double = 0.0,
    val isDefault: Boolean = false,
    val isAvailable: Boolean = true,
    val sortOrder: Int = 0
)
