package com.qrdatmon.feature.auth.domain.model

sealed class AuthResult {
    data class Success(val token: String, val userId: String) : AuthResult()
    data class Error(val message: String) : AuthResult()
    object Loading : AuthResult()
}

data class OtpResult(
    val success: Boolean,
    val message: String? = null
)
