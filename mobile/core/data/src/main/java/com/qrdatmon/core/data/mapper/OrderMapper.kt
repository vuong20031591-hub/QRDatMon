package com.qrdatmon.core.data.mapper

import com.qrdatmon.core.domain.model.Order
import com.qrdatmon.core.domain.model.OrderItem
import com.qrdatmon.core.domain.model.OrderTopping
import com.qrdatmon.core.network.dto.order.OrderItemResponse
import com.qrdatmon.core.network.dto.order.OrderResponse
import com.qrdatmon.core.network.dto.order.OrderToppingResponse

fun OrderResponse.toOrder(): Order {
    return Order(
        id = id,
        billId = bill?.id ?: "",
        userId = user?.id ?: "",
        orderNumber = orderNumber,
        status = status,
        totalAmount = totalAmount,
        note = note,
        items = items.map { it.toOrderItem() },
        createdAt = createdAt,
        confirmedAt = confirmedAt,
        cancelledAt = cancelledAt,
        cancelReason = cancelReason
    )
}

fun OrderItemResponse.toOrderItem(): OrderItem {
    return OrderItem(
        id = id,
        menuItemId = menuItem?.id ?: combo?.id ?: "",
        menuItemName = itemName,
        menuItemImage = menuItem?.imageUrl ?: combo?.imageUrl,
        quantity = quantity,
        unitPrice = unitPrice,
        subtotal = subtotal,
        note = note,
        status = status,
        toppings = toppings.map { it.toOrderTopping() },
        startedAt = startedAt,
        completedAt = completedAt,
        servedAt = servedAt
    )
}

fun OrderToppingResponse.toOrderTopping(): OrderTopping {
    return OrderTopping(
        id = id,
        toppingId = toppingId,
        name = name,
        quantity = quantity,
        price = price
    )
}
