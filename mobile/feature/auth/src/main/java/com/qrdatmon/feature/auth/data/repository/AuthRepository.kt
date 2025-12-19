package com.qrdatmon.feature.auth.data.repository

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.qrdatmon.core.common.auth.AuthManager
import com.qrdatmon.feature.auth.domain.model.AuthResult
import com.qrdatmon.feature.auth.domain.model.OtpResult
import kotlinx.coroutines.tasks.await
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val firebaseAuth: FirebaseAuth,
    private val authManager: AuthManager
) {
    
    suspend fun sendOtp(phoneNumber: String): OtpResult {
        return try {
            // Format phone number
            val formattedPhone = formatPhoneNumber(phoneNumber)
            
            // TODO: Call backend API to send OTP via TextBee
            // For now, simulate success
            Timber.d("Sending OTP to $formattedPhone")
            
            OtpResult(success = true)
        } catch (e: Exception) {
            Timber.e(e, "Failed to send OTP")
            OtpResult(success = false, message = e.message)
        }
    }
    
    suspend fun verifyOtp(phoneNumber: String, otp: String): AuthResult {
        return try {
            val formattedPhone = formatPhoneNumber(phoneNumber)
            
            // TODO: Call backend API to verify OTP
            Timber.d("Verifying OTP: $otp for $formattedPhone")
            
            // Mock token for testing
            val token = "mock_token_${System.currentTimeMillis()}"
            authManager.saveCustomerAuthData(
                accessToken = token,
                refreshToken = null,
                userId = formattedPhone,
                userName = "User ${formattedPhone.takeLast(4)}",
                userEmail = null,
                phoneNumber = formattedPhone
            )
            
            AuthResult.Success(token = token, userId = formattedPhone)
        } catch (e: Exception) {
            Timber.e(e, "Failed to verify OTP")
            AuthResult.Error(e.message ?: "Mã OTP không đúng")
        }
    }
    
    suspend fun signInWithGoogle(idToken: String): AuthResult {
        return try {
            val credential = GoogleAuthProvider.getCredential(idToken, null)
            val result = firebaseAuth.signInWithCredential(credential).await()
            
            val user = result.user
            if (user != null) {
                Timber.d("Google sign in success: ${user.email}")
                
                // Get Firebase ID token to send to backend
                val tokenResult = user.getIdToken(true).await()
                val firebaseToken = tokenResult.token
                
                if (firebaseToken != null) {
                    // TODO: Send firebaseToken to backend for verification
                    // Backend will verify and return JWT token
                    
                    // For now, save the Firebase token
                    authManager.saveCustomerAuthData(
                        accessToken = firebaseToken,
                        refreshToken = null,
                        userId = user.uid,
                        userName = user.displayName ?: user.email?.split("@")?.first() ?: "User",
                        userEmail = user.email,
                        phoneNumber = user.phoneNumber
                    )
                    
                    AuthResult.Success(
                        token = firebaseToken,
                        userId = user.uid
                    )
                } else {
                    AuthResult.Error("Không thể lấy token xác thực")
                }
            } else {
                AuthResult.Error("Đăng nhập thất bại")
            }
        } catch (e: Exception) {
            Timber.e(e, "Google sign in failed")
            AuthResult.Error(e.message ?: "Đăng nhập Google thất bại")
        }
    }
    
    suspend fun logout() {
        firebaseAuth.signOut()
        authManager.clearAuthData()
    }
    
    private fun formatPhoneNumber(phoneNumber: String): String {
        return if (phoneNumber.startsWith("0")) {
            "+84${phoneNumber.substring(1)}"
        } else if (phoneNumber.startsWith("+84")) {
            phoneNumber
        } else {
            "+84$phoneNumber"
        }
    }
}
