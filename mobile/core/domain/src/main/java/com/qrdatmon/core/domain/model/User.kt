package com.qrdatmon.core.domain.model

data class User(
    val id: String,
    val uid: String, // Firebase UID
    val email: String,
    val name: String,
    val photoURL: String? = null,
    val role: UserRole,
    val createdAt: Long,
    val lastLoginAt: Long
)

enum class UserRole {
    CUSTOMER,
    STAFF,
    ADMIN
}
