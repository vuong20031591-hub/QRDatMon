package com.qrdatmon.core.domain.model

data class Payment(
    val id: String,
    val orderId: String,
    val totalAmount: Double,
    val paymentStatus: PaymentStatus,
    val paymentMethod: PaymentMethod? = null,
    val razorpayOrderId: String? = null,
    val razorpayPaymentId: String? = null,
    val razorpaySignature: String? = null,
    val createdAt: Long,
    val paidAt: Long? = null
)

enum class PaymentStatus {
    PENDING,
    PAID,
    FAILED,
    REFUNDED
}

enum class PaymentMethod {
    CASH,
    CARD,
    UPI,
    WALLET
}
