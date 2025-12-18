package com.qrdatmon.core.network.auth

interface TokenProvider {
    suspend fun getToken(): String?
}
