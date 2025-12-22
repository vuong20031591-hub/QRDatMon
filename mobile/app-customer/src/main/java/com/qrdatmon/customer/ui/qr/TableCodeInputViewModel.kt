package com.qrdatmon.customer.ui.qr

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qrdatmon.core.network.api.TableApi
import com.qrdatmon.core.network.dto.table.TableResponse
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class TableCodeInputUiState(
    val isLoading: Boolean = false,
    val tables: List<TableItem> = emptyList(),
    val errorMessage: String = ""
)

data class TableItem(
    val id: String,
    val displayName: String,
    val tableNumber: String,
    val areaName: String,
    val status: String
)

@HiltViewModel
class TableCodeInputViewModel @Inject constructor(
    private val tableApi: TableApi
) : ViewModel() {

    private val _uiState = MutableStateFlow(TableCodeInputUiState())
    val uiState: StateFlow<TableCodeInputUiState> = _uiState.asStateFlow()

    init {
        loadTables()
    }

    private fun loadTables() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            try {
                val response = tableApi.getAllTables(active = true)

                if (response.success && response.data != null) {
                    val tableListResponse = response.data!!
                    // Map all tables (including status info)
                    val tables = tableListResponse.tables.map { tableDto ->
                        TableItem(
                            id = tableDto.getTableId(),
                            displayName = "${tableDto.area.name} - Bàn ${tableDto.tableNumber}",
                            tableNumber = tableDto.tableNumber,
                            areaName = tableDto.area.name,
                            status = tableDto.status
                        )
                    }
                    // Filter to show only available tables
                    val availableTables = tables.filter { it.status == "available" }
                    
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        tables = availableTables,
                        errorMessage = ""
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = response.message ?: "Không thể tải danh sách bàn"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.message ?: "Đã xảy ra lỗi"
                )
            }
        }
    }

    fun retryLoadTables() {
        loadTables()
    }
    
    /**
     * Validate table status before selection
     * Returns error message if table is not available, null if OK
     */
    fun validateTableStatus(status: String): String? {
        return when (status) {
            "available" -> null
            "occupied" -> "Bàn này đang được sử dụng. Vui lòng chọn bàn khác."
            "reserved" -> "Bàn này đã được đặt trước. Vui lòng chọn bàn khác."
            "cleaning" -> "Bàn này đang được dọn dẹp. Vui lòng chọn bàn khác."
            "inactive" -> "Bàn này hiện không hoạt động. Vui lòng chọn bàn khác."
            else -> "Bàn này không khả dụng. Vui lòng chọn bàn khác."
        }
    }
}
