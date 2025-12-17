package com.qrdatmon.staff.ui.order

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qrdatmon.core.network.api.OrderApi
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class OrderListUiState(
    val isLoading: Boolean = false,
    val orders: List<OrderItem> = emptyList(),
    val errorMessage: String = ""
)

@HiltViewModel
class OrderViewModel @Inject constructor(
    private val orderApi: OrderApi
) : ViewModel() {

    private val _uiState = MutableStateFlow(OrderListUiState())
    val uiState: StateFlow<OrderListUiState> = _uiState.asStateFlow()

    init {
        loadOrders()
    }

    fun loadOrders(status: String? = null) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(
                    isLoading = true,
                    errorMessage = ""
                )

                val response = orderApi.getOrders(status = status)

                if (response.success && response.data != null) {
                    val orderListResponse = response.data!!
                    val orders = orderListResponse.orders.map { orderDto ->
                        OrderItem(
                            id = orderDto.id,
                            orderNumber = "#${orderDto.orderNumber}",
                            tableNumber = "N/A", // Table info not in order response
                            items = orderDto.items.map { it.menuItemName },
                            totalAmount = orderDto.totalAmount,
                            status = mapOrderStatus(orderDto.status),
                            createdAt = formatTime(orderDto.createdAt),
                            customerName = null // Customer info not in order response
                        )
                    }

                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        orders = orders
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = response.message ?: "Failed to load orders"
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

    private fun mapOrderStatus(status: String): OrderItemStatus {
        return when (status.lowercase()) {
            "pending" -> OrderItemStatus.PENDING
            "confirmed" -> OrderItemStatus.CONFIRMED
            "preparing" -> OrderItemStatus.PREPARING
            "ready" -> OrderItemStatus.READY
            "served" -> OrderItemStatus.SERVED
            "completed" -> OrderItemStatus.COMPLETED
            else -> OrderItemStatus.PENDING
        }
    }

    private fun formatTime(timestamp: String): String {
        // Simple time formatting - extract HH:mm from ISO timestamp
        return try {
            val time = timestamp.substring(11, 16)
            time
        } catch (e: Exception) {
            timestamp
        }
    }
}
