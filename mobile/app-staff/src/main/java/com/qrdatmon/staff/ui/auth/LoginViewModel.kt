package com.qrdatmon.staff.ui.auth

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qrdatmon.core.network.api.AuthApi
import com.qrdatmon.core.network.dto.auth.EmailLoginRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LoginUiState(
    val isLoading: Boolean = false,
    val isLoginSuccess: Boolean = false,
    val errorMessage: String = ""
)

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val authApi: AuthApi,
    @ApplicationContext private val context: Context
) : ViewModel() {
    
    private val authManager by lazy { com.qrdatmon.staff.util.AuthManager(context) }

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    fun login(email: String, password: String) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(
                    isLoading = true,
                    errorMessage = ""
                )

                val response = authApi.emailLogin(
                    EmailLoginRequest(
                        email = email,
                        password = password
                    )
                )

                val data = response.data
                if (response.success && data != null) {
                    // Save auth data using AuthManager
                    authManager.saveAuthData(
                        accessToken = data.accessToken,
                        refreshToken = data.refreshToken,
                        userId = data.user.id,
                        userName = data.user.name,
                        userEmail = data.user.email,
                        staffId = data.user.staff?.id,
                        employeeCode = data.user.staff?.employeeCode,
                        staffRole = data.user.staff?.role
                    )

                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isLoginSuccess = true
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = response.message ?: "Đăng nhập thất bại"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = when {
                        e.message?.contains("Unable to resolve host") == true -> 
                            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
                        e.message?.contains("timeout") == true -> 
                            "Kết nối timeout. Vui lòng thử lại."
                        else -> e.message ?: "Đã xảy ra lỗi. Vui lòng thử lại."
                    }
                )
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = "")
    }
}
