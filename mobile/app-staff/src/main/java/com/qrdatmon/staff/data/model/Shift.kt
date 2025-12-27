package com.qrdatmon.staff.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Shift(
    @SerialName("_id")
    val id: String,
    
    @SerialName("staff")
    val staffId: String,
    
    @SerialName("shiftType")
    val shiftType: String,
    
    @SerialName("workDate")
    val workDate: String,
    
    @SerialName("startTime")
    val startTime: String? = null,
    
    @SerialName("endTime")
    val endTime: String? = null,
    
    @SerialName("checkInAt")
    val checkInAt: String? = null,
    
    @SerialName("checkOutAt")
    val checkOutAt: String? = null,
    
    @SerialName("note")
    val note: String? = null,
    
    @SerialName("createdAt")
    val createdAt: String? = null,
    
    @SerialName("updatedAt")
    val updatedAt: String? = null
)

@Serializable
data class ClockInRequest(
    val shiftType: String? = null,
    val note: String? = null
)

@Serializable
data class ClockOutRequest(
    val note: String? = null
)

@Serializable
data class ShiftResponse(
    val shift: Shift
)

@Serializable
data class ShiftsResponse(
    val shifts: List<Shift>,
    val pagination: Pagination
)

@Serializable
data class Pagination(
    val page: Int,
    val limit: Int,
    val total: Int,
    val pages: Int
)
