package com.qrdatmon.core.network.api

import com.qrdatmon.core.network.dto.ApiResponse
import com.qrdatmon.core.network.dto.order.CreateOrderRequest
import com.qrdatmon.core.network.dto.order.OrderListResponse
import com.qrdatmon.core.network.dto.order.OrderResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface OrderApi {

    @POST("orders")
    suspend fun createOrder(
        @Body request: CreateOrderRequest
    ): ApiResponse<OrderResponse>

    @GET("orders")
    suspend fun getOrders(
        @Query("tableId") tableId: String? = null,
        @Query("status") status: String? = null
    ): ApiResponse<OrderListResponse>

    @GET("orders/{id}")
    suspend fun getOrder(
        @Path("id") id: String
    ): ApiResponse<OrderResponse>

    @GET("orders/bill/{billId}")
    suspend fun getOrdersByBill(
        @Path("billId") billId: String
    ): ApiResponse<OrderListResponse>
}
