package com.qrdatmon.customer.data

import com.qrdatmon.customer.ui.cart.CartItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.*

data class OrderInfo(
    val orderId: String,
    val orderNumber: String,
    val tableId: String,
    val tableDisplayName: String,
    val items: List<CartItem>,
    val subtotal: Int,
    val discount: Int,
    val total: Int,
    val orderTime: String,
    val status: OrderStatus = OrderStatus.PREPARING
)

enum class OrderStatus {
    PREPARING,      // Đang chuẩn bị
    READY,          // Đã xong
    SERVING,        // Đang phục vụ
    COMPLETED       // Hoàn thành
}

/**
 * Singleton để quản lý order hiện tại
 */
object OrderManager {
    private val _currentOrder = MutableStateFlow<OrderInfo?>(null)
    val currentOrder: StateFlow<OrderInfo?> = _currentOrder.asStateFlow()

    /**
     * Tạo order mới từ cart
     */
    fun createOrder(
        tableId: String,
        tableDisplayName: String,
        items: List<CartItem>,
        subtotal: Int,
        discount: Int,
        total: Int
    ) {
        val orderId = UUID.randomUUID().toString()
        val orderNumber = "#${(1000..9999).random()}"
        val orderTime = SimpleDateFormat("HH:mm, dd/MM/yyyy", Locale.getDefault()).format(Date())
        
        val order = OrderInfo(
            orderId = orderId,
            orderNumber = orderNumber,
            tableId = tableId,
            tableDisplayName = tableDisplayName,
            items = items,
            subtotal = subtotal,
            discount = discount,
            total = total,
            orderTime = orderTime,
            status = OrderStatus.PREPARING
        )
        
        _currentOrder.value = order
    }
    
    /**
     * Set order directly (for backend-created orders)
     */
    fun setOrder(order: OrderInfo) {
        _currentOrder.value = order
    }

    /**
     * Thêm món vào order hiện tại
     */
    fun addItemsToCurrentOrder(
        newItems: List<CartItem>,
        additionalSubtotal: Int,
        additionalDiscount: Int,
        additionalTotal: Int
    ) {
        val current = _currentOrder.value ?: return
        
        // Merge items - nếu món đã có (cùng menu item ID) thì cộng số lượng, nếu chưa có thì thêm mới
        val mergedItems = current.items.toMutableList()
        newItems.forEach { newItem ->
            // Find existing item by menu item ID (not cartItemId)
            val existingIndex = mergedItems.indexOfFirst { it.id == newItem.id }
            if (existingIndex >= 0) {
                // Item đã tồn tại, cộng số lượng
                val existing = mergedItems[existingIndex]
                mergedItems[existingIndex] = existing.copy(quantity = existing.quantity + newItem.quantity)
            } else {
                // Item mới, thêm vào
                mergedItems.add(newItem)
            }
        }
        
        _currentOrder.value = current.copy(
            items = mergedItems,
            subtotal = current.subtotal + additionalSubtotal,
            discount = current.discount + additionalDiscount,
            total = current.total + additionalTotal
        )
    }

    /**
     * Cập nhật trạng thái order
     */
    fun updateOrderStatus(status: OrderStatus) {
        _currentOrder.value = _currentOrder.value?.copy(status = status)
    }

    /**
     * Xóa order hiện tại
     */
    fun clearOrder() {
        _currentOrder.value = null
    }
}
