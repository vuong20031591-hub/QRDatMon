package com.qrdatmon.customer.data

import com.qrdatmon.core.network.dto.promotion.PromotionResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Singleton để quản lý promotion đã chọn
 */
object PromotionManager {
    private val _selectedPromotion = MutableStateFlow<PromotionResponse?>(null)
    val selectedPromotion: StateFlow<PromotionResponse?> = _selectedPromotion.asStateFlow()

    fun selectPromotion(promotion: PromotionResponse) {
        _selectedPromotion.value = promotion
    }

    fun clearPromotion() {
        _selectedPromotion.value = null
    }

    /**
     * Tính discount amount dựa trên promotion và order amount
     */
    fun calculateDiscount(orderAmount: Int): Int {
        val promotion = _selectedPromotion.value ?: return 0
        
        // Check minimum order amount
        if (orderAmount < promotion.minOrderAmount) {
            return 0
        }

        val discount = when (promotion.discountType) {
            "percent" -> {
                val percentDiscount = (orderAmount * promotion.discountValue / 100).toInt()
                // Apply max discount if set
                val maxDiscount = promotion.maxDiscount
                if (maxDiscount != null && percentDiscount > maxDiscount) {
                    maxDiscount
                } else {
                    percentDiscount
                }
            }
            "fixed" -> promotion.discountValue.toInt()
            else -> 0
        }

        return discount
    }

    /**
     * Check if promotion is applicable for given order amount
     */
    fun isApplicable(orderAmount: Int): Boolean {
        val promotion = _selectedPromotion.value ?: return false
        return orderAmount >= promotion.minOrderAmount
    }
}
