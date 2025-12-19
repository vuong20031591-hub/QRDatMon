package com.qrdatmon.core.network.dto.auth

import kotlinx.serialization.Serializable

@Serializable
data class GoogleAuthRequest(
    val idToken: String
)

@Serializable
data class UserResponse(
    val user: UserData,
    val accessToken: String,
    val refreshToken: String
)

@Serializable
data class UserData(
    val id: String,
    val uid: String? = null,
    val email: String? = null,
    val name: String,
    val photoURL: String? = null,
    val role: String? = null,
    val isGuest: Boolean = false,
    val isActive: Boolean = true,
    val createdAt: String? = null,
    val lastLoginAt: String? = null,
    val staff: StaffData? = null
)

@Serializable
data class StaffData(
    val id: String,
    val employeeCode: String,
    val role: String,
    val hireDate: String? = null,
    val isActive: Boolean = true
)

// Phone OTP Authentication DTOs

@Serializable
data class SendOtpRequest(
    val phone: String
)

@Serializable
data class SendOtpResponse(
    val success: Boolean,
    val message: String,
    val cooldownSeconds: Int? = null
)

@Serializable
data class VerifyOtpRequest(
    val phone: String,
    val otp: String
)

@Serializable
data class ResendOtpRequest(
    val phone: String
)
