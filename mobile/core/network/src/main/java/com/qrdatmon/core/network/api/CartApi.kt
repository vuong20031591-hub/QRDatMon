package com.qrdatmon.core.network.api

import com.qrdatmon.core.network.dto.ApiResponse
import com.qrdatmon.core.network.dto.cart.AddToCartRequest
import com.qrdatmon.core.network.dto.cart.CartResponse
import com.qrdatmon.core.network.dto.cart.UpdateCartItemRequest
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

interface CartApi {

    @GET("cart")
    suspend fun getCart(
        @Query("tableId") tableId: String
    ): ApiResponse<CartResponse>

    @POST("cart/items")
    suspend fun addToCart(
        @Body request: AddToCartRequest
    ): ApiResponse<CartResponse>

    @PUT("cart/items/{itemId}")
    suspend fun updateCartItem(
        @Path("itemId") itemId: String,
        @Body request: UpdateCartItemRequest
    ): ApiResponse<CartResponse>

    @DELETE("cart/items/{itemId}")
    suspend fun removeFromCart(
        @Path("itemId") itemId: String
    ): ApiResponse<CartResponse>

    @DELETE("cart")
    suspend fun clearCart(
        @Query("tableId") tableId: String
    ): ApiResponse<Unit>
}
