package com.qrdatmon.staff.util

import android.content.Context
import android.content.SharedPreferences

class AuthManager(context: Context) {
    private val prefs: SharedPreferences = 
        context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)

    fun saveAuthData(
        accessToken: String,
        refreshToken: String,
        userId: String,
        userName: String,
        userEmail: String?,
        staffId: String?,
        employeeCode: String?,
        staffRole: String?
    ) {
        prefs.edit().apply {
            putString("access_token", accessToken)
            putString("refresh_token", refreshToken)
            putString("user_id", userId)
            putString("user_name", userName)
            putString("user_email", userEmail)
            putString("staff_id", staffId)
            putString("employee_code", employeeCode)
            putString("staff_role", staffRole)
            putBoolean("is_logged_in", true)
            apply()
        }
    }

    fun clearAuthData() {
        prefs.edit().clear().apply()
    }

    fun isLoggedIn(): Boolean {
        return prefs.getBoolean("is_logged_in", false) && 
               !getAccessToken().isNullOrEmpty()
    }

    fun getAccessToken(): String? = prefs.getString("access_token", null)
    fun getRefreshToken(): String? = prefs.getString("refresh_token", null)
    fun getUserId(): String? = prefs.getString("user_id", null)
    fun getUserName(): String? = prefs.getString("user_name", null)
    fun getUserEmail(): String? = prefs.getString("user_email", null)
    fun getStaffId(): String? = prefs.getString("staff_id", null)
    fun getEmployeeCode(): String? = prefs.getString("employee_code", null)
    fun getStaffRole(): String? = prefs.getString("staff_role", null)
}
