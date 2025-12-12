package com.qrdatmon.core.domain.repository

import com.qrdatmon.core.domain.model.User
import com.qrdatmon.core.domain.model.UserRole
import kotlinx.coroutines.flow.Flow

interface UserRepository {
    fun getUserById(userId: String): Flow<User?>
    fun getUserByUid(uid: String): Flow<User?>
    fun getUsersByRole(role: UserRole): Flow<List<User>>
    suspend fun createUser(user: User): Result<User>
    suspend fun updateUser(user: User): Result<User>
    suspend fun updateLastLogin(userId: String): Result<Unit>
    suspend fun deleteUser(userId: String): Result<Unit>
    fun getCurrentUser(): Flow<User?>
}
