package com.qrdatmon.feature.auth.data.token

import com.google.firebase.auth.FirebaseAuth
import com.qrdatmon.core.common.auth.AuthManager
import com.qrdatmon.core.network.auth.TokenProvider
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Shared TokenProvider for both Customer and Staff apps
 * Priority: AuthManager token > Firebase token
 */
@Singleton
class AppTokenProvider @Inject constructor(
    private val firebaseAuth: FirebaseAuth,
    private val authManager: AuthManager
) : TokenProvider {

    override suspend fun getToken(): String? {
        // First try to get token from AuthManager (for backend auth)
        val authManagerToken = authManager.getAccessToken()
        if (!authManagerToken.isNullOrEmpty()) {
            return authManagerToken
        }
        
        // Fallback to Firebase token (for Firebase services)
        return try {
            val user = firebaseAuth.currentUser
            user?.getIdToken(false)?.await()?.token
        } catch (e: Exception) {
            null
        }
    }
}
