package com.qrdatmon.core.network.api

import com.qrdatmon.core.network.dto.ApiResponse
import com.qrdatmon.core.network.dto.auth.GoogleAuthRequest
import com.qrdatmon.core.network.dto.auth.UserResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface AuthApi {

    @POST("auth/google")
    suspend fun googleAuth(
        @Body request: GoogleAuthRequest
    ): ApiResponse<UserResponse>

    @GET("auth/verify")
    suspend fun verifyToken(): ApiResponse<UserResponse>

    @GET("auth/me")
    suspend fun getCurrentUser(): ApiResponse<UserResponse>
}
