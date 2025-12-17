package com.qrdatmon.core.network.dto.table

import kotlinx.serialization.Serializable

@Serializable
data class TableListResponse(
    val tables: List<TableResponse>
)
