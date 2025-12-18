package com.qrdatmon.core.network.dto.promotion

import kotlinx.serialization.Serializable

@Serializable
data class PromotionResponse(
    val id: String,
    val code: String,
    val name: String,
    val description: String? = null,
    val discountType: String, // "percentage" or "fixed"
    val discountValue: Double,
    val minOrderAmount: Double = 0.0,
    val maxDiscount: Double? = null,
    val startDate: String,
    val endDate: String,
    val usageLimit: Int? = null,
    val usageCount: Int = 0,
    val isActive: Boolean = true,
    val applicableFor: String? = null, // "all", "dine_in", "takeaway"
    val createdAt: String? = null,
    val updatedAt: String? = null
)

@Serializable
data class VoucherValidationResponse(
    val valid: Boolean,
    val message: String? = null,
    val discount: Double? = null
)
