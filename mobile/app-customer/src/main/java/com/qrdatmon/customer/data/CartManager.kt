package com.qrdatmon.customer.data

import com.qrdatmon.customer.ui.cart.CartItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Singleton to manage cart state across the app
 */
object CartManager {
    private val _cartItems = MutableStateFlow<List<CartItem>>(emptyList())
    val cartItems: StateFlow<List<CartItem>> = _cartItems.asStateFlow()

    /**
     * Add item to cart or update quantity if already exists
     */
    fun addItem(item: CartItem) {
        val currentItems = _cartItems.value.toMutableList()
        
        // Check if item already exists (same id and note)
        val existingIndex = currentItems.indexOfFirst { 
            it.id == item.id && it.note == item.note 
        }
        
        if (existingIndex != -1) {
            // Update quantity
            val existingItem = currentItems[existingIndex]
            currentItems[existingIndex] = existingItem.copy(
                quantity = existingItem.quantity + item.quantity
            )
        } else {
            // Add new item
            currentItems.add(item)
        }
        
        _cartItems.value = currentItems
    }

    /**
     * Remove item from cart
     */
    fun removeItem(itemId: String) {
        _cartItems.value = _cartItems.value.filter { it.id != itemId }
    }

    /**
     * Update item quantity
     */
    fun updateQuantity(itemId: String, newQuantity: Int) {
        if (newQuantity <= 0) {
            removeItem(itemId)
            return
        }
        
        _cartItems.value = _cartItems.value.map { item ->
            if (item.id == itemId) {
                item.copy(quantity = newQuantity)
            } else {
                item
            }
        }
    }

    /**
     * Clear all items from cart
     */
    fun clearCart() {
        _cartItems.value = emptyList()
    }

    /**
     * Get total item count
     */
    fun getTotalItemCount(): Int {
        return _cartItems.value.sumOf { it.quantity }
    }

    /**
     * Get subtotal
     */
    fun getSubtotal(): Int {
        return _cartItems.value.sumOf { (it.price + it.toppingPrice) * it.quantity }
    }
}
