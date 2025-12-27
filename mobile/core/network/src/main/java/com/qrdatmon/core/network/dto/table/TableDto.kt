package com.qrdatmon.core.network.dto.table

import kotlinx.serialization.Serializable

@Serializable
data class TableResponse(
    val id: String? = null,
    @kotlinx.serialization.SerialName("_id")
    val mongoId: String? = null,
    val area: AreaResponse? = null,  // Make nullable to handle null from backend
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
    val name: String? = null,  // Make nullable to handle null from backend
    val floor: Int? = null,
    val description: String? = null
) {
    // Helper to get the actual ID
    fun getAreaId(): String = id ?: mongoId ?: ""
}

@Serializable
data class TableSessionResponse(
    val session: SessionData? = null,
    val table: TableResponse,
    val bill: BillData? = null,
    val isNewSession: Boolean,
    val isGuest: Boolean = false
)

@Serializable
data class SessionData(
    val id: String,
    val joinedAt: String,
    val leftAt: String? = null,
    val isActive: Boolean = true
)

@Serializable
data class BillData(
    val id: String,
    val billNumber: String,
    val guestCount: Int,
    val subtotal: Double = 0.0,
    val discountAmount: Double = 0.0,
    val serviceChargeAmount: Double = 0.0,
    val vatAmount: Double = 0.0,
    val totalAmount: Double = 0.0,
    val status: String,
    val openedAt: String
)

@Serializable
data class JoinTableRequest(
    val qrToken: String,
    val guestCount: Int = 1
)

@Serializable
data class JoinByQRRequest(
    val qrToken: String,
    val confirmed: Boolean = false
)

@Serializable
data class UpdateTableStatusRequest(
    val status: String
)

@Serializable
data class TransferTableRequest(
    val targetTableId: String
)


// QR Scanning DTOs
// Requirements: 6.2, 10.3

@Serializable
data class VerifyQRResponse(
    val tableId: String,
    val tableNumber: String,
    val area: AreaResponse? = null,
    val status: String,
    val capacity: Int
)

// Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.4
@Serializable
data class JoinByQRResponse(
    // Success response fields
    val sessionId: String? = null,
    val tableId: String? = null,
    val billId: String? = null,
    val table: TableResponse? = null,
    val bill: BillData? = null,
    val isNewSession: Boolean? = null,
    val isNewBill: Boolean? = null,
    val message: String? = null,
    
    // Confirmation required fields (Requirements: 4.3)
    val needsConfirmation: Boolean? = null,
    val existingUsers: List<ExistingUserInfo>? = null,
    val sessionAge: Int? = null
)

@Serializable
data class ExistingUserInfo(
    val name: String? = null,
    val joinedAt: String? = null
)

@Serializable
data class TransferTableResponse(
    val message: String,
    val previousTable: String? = null,
    val newTable: TableResponse,
    val session: SessionData,
    val bill: BillData
)
