package com.qrdatmon.staff.data.model

import com.google.gson.annotations.SerializedName
import java.util.Date

data class Shift(
    @SerializedName("_id")
    val id: String,
    
    @SerializedName("staff")
    val staffId: String,
    
    @SerializedName("shiftType")
    val shiftType: ShiftType,
    
    @SerializedName("workDate")
    val workDate: String,
    
    @SerializedName("startTime")
    val startTime: String?,
    
    @SerializedName("endTime")
    val endTime: String?,
    
    @SerializedName("checkInAt")
    val checkInAt: String?,
    
    @SerializedName("checkOutAt")
    val checkOutAt: String?,
    
    @SerializedName("note")
    val note: String?,
    
    @SerializedName("createdAt")
    val createdAt: String?,
    
    @SerializedName("updatedAt")
    val updatedAt: String?
)

enum class ShiftType {
    @SerializedName("morning")
    MORNING,
    
    @SerializedName("afternoon")
    AFTERNOON,
    
    @SerializedName("evening")
    EVENING
}

data class ClockInRequest(
    val shiftType: String,
    val note: String? = null
)

data class ClockOutRequest(
    val note: String? = null
)

data class ShiftResponse(
    val shift: Shift
)

data class ShiftsResponse(
    val shifts: List<Shift>,
    val pagination: Pagination
)

data class Pagination(
    val page: Int,
    val limit: Int,
    val total: Int,
    val pages: Int
)
