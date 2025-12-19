package com.qrdatmon.customer.ui.auth

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qrdatmon.core.common.auth.AuthManager
import com.qrdatmon.core.network.api.AuthApi
import com.qrdatmon.core.network.dto.auth.GoogleAuthRequest
import com.qrdatmon.core.network.dto.auth.ResendOtpRequest
import com.qrdatmon.core.network.dto.auth.SendOtpRequest
import com.qrdatmon.core.network.dto.auth.VerifyOtpRequest
import com.qrdatmon.customer.util.PhoneUtils
import com.qrdatmon.feature.auth.data.google.GoogleSignInHelper
import com.qrdatmon.feature.auth.data.google.GoogleSignInResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * UI State cho Login flow
 * Requirements: 4.1, 4.2, 4.5, 4.6
 */
data class LoginUiState(
    val isLoading: Boolean = false,
    val isGoogleLoading: Boolean = false,
    val otpSent: Boolean = false,
    val isLoginSuccess: Boolean = false,
    val errorMessage: String? = null,
    val cooldownSeconds: Int = 0,
    val phoneNumber: String = "",
    val formattedPhone: String = ""
)

/**
 * ViewModel cho Login với Phone OTP và Google Sign-In
 */
@HiltViewModel
class LoginViewModel @Inject constructor(
    private val authApi: AuthApi,
    private val authManager: AuthManager,
    private val googleSignInHelper: GoogleSignInHelper
) : ViewModel() {

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    private var cooldownJob: Job? = null

    /**
     * Gửi OTP đến số điện thoại
     */
    fun sendOtp(phone: String) {
        // Validate phone trước khi gửi
        if (!PhoneUtils.isValidPhoneNumber(phone)) {
            _uiState.value = _uiState.value.copy(
                errorMessage = "Số điện thoại không hợp lệ. Vui lòng nhập 9-10 số."
            )
            return
        }

        val formattedPhone = PhoneUtils.formatPhoneNumber(phone)
        
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(
                    isLoading = true,
                    errorMessage = null,
                    phoneNumber = phone,
                    formattedPhone = formattedPhone
                )

                val response = authApi.sendOtp(SendOtpRequest(phone = formattedPhone))

                if (response.success && response.data != null) {
                    val cooldown = response.data?.cooldownSeconds ?: 45
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        otpSent = true,
                        cooldownSeconds = cooldown,
                        errorMessage = null
                    )
                    startCooldownTimer(cooldown)
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = response.message ?: "Không thể gửi OTP. Vui lòng thử lại."
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = parseErrorMessage(e)
                )
            }
        }
    }

    /**
     * Xác thực OTP và đăng nhập
     */
    fun verifyOtp(otp: String) {
        val formattedPhone = _uiState.value.formattedPhone
        
        if (formattedPhone.isEmpty()) {
            _uiState.value = _uiState.value.copy(
                errorMessage = "Vui lòng nhập số điện thoại trước."
            )
            return
        }

        if (otp.length != 6) {
            _uiState.value = _uiState.value.copy(
                errorMessage = "Mã OTP phải có 6 chữ số."
            )
            return
        }

        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(
                    isLoading = true,
                    errorMessage = null
                )

                val response = authApi.verifyOtp(
                    VerifyOtpRequest(phone = formattedPhone, otp = otp)
                )

                if (response.success && response.data != null) {
                    val userData = response.data!!
                    
                    // Lưu auth data vào AuthManager
                    authManager.saveCustomerAuthData(
                        accessToken = userData.accessToken,
                        refreshToken = userData.refreshToken,
                        userId = userData.user.id,
                        userName = userData.user.name,
                        userEmail = userData.user.email,
                        phoneNumber = formattedPhone
                    )

                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isLoginSuccess = true,
                        errorMessage = null
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = response.message ?: "Mã OTP không đúng."
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = parseErrorMessage(e)
                )
            }
        }
    }

    /**
     * Gửi lại OTP
     */
    fun resendOtp() {
        val formattedPhone = _uiState.value.formattedPhone
        
        if (formattedPhone.isEmpty()) {
            _uiState.value = _uiState.value.copy(
                errorMessage = "Vui lòng nhập số điện thoại trước."
            )
            return
        }

        // Kiểm tra cooldown
        if (_uiState.value.cooldownSeconds > 0) {
            return
        }

        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(
                    isLoading = true,
                    errorMessage = null
                )

                val response = authApi.resendOtp(ResendOtpRequest(phone = formattedPhone))

                if (response.success && response.data != null) {
                    val cooldown = response.data?.cooldownSeconds ?: 45
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        cooldownSeconds = cooldown,
                        errorMessage = null
                    )
                    startCooldownTimer(cooldown)
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = response.message ?: "Không thể gửi lại OTP."
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = parseErrorMessage(e)
                )
            }
        }
    }

    /**
     * Reset state để quay lại màn hình nhập số điện thoại
     */
    fun resetToPhoneInput() {
        cooldownJob?.cancel()
        _uiState.value = LoginUiState()
    }

    /**
     * Xóa error message
     */
    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }

    /**
     * Bắt đầu countdown timer cho cooldown
     */
    private fun startCooldownTimer(seconds: Int) {
        cooldownJob?.cancel()
        cooldownJob = viewModelScope.launch {
            var remaining = seconds
            while (remaining > 0) {
                _uiState.value = _uiState.value.copy(cooldownSeconds = remaining)
                delay(1000L)
                remaining--
            }
            _uiState.value = _uiState.value.copy(cooldownSeconds = 0)
        }
    }

    /**
     * Parse error message từ exception
     * Chuyển đổi các lỗi kỹ thuật thành thông báo thân thiện với người dùng
     */
    private fun parseErrorMessage(e: Exception): String {
        val message = e.message ?: ""
        return when {
            // Timeout errors
            message.contains("timeout", ignoreCase = true) -> 
                "Kết nối quá thời gian. Vui lòng thử lại."
            
            // Network errors
            message.contains("network", ignoreCase = true) ||
            message.contains("connect", ignoreCase = true) ||
            message.contains("Unable to resolve host", ignoreCase = true) -> 
                "Không có kết nối mạng. Vui lòng kiểm tra lại."
            
            // Rate limiting
            message.contains("429") || 
            message.contains("rate limit", ignoreCase = true) ||
            message.contains("too many", ignoreCase = true) -> 
                "Quá nhiều yêu cầu. Vui lòng đợi một lát."
            
            // Bad request - OTP related
            message.contains("400") ||
            message.contains("Bad Request", ignoreCase = true) -> 
                "Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại."
            
            // Unauthorized
            message.contains("401") ||
            message.contains("Unauthorized", ignoreCase = true) -> 
                "Phiên đăng nhập hết hạn. Vui lòng thử lại."
            
            // Server errors
            message.contains("500") ||
            message.contains("502") ||
            message.contains("503") ||
            message.contains("Internal Server", ignoreCase = true) -> 
                "Hệ thống đang bận. Vui lòng thử lại sau."
            
            // OTP specific errors
            message.contains("OTP", ignoreCase = true) ||
            message.contains("expired", ignoreCase = true) -> 
                "Mã OTP không đúng hoặc đã hết hạn."
            
            // Phone related errors
            message.contains("phone", ignoreCase = true) ||
            message.contains("locked", ignoreCase = true) -> 
                "Số điện thoại tạm thời bị khóa. Vui lòng thử lại sau."
            
            // Default friendly message
            else -> "Đã xảy ra lỗi. Vui lòng thử lại."
        }
    }

    /**
     * Đăng nhập bằng Google
     * Flow: Google Sign-In -> Firebase -> Backend API
     */
    fun signInWithGoogle(context: Context) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(
                    isGoogleLoading = true,
                    errorMessage = null
                )

                when (val result = googleSignInHelper.signIn(context)) {
                    is GoogleSignInResult.Success -> {
                        // Gọi backend API với Firebase ID Token
                        val response = authApi.googleAuth(
                            GoogleAuthRequest(idToken = result.idToken)
                        )

                        if (response.success && response.data != null) {
                            val userData = response.data!!
                            
                            // Lưu auth data vào AuthManager
                            authManager.saveCustomerAuthData(
                                accessToken = userData.accessToken,
                                refreshToken = userData.refreshToken,
                                userId = userData.user.id,
                                userName = userData.user.name,
                                userEmail = userData.user.email,
                                phoneNumber = null
                            )

                            _uiState.value = _uiState.value.copy(
                                isGoogleLoading = false,
                                isLoginSuccess = true,
                                errorMessage = null
                            )
                        } else {
                            _uiState.value = _uiState.value.copy(
                                isGoogleLoading = false,
                                errorMessage = response.message ?: "Đăng nhập Google thất bại"
                            )
                        }
                    }
                    is GoogleSignInResult.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isGoogleLoading = false,
                            errorMessage = result.message
                        )
                    }
                    is GoogleSignInResult.Cancelled -> {
                        _uiState.value = _uiState.value.copy(
                            isGoogleLoading = false
                        )
                    }
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isGoogleLoading = false,
                    errorMessage = parseErrorMessage(e)
                )
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        cooldownJob?.cancel()
    }
}
