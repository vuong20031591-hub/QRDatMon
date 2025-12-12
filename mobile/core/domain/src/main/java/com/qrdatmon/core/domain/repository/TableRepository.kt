package com.qrdatmon.core.domain.repository

import com.qrdatmon.core.domain.model.Table
import com.qrdatmon.core.domain.model.TableStatus
import kotlinx.coroutines.flow.Flow

interface TableRepository {
    fun getAllTables(): Flow<List<Table>>
    fun getTableById(tableId: String): Flow<Table?>
    fun getTableByNumber(tableNumber: Int): Flow<Table?>
    fun getTablesByStatus(status: TableStatus): Flow<List<Table>>
    suspend fun createTable(table: Table): Result<Table>
    suspend fun updateTable(table: Table): Result<Table>
    suspend fun updateTableStatus(tableId: String, status: TableStatus): Result<Unit>
    suspend fun deleteTable(tableId: String): Result<Unit>
    suspend fun generateQRCode(tableId: String): Result<String>
}
