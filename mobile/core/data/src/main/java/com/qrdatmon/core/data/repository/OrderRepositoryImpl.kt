package com.qrdatmon.core.data.repository

import com.qrdatmon.core.data.mapper.toOrder
import com.qrdatmon.core.domain.model.Order
import com.qrdatmon.core.domain.repository.OrderRepository
import com.qrdatmon.core.network.api.OrderApi
import com.qrdatmon.core.network.dto.order.CreateOrderRequest
import com.qrdatmon.core.network.util.NetworkResult
import com.qrdatmon.core.network.util.safeApiCall
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OrderRepositoryImpl @Inject constructor(
    private val orderApi: OrderApi
) : OrderRepository {

    override fun getOrdersByTable(tableId: String): Flow<List<Order>> = flow {
        // Note: This method is deprecated, use getOrdersByBill instead
        // For now, return empty list
        emit(emptyList())
    }

    override fun getOrdersByCustomer(customerId: String): Flow<List<Order>> = flow {
        val result = safeApiCall {
            orderApi.getOrders()
        }
        
        when (result) {
            is NetworkResult.Success -> {
                val orders = result.data
                    .filter { it.user?.id == customerId }
                    .map { it.toOrder() }
                emit(orders)
            }
            is NetworkResult.Error -> {
                emit(emptyList())
            }
            is NetworkResult.Loading -> {}
        }
    }

    override fun getOrderById(orderId: String): Flow<Order?> = flow {
        val result = safeApiCall {
            orderApi.getOrder(orderId)
        }
        
        when (result) {
            is NetworkResult.Success -> {
                emit(result.data.toOrder())
            }
            is NetworkResult.Error -> {
                emit(null)
            }
            is NetworkResult.Loading -> {}
        }
    }

    override suspend fun createOrder(order: Order): Result<Order> {
        return try {
            val result = safeApiCall {
                orderApi.createOrder(
                    CreateOrderRequest(
                        tableId = order.billId, // Using billId as tableId for now
                        note = order.note
                    )
                )
            }
            
            when (result) {
                is NetworkResult.Success -> Result.success(result.data.toOrder())
                is NetworkResult.Error -> Result.failure(Exception(result.message))
                is NetworkResult.Loading -> Result.failure(Exception("Still loading"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun updateOrder(order: Order): Result<Order> {
        // TODO: Implement when backend API is ready
        return Result.failure(Exception("Not implemented"))
    }

    override suspend fun updateOrderStatus(orderId: String, status: String): Result<Unit> {
        // TODO: Implement when backend API is ready
        return Result.failure(Exception("Not implemented"))
    }

    override suspend fun deleteOrder(orderId: String): Result<Unit> {
        // TODO: Implement when backend API is ready
        return Result.failure(Exception("Not implemented"))
    }

    override fun getActiveOrders(): Flow<List<Order>> = flow {
        val result = safeApiCall {
            orderApi.getOrders(status = "pending")
        }
        
        when (result) {
            is NetworkResult.Success -> {
                val orders = result.data.map { it.toOrder() }
                emit(orders)
            }
            is NetworkResult.Error -> {
                emit(emptyList())
            }
            is NetworkResult.Loading -> {}
        }
    }
}
