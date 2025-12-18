package com.qrdatmon.staff.data.api

import com.qrdatmon.staff.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface AttendanceApiService {
    
    @POST("staff/clock-in")
    suspend fun clockIn(
        @Body request: ClockInRequest
    ): Response<ShiftResponse>
    
    @POST("staff/clock-out")
    suspend fun clockOut(
        @Body request: ClockOutRequest
    ): Response<ShiftResponse>
    
    @GET("staff/active-shift")
    suspend fun getActiveShift(): Response<ShiftResponse>
    
    @GET("staff/my-shifts")
    suspend fun getMyShifts(
        @Query("startDate") startDate: String? = null,
        @Query("endDate") endDate: String? = null,
        @Query("shiftType") shiftType: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ShiftsResponse>
}
