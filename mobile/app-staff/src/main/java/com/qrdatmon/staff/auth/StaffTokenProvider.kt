package com.qrdatmon.staff.auth

import com.qrdatmon.core.network.auth.TokenProvider
import com.qrdatmon.staff.util.AuthManager
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class StaffTokenProvider @Inject constructor(
    private val authManager: AuthManager
) : TokenProvider {
    override suspend fun getToken(): String? {
        return authManager.getAccessToken()
    }
}
