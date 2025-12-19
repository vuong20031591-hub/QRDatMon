package com.qrdatmon.feature.auth.data.google

import android.content.Context
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Helper class để xử lý Google Sign-In flow sử dụng Credential Manager API
 * Flow: Google Sign-In -> Firebase Auth -> Get Firebase ID Token -> Backend API
 */
@Singleton
class GoogleSignInHelper @Inject constructor(
    private val firebaseAuth: FirebaseAuth
) {
    companion object {
        // Web Client ID từ google-services.json (client_type: 3)
        private const val WEB_CLIENT_ID = "501743806076-gnpuu9gmq1usfjmkq6bo6v2ct2m9s582.apps.googleusercontent.com"
    }

    /**
     * Thực hiện Google Sign-In và trả về Firebase ID Token
     * @param context Activity context
     * @return Firebase ID Token để gửi lên backend
     */
    suspend fun signIn(context: Context): GoogleSignInResult {
        return try {
            val credentialManager = CredentialManager.create(context)
            
            val googleIdOption = GetGoogleIdOption.Builder()
                .setFilterByAuthorizedAccounts(false)
                .setServerClientId(WEB_CLIENT_ID)
                .setAutoSelectEnabled(false)
                .build()

            val request = GetCredentialRequest.Builder()
                .addCredentialOption(googleIdOption)
                .build()

            val result = credentialManager.getCredential(
                request = request,
                context = context
            )

            handleSignInResult(result)
        } catch (e: GetCredentialCancellationException) {
            GoogleSignInResult.Cancelled
        } catch (e: NoCredentialException) {
            GoogleSignInResult.Error("Không tìm thấy tài khoản Google. Vui lòng thêm tài khoản Google vào thiết bị.")
        } catch (e: GetCredentialException) {
            GoogleSignInResult.Error("Lỗi đăng nhập: ${e.message}")
        } catch (e: Exception) {
            GoogleSignInResult.Error("Đã xảy ra lỗi: ${e.message}")
        }
    }

    private suspend fun handleSignInResult(result: GetCredentialResponse): GoogleSignInResult {
        val credential = result.credential

        return when (credential) {
            is CustomCredential -> {
                if (credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                    val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
                    val googleIdToken = googleIdTokenCredential.idToken
                    
                    // Sign in to Firebase with Google credential
                    val firebaseCredential = GoogleAuthProvider.getCredential(googleIdToken, null)
                    val authResult = firebaseAuth.signInWithCredential(firebaseCredential).await()
                    
                    // Get Firebase ID Token to send to backend
                    val firebaseUser = authResult.user
                    if (firebaseUser != null) {
                        val firebaseIdToken = firebaseUser.getIdToken(false).await().token
                        if (firebaseIdToken != null) {
                            GoogleSignInResult.Success(
                                idToken = firebaseIdToken,
                                email = firebaseUser.email,
                                displayName = firebaseUser.displayName,
                                photoUrl = firebaseUser.photoUrl?.toString()
                            )
                        } else {
                            GoogleSignInResult.Error("Không thể lấy Firebase token")
                        }
                    } else {
                        GoogleSignInResult.Error("Đăng nhập Firebase thất bại")
                    }
                } else {
                    GoogleSignInResult.Error("Loại credential không hợp lệ")
                }
            }
            else -> GoogleSignInResult.Error("Credential không được hỗ trợ")
        }
    }

    /**
     * Đăng xuất khỏi Firebase
     */
    fun signOut() {
        firebaseAuth.signOut()
    }
}

/**
 * Kết quả của Google Sign-In
 */
sealed class GoogleSignInResult {
    data class Success(
        val idToken: String,
        val email: String?,
        val displayName: String?,
        val photoUrl: String?
    ) : GoogleSignInResult()
    
    data class Error(val message: String) : GoogleSignInResult()
    
    data object Cancelled : GoogleSignInResult()
}
