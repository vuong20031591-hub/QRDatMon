package com.qrdatmon.feature.auth.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qrdatmon.feature.auth.data.repository.AuthRepository
import com.qrdatmon.feature.auth.domain.model.AuthResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    private val _otpState = MutableStateFlow<OtpUiState>(OtpUiState.Idle)
    val otpState: StateFlow<OtpUiState> = _otpState.asStateFlow()

    fun sendOtp(phoneNumber: String) {
        viewModelScope.launch {
            try {
                _uiState.value = LoginUiState.Loading
                
                val result = authRepository.sendOtp(phoneNumber)
                
                if (result.success) {
                    val formattedPhone = formatPhoneForDisplay(phoneNumber)
                    _uiState.value = LoginUiState.OtpSent(formattedPhone)
                } else {
                    _uiState.value = LoginUiState.Error(
                        result.message ?: "Không thể gửi OTP"
                    )
                }
            } catch (e: Exception) {
                Timber.e(e, "Failed to send OTP")
                _uiState.value = LoginUiState.Error(e.message ?: "Không thể gửi OTP")
            }
        }
    }

    fun verifyOtp(phoneNumber: String, otp: String) {
        viewModelScope.launch {
            try {
                _otpState.value = OtpUiState.Loading
                
                when (val result = authRepository.verifyOtp(phoneNumber, otp)) {
                    is AuthResult.Success -> {
                        _otpState.value = OtpUiState.Success
                    }
                    is AuthResult.Error -> {
                        _otpState.value = OtpUiState.Error(result.message)
                    }
                    is AuthResult.Loading -> {
                        _otpState.value = OtpUiState.Loading
                    }
                }
            } catch (e: Exception) {
                Timber.e(e, "Failed to verify OTP")
                _otpState.value = OtpUiState.Error(e.message ?: "Mã OTP không đúng")
            }
        }
    }

    fun signInWithGoogle(idToken: String) {
        viewModelScope.launch {
            try {
                _uiState.value = LoginUiState.Loading
                
                when (val result = authRepository.signInWithGoogle(idToken)) {
                    is AuthResult.Success -> {
                        _uiState.value = LoginUiState.Success
                    }
                    is AuthResult.Error -> {
                        _uiState.value = LoginUiState.Error(result.message)
                    }
                    is AuthResult.Loading -> {
                        _uiState.value = LoginUiState.Loading
                    }
                }
            } catch (e: Exception) {
                Timber.e(e, "Google sign in failed")
                _uiState.value = LoginUiState.Error(
                    e.message ?: "Đăng nhập Google thất bại"
                )
            }
        }
    }

    fun resendOtp(phoneNumber: String) {
        sendOtp(phoneNumber)
    }

    fun resetState() {
        _uiState.value = LoginUiState.Idle
        _otpState.value = OtpUiState.Idle
    }
    
    private fun formatPhoneForDisplay(phoneNumber: String): String {
        return if (phoneNumber.startsWith("0")) {
            "+84${phoneNumber.substring(1)}"
        } else if (phoneNumber.startsWith("+84")) {
            phoneNumber
        } else {
            "+84$phoneNumber"
        }
    }
}

sealed class LoginUiState {
    object Idle : LoginUiState()
    object Loading : LoginUiState()
    data class OtpSent(val phoneNumber: String) : LoginUiState()
    object Success : LoginUiState()
    data class Error(val message: String) : LoginUiState()
}

sealed class OtpUiState {
    object Idle : OtpUiState()
    object Loading : OtpUiState()
    object Success : OtpUiState()
    data class Error(val message: String) : OtpUiState()
}
