package com.qrdatmon.core.network.dto.promotion

import kotlinx.serialization.Serializable

@Serializable
data class PromotionResponse(
    val id: String,
    val code: String,
    val name: String,
    val description: String? = null,
    val discountType: String, // "percent" or "fixed"
    val discountValue: Double,
    val minOrderAmount: Int = 0,
    val maxDiscount: Int? = null,
    val startDate: String,
    val endDate: String,
    val usageLimit: Int? = null,
    val usedCount: Int = 0,
    val usagePerUser: Int = 1,
    val isActive: Boolean = true,
    val createdAt: String? = null,
    val updatedAt: String? = null
)
