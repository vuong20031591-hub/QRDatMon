package com.qrdatmon.core.data.mapper

import com.qrdatmon.core.domain.model.MenuItem
import com.qrdatmon.core.domain.model.Topping
import com.qrdatmon.core.domain.model.ToppingGroup
import com.qrdatmon.core.network.dto.menu.MenuItemResponse
import com.qrdatmon.core.network.dto.menu.ToppingGroupResponse
import com.qrdatmon.core.network.dto.menu.ToppingResponse

fun MenuItemResponse.toMenuItem(): MenuItem {
    return MenuItem(
        id = id,
        categoryId = categoryId,
        name = name,
        description = description,
        imageUrl = imageUrl,
        price = price,
        unit = unit,
        status = status,
        isPopular = isPopular,
        isNew = isNew,
        preparationTime = preparationTime,
        toppingGroups = toppingGroups.map { it.toToppingGroup() }
    )
}

fun ToppingGroupResponse.toToppingGroup(): ToppingGroup {
    return ToppingGroup(
        id = id,
        name = name,
        isRequired = isRequired,
        minSelect = minSelect,
        maxSelect = maxSelect,
        toppings = toppings.map { it.toTopping() }
    )
}

fun ToppingResponse.toTopping(): Topping {
    return Topping(
        id = id,
        name = name,
        extraPrice = extraPrice,
        isDefault = isDefault,
        isAvailable = isAvailable
    )
}
