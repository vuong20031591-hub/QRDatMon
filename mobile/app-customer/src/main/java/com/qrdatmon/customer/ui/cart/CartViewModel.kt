package com.qrdatmon.customer.ui.cart

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qrdatmon.core.network.api.CartApi
import com.qrdatmon.core.network.api.OrderApi
import com.qrdatmon.core.network.dto.order.OrderResponse
import com.qrdatmon.customer.data.OrderRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CartViewModel @Inject constructor(
    private val cartApi: CartApi,
    private val orderApi: OrderApi
) : ViewModel() {
    
    private val repository = OrderRepository(cartApi, orderApi)
    
    private val _isCreatingOrder = MutableStateFlow(false)
    val isCreatingOrder: StateFlow<Boolean> = _isCreatingOrder.asStateFlow()
    
    private val _orderResult = MutableStateFlow<Result<OrderResponse>?>(null)
    val orderResult: StateFlow<Result<OrderResponse>?> = _orderResult.asStateFlow()
    
    /**
     * Tạo order từ cart items
     */
    fun createOrder(
        cartItems: List<CartItem>,
        tableId: String,
        note: String? = null
    ) {
        viewModelScope.launch {
            _isCreatingOrder.value = true
            _orderResult.value = null
            
            try {
                val result = repository.createOrderFromCart(
                    cartItems = cartItems,
                    tableId = tableId,
                    note = note
                )
                _orderResult.value = result
            } catch (e: Exception) {
                _orderResult.value = Result.failure(e)
            } finally {
                _isCreatingOrder.value = false
            }
        }
    }
    
    /**
     * Reset order result
     */
    fun resetOrderResult() {
        _orderResult.value = null
    }
}
