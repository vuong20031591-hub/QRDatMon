package com.qrdatmon.core.network.api

import com.qrdatmon.core.network.dto.ApiResponse
import com.qrdatmon.core.network.dto.auth.GoogleAuthRequest
import com.qrdatmon.core.network.dto.auth.ResendOtpRequest
import com.qrdatmon.core.network.dto.auth.SendOtpRequest
import com.qrdatmon.core.network.dto.auth.SendOtpResponse
import com.qrdatmon.core.network.dto.auth.UserResponse
import com.qrdatmon.core.network.dto.auth.VerifyOtpRequest
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface AuthApi {

    @POST("auth/google")
    suspend fun googleAuth(
        @Body request: GoogleAuthRequest
    ): ApiResponse<UserResponse>

    @POST("auth/login")
    suspend fun emailLogin(
        @Body request: com.qrdatmon.core.network.dto.auth.EmailLoginRequest
    ): ApiResponse<UserResponse>

    @GET("auth/verify")
    suspend fun verifyToken(): ApiResponse<UserResponse>

    @GET("auth/me")
    suspend fun getCurrentUser(): ApiResponse<UserResponse>

    // Phone OTP Authentication endpoints

    @POST("auth/phone/send-otp")
    suspend fun sendOtp(
        @Body request: SendOtpRequest
    ): ApiResponse<SendOtpResponse>

    @POST("auth/phone/verify-otp")
    suspend fun verifyOtp(
        @Body request: VerifyOtpRequest
    ): ApiResponse<UserResponse>

    @POST("auth/phone/resend-otp")
    suspend fun resendOtp(
        @Body request: ResendOtpRequest
    ): ApiResponse<SendOtpResponse>
}
