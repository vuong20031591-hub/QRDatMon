package com.qrdatmon.core.common.auth

import android.content.Context
import android.content.SharedPreferences

/**
 * Shared AuthManager for both Customer and Staff apps
 * Manages authentication state and user data in SharedPreferences
 */
class AuthManager(context: Context, prefsName: String = "auth_prefs") {
    private val prefs: SharedPreferences = 
        context.getSharedPreferences(prefsName, Context.MODE_PRIVATE)

    /**
     * Save authentication data for staff users
     */
    fun saveStaffAuthData(
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
            putString(KEY_ACCESS_TOKEN, accessToken)
            putString(KEY_REFRESH_TOKEN, refreshToken)
            putString(KEY_USER_ID, userId)
            putString(KEY_USER_NAME, userName)
            putString(KEY_USER_EMAIL, userEmail)
            putString(KEY_STAFF_ID, staffId)
            putString(KEY_EMPLOYEE_CODE, employeeCode)
            putString(KEY_STAFF_ROLE, staffRole)
            putString(KEY_USER_TYPE, USER_TYPE_STAFF)
            putBoolean(KEY_IS_LOGGED_IN, true)
            apply()
        }
    }

    /**
     * Save authentication data for customer users
     */
    fun saveCustomerAuthData(
        accessToken: String,
        refreshToken: String?,
        userId: String,
        userName: String,
        userEmail: String?,
        phoneNumber: String?
    ) {
        prefs.edit().apply {
            putString(KEY_ACCESS_TOKEN, accessToken)
            putString(KEY_REFRESH_TOKEN, refreshToken)
            putString(KEY_USER_ID, userId)
            putString(KEY_USER_NAME, userName)
            putString(KEY_USER_EMAIL, userEmail)
            putString(KEY_PHONE_NUMBER, phoneNumber)
            putString(KEY_USER_TYPE, USER_TYPE_CUSTOMER)
            putBoolean(KEY_IS_LOGGED_IN, true)
            apply()
        }
    }

    fun clearAuthData() {
        prefs.edit().clear().apply()
    }

    fun isLoggedIn(): Boolean {
        return prefs.getBoolean(KEY_IS_LOGGED_IN, false) && 
               !getAccessToken().isNullOrEmpty()
    }

    // Common getters
    fun getAccessToken(): String? = prefs.getString(KEY_ACCESS_TOKEN, null)
    fun getRefreshToken(): String? = prefs.getString(KEY_REFRESH_TOKEN, null)
    fun getUserId(): String? = prefs.getString(KEY_USER_ID, null)
    fun getUserName(): String? = prefs.getString(KEY_USER_NAME, null)
    fun getUserEmail(): String? = prefs.getString(KEY_USER_EMAIL, null)
    fun getUserType(): String? = prefs.getString(KEY_USER_TYPE, null)
    
    // Staff-specific getters
    fun getStaffId(): String? = prefs.getString(KEY_STAFF_ID, null)
    fun getEmployeeCode(): String? = prefs.getString(KEY_EMPLOYEE_CODE, null)
    fun getStaffRole(): String? = prefs.getString(KEY_STAFF_ROLE, null)
    
    // Customer-specific getters
    fun getPhoneNumber(): String? = prefs.getString(KEY_PHONE_NUMBER, null)
    
    // Type checks
    fun isStaff(): Boolean = getUserType() == USER_TYPE_STAFF
    fun isCustomer(): Boolean = getUserType() == USER_TYPE_CUSTOMER

    companion object {
        // Keys
        private const val KEY_ACCESS_TOKEN = "access_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USER_NAME = "user_name"
        private const val KEY_USER_EMAIL = "user_email"
        private const val KEY_USER_TYPE = "user_type"
        private const val KEY_IS_LOGGED_IN = "is_logged_in"
        
        // Staff keys
        private const val KEY_STAFF_ID = "staff_id"
        private const val KEY_EMPLOYEE_CODE = "employee_code"
        private const val KEY_STAFF_ROLE = "staff_role"
        
        // Customer keys
        private const val KEY_PHONE_NUMBER = "phone_number"
        
        // User types
        const val USER_TYPE_STAFF = "staff"
        const val USER_TYPE_CUSTOMER = "customer"
    }
}
