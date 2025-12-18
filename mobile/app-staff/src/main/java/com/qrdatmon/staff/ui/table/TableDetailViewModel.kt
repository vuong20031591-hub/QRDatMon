package com.qrdatmon.staff.ui.table

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qrdatmon.core.network.api.OrderApi
import com.qrdatmon.core.network.api.TableApi
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class TableDetailUiState(
    val isLoading: Boolean = false,
    val tableDetail: TableDetail? = null,
    val errorMessage: String = ""
)

@HiltViewModel
class TableDetailViewModel @Inject constructor(
    private val tableApi: TableApi,
    private val orderApi: OrderApi
) : ViewModel() {

    private val _uiState = MutableStateFlow(TableDetailUiState())
    val uiState: StateFlow<TableDetailUiState> = _uiState.asStateFlow()

    fun loadTableDetail(tableId: String) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(
                    isLoading = true,
                    errorMessage = ""
                )

                // Load table info
                val tableResponse = tableApi.getTableById(tableId)
                
                if (!tableResponse.success || tableResponse.data == null) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = tableResponse.message ?: "Failed to load table"
                    )
                    return@launch
                }

                val tableDetailResponse = tableResponse.data!!
                val tableDto = tableDetailResponse.table
                val table = Table(
                    id = tableDto.getTableId(),
                    number = tableDto.tableNumber,
                    areaId = tableDto.area.getAreaId(),
                    areaName = tableDto.area.name,
                    capacity = tableDto.capacity,
                    status = mapTableStatus(tableDto.status)
                )

                // If table is not occupied, return empty detail
                if (table.status == TableStatus.AVAILABLE) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        tableDetail = TableDetail(
                            table = table,
                            customer = null,
                            orderItems = emptyList(),
                            subtotal = 0.0,
                            serviceCharge = 0.0,
                            vat = 0.0,
                            total = 0.0,
                            orderTime = ""
                        )
                    )
                    return@launch
                }

                // If table has no bill, return empty detail
                val billId = tableDto.currentBillId
                if (billId == null) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        tableDetail = TableDetail(
                            table = table,
                            customer = null,
                            orderItems = emptyList(),
                            subtotal = 0.0,
                            serviceCharge = 0.0,
                            vat = 0.0,
                            total = 0.0,
                            orderTime = ""
                        )
                    )
                    return@launch
                }

                // Load orders for this bill
                val ordersResponse = orderApi.getOrdersByBill(billId)
                
                if (!ordersResponse.success || ordersResponse.data == null) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = ordersResponse.message ?: "Failed to load orders"
                    )
                    return@launch
                }

                val orders = ordersResponse.data!!.orders
                val allOrderItems = mutableListOf<OrderItemDetail>()
                var subtotal = 0.0
                var firstOrderTime = ""

                orders.forEach { order ->
                    if (firstOrderTime.isEmpty()) {
                        firstOrderTime = formatTime(order.createdAt)
                    }
                    
                    order.items.forEach { item ->
                        allOrderItems.add(
                            OrderItemDetail(
                                id = item.id,
                                name = item.itemName,
                                quantity = item.quantity,
                                price = item.unitPrice,
                                subtotal = item.subtotal,
                                note = item.note,
                                status = item.status
                            )
                        )
                        subtotal += item.subtotal
                    }
                }

                val serviceCharge = subtotal * 0.1
                val vat = (subtotal + serviceCharge) * 0.1
                val total = subtotal + serviceCharge + vat

                // Customer info not available in order response
                val customer = Customer(
                    name = "Khách",
                    phone = null,
                    isGuest = true
                )

                val tableDetail = TableDetail(
                    table = table,
                    customer = customer,
                    orderItems = allOrderItems,
                    subtotal = subtotal,
                    serviceCharge = serviceCharge,
                    vat = vat,
                    total = total,
                    orderTime = firstOrderTime
                )

                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    tableDetail = tableDetail
                )

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

    private fun formatTime(timestamp: String): String {
        return try {
            val time = timestamp.substring(11, 16)
            time
        } catch (e: Exception) {
            timestamp
        }
    }
}
