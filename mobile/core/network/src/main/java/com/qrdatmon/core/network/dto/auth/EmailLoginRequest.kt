package com.qrdatmon.core.network.dto.auth

import kotlinx.serialization.Serializable

@Serializable
data class EmailLoginRequest(
    val email: String,
    val password: String
)
