package com.qrdatmon.staff.ui.table

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qrdatmon.core.network.api.TableApi
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class TableListUiState(
    val isLoading: Boolean = false,
    val tables: List<Table> = emptyList(),
    val errorMessage: String = ""
)

@HiltViewModel
class TableViewModel @Inject constructor(
    private val tableApi: TableApi
) : ViewModel() {

    private val _uiState = MutableStateFlow(TableListUiState())
    val uiState: StateFlow<TableListUiState> = _uiState.asStateFlow()

    init {
        loadTables()
    }

    fun loadTables() {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(
                    isLoading = true,
                    errorMessage = ""
                )

                val response = tableApi.getAllTables(active = true)

                if (response.success && response.data != null) {
                    val tableListResponse = response.data!!
                    val tables = tableListResponse.tables.map { tableDto ->
                        Table(
                            id = tableDto.getTableId(),
                            number = tableDto.tableNumber,
                            areaId = tableDto.area.getAreaId(),
                            areaName = tableDto.area.name,
                            capacity = tableDto.capacity,
                            status = mapTableStatus(tableDto.status)
                        )
                    }

                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        tables = tables
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = response.message ?: "Failed to load tables"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.message ?: "An error occurred"
                )
            }
        }
    }

    private fun mapTableStatus(status: String): TableStatus {
        return when (status.lowercase()) {
            "available" -> TableStatus.AVAILABLE
            "occupied" -> TableStatus.OCCUPIED
            "reserved" -> TableStatus.RESERVED
            "cleaning" -> TableStatus.CLEANING
            else -> TableStatus.AVAILABLE
        }
    }

    fun filterByArea(areaId: String) {
        // Filter will be handled in the UI layer
    }
}
