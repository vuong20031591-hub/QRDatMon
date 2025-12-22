package com.qrdatmon.core.network.api

import com.qrdatmon.core.network.dto.ApiResponse
import com.qrdatmon.core.network.dto.promotion.PromotionResponse
import retrofit2.http.GET
import retrofit2.http.Query

interface PromotionApi {

    @GET("promotions")
    suspend fun getActivePromotions(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("includeExpired") includeExpired: Boolean = false
    ): ApiResponse<List<PromotionResponse>>
}
