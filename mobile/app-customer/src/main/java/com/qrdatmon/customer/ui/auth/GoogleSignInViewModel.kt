package com.qrdatmon.customer.ui.auth

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qrdatmon.core.common.auth.AuthManager
import com.qrdatmon.core.network.api.AuthApi
import com.qrdatmon.core.network.dto.auth.GoogleAuthRequest
import com.qrdatmon.feature.auth.data.google.GoogleSignInHelper
import com.qrdatmon.feature.auth.data.google.GoogleSignInResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class GoogleSignInUiState(
    val isLoading: Boolean = false,
    val isSuccess: Boolean = false,
    val errorMessage: String? = null
)

/**
 * ViewModel cho Google Sign-In, dùng chung cho cả Onboarding và Login screen
 */
@HiltViewModel
class GoogleSignInViewModel @Inject constructor(
    private val authApi: AuthApi,
    private val authManager: AuthManager,
    private val googleSignInHelper: GoogleSignInHelper
) : ViewModel() {

    private val _uiState = MutableStateFlow(GoogleSignInUiState())
    val uiState: StateFlow<GoogleSignInUiState> = _uiState.asStateFlow()

    fun signInWithGoogle(context: Context) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(
                    isLoading = true,
                    errorMessage = null
                )

                when (val result = googleSignInHelper.signIn(context)) {
                    is GoogleSignInResult.Success -> {
                        val response = authApi.googleAuth(
                            GoogleAuthRequest(idToken = result.idToken)
                        )

                        if (response.success && response.data != null) {
                            val userData = response.data!!
                            
                            authManager.saveCustomerAuthData(
                                accessToken = userData.accessToken,
                                refreshToken = userData.refreshToken,
                                userId = userData.user.id,
                                userName = userData.user.name,
                                userEmail = userData.user.email,
                                phoneNumber = null
                            )

                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                isSuccess = true,
                                errorMessage = null
                            )
                        } else {
                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                errorMessage = response.message ?: "Đăng nhập Google thất bại"
                            )
                        }
                    }
                    is GoogleSignInResult.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = result.message
                        )
                    }
                    is GoogleSignInResult.Cancelled -> {
                        _uiState.value = _uiState.value.copy(isLoading = false)
                    }
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Đã xảy ra lỗi: ${e.message}"
                )
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }

    fun resetState() {
        _uiState.value = GoogleSignInUiState()
    }
}
