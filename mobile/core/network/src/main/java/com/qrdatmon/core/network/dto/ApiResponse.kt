package com.qrdatmon.core.network.dto

import kotlinx.serialization.Serializable

@Serializable
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val message: String? = null,
    val error: ErrorResponse? = null
)

@Serializable
data class ErrorResponse(
    val code: String? = null,
    val message: String,
    val details: Map<String, String>? = null
)
