package com.qrdatmon.customer.ui.menu

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qrdatmon.core.network.api.MenuApi
import com.qrdatmon.core.network.api.PromotionApi
import com.qrdatmon.core.network.dto.menu.CategoryResponse
import com.qrdatmon.core.network.dto.menu.MenuItemResponse
import com.qrdatmon.core.network.dto.promotion.PromotionResponse
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class MenuUiState(
    val isLoading: Boolean = false,
    val categories: List<CategoryResponse> = emptyList(),
    val menuItems: List<MenuItemResponse> = emptyList(),
    val promotions: List<PromotionResponse> = emptyList(),
    val selectedCategoryId: String? = null,
    val errorMessage: String = ""
)

@HiltViewModel
class MenuViewModel @Inject constructor(
    private val menuApi: MenuApi,
    private val promotionApi: PromotionApi
) : ViewModel() {

    private val _uiState = MutableStateFlow(MenuUiState())
    val uiState: StateFlow<MenuUiState> = _uiState.asStateFlow()

    init {
        loadCategories()
        loadMenuItems()
        loadPromotions()
    }

    fun loadCategories() {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(isLoading = true)

                val response = menuApi.getCategories()

                if (response.success && response.data != null) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        categories = response.data!!,
                        errorMessage = ""
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = response.message ?: "Failed to load categories"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.message ?: "An error occurred"
                )
            }
        }
    }

    fun loadMenuItems(categoryId: String? = null) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(
                    isLoading = true,
                    selectedCategoryId = categoryId
                )

                val response = menuApi.getMenuItems(
                    categoryId = categoryId,
                    status = "available"
                )

                if (response.success && response.data != null) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        menuItems = response.data!!,
                        errorMessage = ""
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = response.message ?: "Failed to load menu items"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.message ?: "An error occurred"
                )
            }
        }
    }

    fun selectCategory(categoryId: String?) {
        loadMenuItems(categoryId)
    }

    fun retry() {
        loadCategories()
        loadMenuItems(_uiState.value.selectedCategoryId)
        loadPromotions()
    }

    fun loadPromotions() {
        viewModelScope.launch {
            try {
                val response = promotionApi.getActivePromotions(
                    page = 1,
                    limit = 10,
                    includeExpired = false
                )

                if (response.success && response.data != null) {
                    _uiState.value = _uiState.value.copy(
                        promotions = response.data!!
                    )
                }
            } catch (e: Exception) {
                // Silently fail for promotions, don't block main content
                println("Failed to load promotions: ${e.message}")
            }
        }
    }
}
