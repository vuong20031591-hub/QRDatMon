package com.qrdatmon.core.data.repository

import com.qrdatmon.core.common.util.Result
import com.qrdatmon.core.data.mapper.toMenuItem
import com.qrdatmon.core.domain.model.MenuItem
import com.qrdatmon.core.domain.repository.MenuRepository
import com.qrdatmon.core.network.api.MenuApi
import com.qrdatmon.core.network.util.NetworkResult
import com.qrdatmon.core.network.util.safeApiCall
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MenuRepositoryImpl @Inject constructor(
    private val menuApi: MenuApi
) : MenuRepository {

    override fun getMenuItems(): Flow<Result<List<MenuItem>>> = flow {
        emit(Result.Loading)
        val result = safeApiCall {
            menuApi.getMenuItems(status = "available")
        }
        
        when (result) {
            is NetworkResult.Success -> {
                val menuItems = result.data.map { it.toMenuItem() }
                emit(Result.Success(menuItems))
            }
            is NetworkResult.Error -> {
                emit(Result.Error(Exception(result.message), result.message))
            }
            is NetworkResult.Loading -> {}
        }
    }

    override fun getMenuItemById(id: String): Flow<Result<MenuItem>> = flow {
        emit(Result.Loading)
        val result = safeApiCall {
            menuApi.getMenuItem(id)
        }
        
        when (result) {
            is NetworkResult.Success -> {
                emit(Result.Success(result.data.toMenuItem()))
            }
            is NetworkResult.Error -> {
                emit(Result.Error(Exception(result.message), result.message))
            }
            is NetworkResult.Loading -> {}
        }
    }

    override fun getMenuItemsByCategory(category: String): Flow<Result<List<MenuItem>>> = flow {
        emit(Result.Loading)
        val result = safeApiCall {
            menuApi.getMenuItems(categoryId = category, status = "available")
        }
        
        when (result) {
            is NetworkResult.Success -> {
                val menuItems = result.data.map { it.toMenuItem() }
                emit(Result.Success(menuItems))
            }
            is NetworkResult.Error -> {
                emit(Result.Error(Exception(result.message), result.message))
            }
            is NetworkResult.Loading -> {}
        }
    }

    override fun searchMenuItems(query: String): Flow<Result<List<MenuItem>>> = flow {
        emit(Result.Loading)
        val result = safeApiCall {
            menuApi.getMenuItems(search = query, status = "available")
        }
        
        when (result) {
            is NetworkResult.Success -> {
                val menuItems = result.data.map { it.toMenuItem() }
                emit(Result.Success(menuItems))
            }
            is NetworkResult.Error -> {
                emit(Result.Error(Exception(result.message), result.message))
            }
            is NetworkResult.Loading -> {}
        }
    }

    override suspend fun refreshMenu(): Result<Unit> {
        return try {
            val result = safeApiCall {
                menuApi.getMenuItems(status = "available")
            }
            when (result) {
                is NetworkResult.Success -> Result.Success(Unit)
                is NetworkResult.Error -> Result.Error(Exception(result.message), result.message)
                is NetworkResult.Loading -> Result.Loading
            }
        } catch (e: Exception) {
            Result.Error(e, e.message)
        }
    }
}
