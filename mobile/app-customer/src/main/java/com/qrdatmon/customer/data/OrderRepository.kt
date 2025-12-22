package com.qrdatmon.customer.data

import com.qrdatmon.core.network.api.CartApi
import com.qrdatmon.core.network.api.OrderApi
import com.qrdatmon.core.network.dto.cart.AddToCartRequest
import com.qrdatmon.core.network.dto.order.CreateOrderRequest
import com.qrdatmon.core.network.dto.order.OrderResponse
import com.qrdatmon.customer.ui.cart.CartItem

/**
 * Repository để xử lý cart và order với backend
 */
class OrderRepository(
    private val cartApi: CartApi,
    private val orderApi: OrderApi
) {
    
    /**
     * Sync toàn bộ cart items lên backend
     */
    suspend fun syncCartToBackend(items: List<CartItem>, tableId: String): Result<Unit> {
        return try {
            // Clear backend cart first
            cartApi.clearCart(tableId)
            
            // Add all items to backend cart
            items.forEach { item ->
                cartApi.addToCart(
                    AddToCartRequest(
                        tableId = tableId,
                        menuItemId = item.id,
                        quantity = item.quantity,
                        note = item.note
                    )
                )
            }
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Tạo order từ cart (backend sẽ lấy items từ cart)
     * Trước khi tạo order, cần sync cart lên backend
     */
    suspend fun createOrderFromCart(
        cartItems: List<CartItem>,
        tableId: String,
        note: String? = null
    ): Result<OrderResponse> {
        return try {
            // Step 1: Sync cart to backend
            val syncResult = syncCartToBackend(cartItems, tableId)
            if (syncResult.isFailure) {
                return Result.failure(syncResult.exceptionOrNull() ?: Exception("Failed to sync cart"))
            }
            
            // Step 2: Create order from backend cart
            val response = orderApi.createOrder(
                CreateOrderRequest(
                    tableId = tableId,
                    note = note
                )
            )
            
            if (response.success && response.data != null) {
                Result.success(response.data!!)
            } else {
                Result.failure(Exception(response.message ?: "Failed to create order"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Lấy order theo ID
     */
    suspend fun getOrder(orderId: String): Result<OrderResponse> {
        return try {
            val response = orderApi.getOrder(orderId)
            
            if (response.success && response.data != null) {
                Result.success(response.data!!)
            } else {
                Result.failure(Exception(response.message ?: "Failed to get order"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
