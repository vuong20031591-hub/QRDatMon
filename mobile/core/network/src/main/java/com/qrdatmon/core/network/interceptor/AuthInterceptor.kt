package com.qrdatmon.core.network.interceptor

import com.qrdatmon.core.network.auth.TokenProvider
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthInterceptor @Inject constructor(
    private val tokenProvider: TokenProvider
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        
        // Skip auth for public endpoints
        val url = originalRequest.url.toString()
        if (url.contains("/auth/") || url.contains("/health")) {
            return chain.proceed(originalRequest)
        }

        // Get token from provider
        val token = runBlocking {
            try {
                tokenProvider.getToken()
            } catch (e: Exception) {
                Timber.e(e, "Failed to get token")
                null
            }
        }

        // Add Authorization header if token exists
        val newRequest = if (token != null) {
            originalRequest.newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else {
            originalRequest
        }

        return chain.proceed(newRequest)
    }
}
