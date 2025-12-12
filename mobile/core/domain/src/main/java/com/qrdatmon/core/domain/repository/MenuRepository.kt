package com.qrdatmon.core.domain.repository

import com.qrdatmon.core.common.util.Result
import com.qrdatmon.core.domain.model.MenuItem
import kotlinx.coroutines.flow.Flow

interface MenuRepository {
    fun getMenuItems(): Flow<Result<List<MenuItem>>>
    fun getMenuItemById(id: String): Flow<Result<MenuItem>>
    fun getMenuItemsByCategory(category: String): Flow<Result<List<MenuItem>>>
    fun searchMenuItems(query: String): Flow<Result<List<MenuItem>>>
    suspend fun refreshMenu(): Result<Unit>
}
