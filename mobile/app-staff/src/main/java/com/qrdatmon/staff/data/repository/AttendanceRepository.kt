package com.qrdatmon.staff.data.repository

import com.qrdatmon.staff.data.api.AttendanceApiService
import com.qrdatmon.staff.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AttendanceRepository(
    private val apiService: AttendanceApiService
) {
    
    suspend fun clockIn(shiftType: String? = null, note: String? = null): Result<Shift> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.clockIn(ClockInRequest(shiftType, note))
                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!.shift)
                } else {
                    Result.failure(Exception("Clock in failed: ${response.code()} - ${response.message()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun clockOut(note: String? = null): Result<Shift> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.clockOut(ClockOutRequest(note))
                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!.shift)
                } else {
                    Result.failure(Exception("Clock out failed: ${response.message()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun getActiveShift(): Result<Shift?> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getActiveShift()
                if (response.isSuccessful) {
                    Result.success(response.body()?.shift)
                } else {
                    Result.failure(Exception("Get active shift failed: ${response.message()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    suspend fun getMyShifts(
        startDate: String? = null,
        endDate: String? = null,
        shiftType: String? = null,
        page: Int = 1,
        limit: Int = 20
    ): Result<ShiftsResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.getMyShifts(startDate, endDate, shiftType, page, limit)
                if (response.isSuccessful && response.body() != null) {
                    Result.success(response.body()!!)
                } else {
                    Result.failure(Exception("Get shifts failed: ${response.message()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
}
