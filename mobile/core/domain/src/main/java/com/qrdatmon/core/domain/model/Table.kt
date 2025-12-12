package com.qrdatmon.core.domain.model

data class Table(
    val id: String,
    val number: Int,
    val capacity: Int,
    val status: TableStatus,
    val qrCode: String,
    val currentOrderId: String? = null,
    val location: String? = null
)

enum class TableStatus {
    AVAILABLE,
    OCCUPIED,
    RESERVED,
    CLEANING
}
