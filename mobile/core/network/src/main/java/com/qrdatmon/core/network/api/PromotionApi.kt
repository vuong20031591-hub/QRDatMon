package com.qrdatmon.core.network.api

import com.qrdatmon.core.network.dto.ApiResponse
import com.qrdatmon.core.network.dto.promotion.PromotionResponse
import com.qrdatmon.core.network.dto.promotion.VoucherValidationResponse
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface PromotionApi {

    @GET("promotions")
    suspend fun getActivePromotions(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("includeExpired") includeExpired: Boolean? = null
    ): ApiResponse<List<PromotionResponse>>

    @GET("promotions/{id}")
    suspend fun getPromotionById(
        @Path("id") id: String
    ): ApiResponse<PromotionResponse>

    @GET("promotions/validate/{code}")
    suspend fun validateVoucherCode(
        @Path("code") code: String,
        @Query("orderAmount") orderAmount: Double? = null
    ): ApiResponse<VoucherValidationResponse>
}
