package com.qrdatmon.core.network.dto.auth

import kotlinx.serialization.Serializable

@Serializable
data class GoogleAuthRequest(
    val idToken: String
)

@Serializable
data class UserResponse(
    val id: String,
    val uid: String,
    val email: String,
    val name: String,
    val photoURL: String? = null,
    val role: String,
    val isGuest: Boolean = false,
    val isActive: Boolean = true,
    val createdAt: String,
    val lastLoginAt: String? = null
)
