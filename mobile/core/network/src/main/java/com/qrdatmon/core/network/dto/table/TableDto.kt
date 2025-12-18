package com.qrdatmon.core.network.dto.table

import kotlinx.serialization.Serializable

@Serializable
data class TableResponse(
    val id: String? = null,
    @kotlinx.serialization.SerialName("_id")
    val mongoId: String? = null,
    val area: AreaResponse,
    val tableNumber: String,
    val qrCodeUrl: String? = null,
    val qrToken: String,
    val capacity: Int,
    val status: String,
    val isActive: Boolean = true,
    val currentBillId: String? = null
) {
    // Helper to get the actual ID
    fun getTableId(): String = id ?: mongoId ?: ""
}

@Serializable
data class AreaResponse(
    val id: String? = null,
    @kotlinx.serialization.SerialName("_id")
    val mongoId: String? = null,
    val name: String,
    val floor: Int? = null,
    val description: String? = null
) {
    // Helper to get the actual ID
    fun getAreaId(): String = id ?: mongoId ?: ""
}

@Serializable
data class TableSessionResponse(
    val id: String,
    val userId: String,
    val tableId: String,
    val billId: String? = null,
    val joinedAt: String,
    val leftAt: String? = null,
    val isActive: Boolean = true
)

@Serializable
data class JoinTableRequest(
    val guestCount: Int = 1
)
