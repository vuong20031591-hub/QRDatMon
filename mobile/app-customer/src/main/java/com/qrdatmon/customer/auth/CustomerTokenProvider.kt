package com.qrdatmon.customer.auth

import com.google.firebase.auth.FirebaseAuth
import com.qrdatmon.core.network.auth.TokenProvider
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CustomerTokenProvider @Inject constructor(
    private val firebaseAuth: FirebaseAuth
) : TokenProvider {

    override suspend fun getToken(): String? {
        return try {
            val user = firebaseAuth.currentUser
            user?.getIdToken(false)?.await()?.token
        } catch (e: Exception) {
            null
        }
    }
}
