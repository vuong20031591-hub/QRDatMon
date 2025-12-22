package com.qrdatmon.customer.ui.menu

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qrdatmon.core.common.util.ImageUrlBuilder
import com.qrdatmon.core.network.api.MenuApi
import com.qrdatmon.core.network.dto.menu.MenuItemResponse
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class MenuItemDetailUiState(
    val isLoading: Boolean = false,
    val menuItem: MenuItemResponse? = null,
    val imageUrl: String? = null,
    val suggestedItems: List<MenuItemResponse> = emptyList(),
    val errorMessage: String = ""
)

@HiltViewModel
class MenuItemDetailViewModel @Inject constructor(
    private val menuApi: MenuApi
) : ViewModel() {

    private val _uiState = MutableStateFlow(MenuItemDetailUiState())
    val uiState: StateFlow<MenuItemDetailUiState> = _uiState.asStateFlow()

    fun loadMenuItem(itemId: String) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(isLoading = true)
                
                println("MenuItemDetailViewModel: Loading item with ID: $itemId")
                
                val response = menuApi.getMenuItem(itemId)
                
                println("MenuItemDetailViewModel: Response success=${response.success}, data=${response.data}")
                
                if (response.success && response.data != null) {
                    // Extract item from wrapper
                    val item = response.data!!.item
                    val fullImageUrl = ImageUrlBuilder.buildFullUrl(item.imageUrl)
                    
                    println("MenuItemDetailViewModel: Item name=${item.name}, price=${item.price}, imageUrl=${item.imageUrl}")
                    println("MenuItemDetailViewModel: Full image URL=$fullImageUrl")
                    
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        menuItem = item,
                        imageUrl = fullImageUrl,
                        errorMessage = ""
                    )
                    
                    // Load suggested items from same category
                    item.category?.id?.let { categoryId ->
                        loadSuggestedItems(categoryId, itemId)
                    }
                } else {
                    println("MenuItemDetailViewModel: Error - ${response.message}")
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = response.message ?: "Không thể tải thông tin món ăn"
                    )
                }
            } catch (e: Exception) {
                println("MenuItemDetailViewModel: Exception - ${e.message}")
                e.printStackTrace()
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.message ?: "Đã xảy ra lỗi"
                )
            }
        }
    }
    
    private fun loadSuggestedItems(categoryId: String, currentItemId: String) {
        viewModelScope.launch {
            try {
                println("MenuItemDetailViewModel: Loading suggested items for category: $categoryId")
                
                val response = menuApi.getMenuItems(
                    categoryId = categoryId,
                    status = "available"
                )
                
                if (response.success && response.data != null) {
                    // Filter out current item and take first 5 items
                    val suggested = response.data!!
                        .filter { it.id != currentItemId }
                        .take(5)
                    
                    println("MenuItemDetailViewModel: Found ${suggested.size} suggested items")
                    
                    _uiState.value = _uiState.value.copy(
                        suggestedItems = suggested
                    )
                } else {
                    println("MenuItemDetailViewModel: Failed to load suggested items - ${response.message}")
                }
            } catch (e: Exception) {
                println("MenuItemDetailViewModel: Exception loading suggested items - ${e.message}")
                e.printStackTrace()
            }
        }
    }
}
