package com.qrdatmon.customer.ui.cart

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qrdatmon.core.network.api.CartApi
import com.qrdatmon.core.network.api.MenuApi
import com.qrdatmon.core.network.api.OrderApi
import com.qrdatmon.core.network.dto.menu.MenuItemResponse
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
    private val orderApi: OrderApi,
    private val menuApi: MenuApi
) : ViewModel() {
    
    private val repository = OrderRepository(cartApi, orderApi)
    
    private val _isCreatingOrder = MutableStateFlow(false)
    val isCreatingOrder: StateFlow<Boolean> = _isCreatingOrder.asStateFlow()
    
    private val _orderResult = MutableStateFlow<Result<OrderResponse>?>(null)
    val orderResult: StateFlow<Result<OrderResponse>?> = _orderResult.asStateFlow()
    
    private val _suggestedItems = MutableStateFlow<List<MenuItemResponse>>(emptyList())
    val suggestedItems: StateFlow<List<MenuItemResponse>> = _suggestedItems.asStateFlow()
    
    private val _isLoadingSuggestions = MutableStateFlow(false)
    val isLoadingSuggestions: StateFlow<Boolean> = _isLoadingSuggestions.asStateFlow()
    
    /**
     * Lấy gợi ý món ăn dựa trên cart items
     * - Nếu có 1 món: gợi ý 2 món cùng danh mục
     * - Nếu có 2+ món: gợi ý 1 món cho mỗi danh mục duy nhất
     */
    fun loadSuggestions(cartItems: List<CartItem>) {
        if (cartItems.isEmpty()) {
            _suggestedItems.value = emptyList()
            return
        }
        
        viewModelScope.launch {
            _isLoadingSuggestions.value = true
            try {
                val suggestions = mutableListOf<MenuItemResponse>()
                val cartItemIds = cartItems.map { it.id }.toSet()
                val addedIds = mutableSetOf<String>()
                
                // Get unique categories from cart
                val categoryIds = cartItems.mapNotNull { it.categoryId }.distinct()
                
                if (categoryIds.isEmpty()) {
                    // If no category info, load all items and suggest randomly
                    val response = menuApi.getMenuItems()
                    if (response.success && response.data != null) {
                        val availableItems = response.data!!
                            .filter { it.id !in cartItemIds && it.status == "available" }
                            .take(3)
                        suggestions.addAll(availableItems)
                    }
                } else {
                    // Nếu có 1 món: gợi ý 2 món
                    // Nếu có 2+ món: gợi ý 1 món cho mỗi danh mục duy nhất
                    val suggestionsPerCategory = if (cartItems.size == 1) 2 else 1
                    
                    for (categoryId in categoryIds) {
                        val response = menuApi.getMenuItems(categoryId = categoryId)
                        if (response.success && response.data != null) {
                            val categoryItems = response.data!!
                                .filter { 
                                    it.id !in cartItemIds && 
                                    it.id !in addedIds && 
                                    it.status == "available" 
                                }
                                .take(suggestionsPerCategory)
                            
                            suggestions.addAll(categoryItems)
                            addedIds.addAll(categoryItems.map { it.id })
                        }
                    }
                }
                
                _suggestedItems.value = suggestions.take(5) // Max 5 suggestions
            } catch (e: Exception) {
                _suggestedItems.value = emptyList()
            } finally {
                _isLoadingSuggestions.value = false
            }
        }
    }
    
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
