package com.qrdatmon.customer.data

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Singleton to manage selected table information
 */
object TableManager {
    private val _selectedTable = MutableStateFlow<SelectedTable?>(null)
    val selectedTable: StateFlow<SelectedTable?> = _selectedTable.asStateFlow()

    /**
     * Set selected table
     */
    fun setTable(table: SelectedTable) {
        _selectedTable.value = table
    }

    /**
     * Get table code (for backward compatibility)
     */
    fun getTableCode(): String {
        return _selectedTable.value?.tableNumber ?: ""
    }

    /**
     * Get table display name
     */
    fun getTableDisplayName(): String {
        return _selectedTable.value?.displayName ?: ""
    }

    /**
     * Clear selected table
     */
    fun clearTable() {
        _selectedTable.value = null
    }
}

data class SelectedTable(
    val id: String,
    val tableNumber: String,
    val areaName: String,
    val displayName: String // e.g., "Khu A - Bàn 12"
)
