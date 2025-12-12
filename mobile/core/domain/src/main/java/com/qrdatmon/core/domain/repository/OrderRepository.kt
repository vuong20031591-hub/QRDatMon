package com.qrdatmon.core.domain.repository

import com.qrdatmon.core.domain.model.Order
import kotlinx.coroutines.flow.Flow

interface OrderRepository {
    fun getOrdersByTable(tableId: String): Flow<List<Order>>
    fun getOrdersByCustomer(customerId: String): Flow<List<Order>>
    fun getOrderById(orderId: String): Flow<Order?>
    suspend fun createOrder(order: Order): Result<Order>
    suspend fun updateOrder(order: Order): Result<Order>
    suspend fun updateOrderStatus(orderId: String, status: String): Result<Unit>
    suspend fun deleteOrder(orderId: String): Result<Unit>
    fun getActiveOrders(): Flow<List<Order>>
}
