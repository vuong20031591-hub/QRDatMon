package com.qrdatmon.core.network.api

import com.qrdatmon.core.network.dto.ApiResponse
import com.qrdatmon.core.network.dto.table.JoinTableRequest
import com.qrdatmon.core.network.dto.table.TableResponse
import com.qrdatmon.core.network.dto.table.TableSessionResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface TableApi {

    @GET("tables")
    suspend fun getAllTables(
        @Query("active") active: Boolean? = null
    ): ApiResponse<List<TableResponse>>

    @GET("tables/{tableId}")
    suspend fun getTableById(
        @Path("tableId") tableId: String
    ): ApiResponse<TableResponse>

    @GET("tables/qr/{qrToken}")
    suspend fun getTableByQR(
        @Path("qrToken") qrToken: String
    ): ApiResponse<TableResponse>

    @POST("tables/{tableId}/join")
    suspend fun joinTable(
        @Path("tableId") tableId: String,
        @Body request: JoinTableRequest
    ): ApiResponse<TableSessionResponse>

    @GET("tables/{tableId}/session")
    suspend fun getTableSession(
        @Path("tableId") tableId: String
    ): ApiResponse<TableSessionResponse>

    @POST("tables/{tableId}/leave")
    suspend fun leaveTable(
        @Path("tableId") tableId: String
    ): ApiResponse<Unit>
}
