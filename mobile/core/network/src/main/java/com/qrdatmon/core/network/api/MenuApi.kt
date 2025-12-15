package com.qrdatmon.core.network.api

import com.qrdatmon.core.network.dto.ApiResponse
import com.qrdatmon.core.network.dto.menu.CategoryResponse
import com.qrdatmon.core.network.dto.menu.MenuItemResponse
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface MenuApi {

    @GET("categories")
    suspend fun getCategories(): ApiResponse<List<CategoryResponse>>

    @GET("menu")
    suspend fun getMenuItems(
        @Query("category") categoryId: String? = null,
        @Query("search") search: String? = null,
        @Query("status") status: String? = null
    ): ApiResponse<List<MenuItemResponse>>

    @GET("menu/{id}")
    suspend fun getMenuItem(
        @Path("id") id: String
    ): ApiResponse<MenuItemResponse>
}
