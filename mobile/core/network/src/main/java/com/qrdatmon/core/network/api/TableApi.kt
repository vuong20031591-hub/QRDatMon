package com.qrdatmon.core.network.api

import com.qrdatmon.core.network.dto.ApiResponse
import com.qrdatmon.core.network.dto.table.JoinByQRRequest
import com.qrdatmon.core.network.dto.table.JoinTableRequest
import com.qrdatmon.core.network.dto.table.TableDetailResponse
import com.qrdatmon.core.network.dto.table.TableListResponse
import com.qrdatmon.core.network.dto.table.TableResponse
import com.qrdatmon.core.network.dto.table.TableSessionResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface TableApi {

    @GET("tables")
    suspend fun getAllTables(
        @Query("active") active: Boolean? = null
    ): ApiResponse<TableListResponse>

    @GET("tables/{tableId}")
    suspend fun getTableById(
        @Path("tableId") tableId: String
    ): ApiResponse<TableDetailResponse>

    @GET("tables/qr/{qrToken}")
    suspend fun getTableByQR(
        @Path("qrToken") qrToken: String
    ): ApiResponse<TableResponse>

    @POST("tables/join")
    suspend fun joinTable(
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

    @POST("tables/{tableId}/transfer")
    suspend fun transferToTable(
        @Path("tableId") newTableId: String
    ): ApiResponse<com.qrdatmon.core.network.dto.table.TransferTableResponse>

    @PATCH("tables/{tableId}/status")
    suspend fun updateTableStatus(
        @Path("tableId") tableId: String,
        @Body request: com.qrdatmon.core.network.dto.table.UpdateTableStatusRequest
    ): ApiResponse<TableDetailResponse>

    @POST("tables/{tableId}/transfer-bill")
    suspend fun transferBillBetweenTables(
        @Path("tableId") tableId: String,
        @Body request: com.qrdatmon.core.network.dto.table.TransferTableRequest
    ): ApiResponse<Unit>

    // QR Scanning endpoints
    @GET("tables/verify-qr/{qrToken}")
    suspend fun verifyQRToken(
        @Path("qrToken") qrToken: String
    ): ApiResponse<com.qrdatmon.core.network.dto.table.VerifyQRResponse>

    @POST("tables/join-by-qr")
    suspend fun joinTableByQR(
        @Body request: JoinByQRRequest
    ): ApiResponse<com.qrdatmon.core.network.dto.table.JoinByQRResponse>
}
