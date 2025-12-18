package com.qrdatmon.core.network.util

import com.qrdatmon.core.network.dto.ApiResponse
import retrofit2.HttpException
import timber.log.Timber
import java.io.IOException

suspend fun <T> safeApiCall(
    apiCall: suspend () -> ApiResponse<T>
): NetworkResult<T> {
    return try {
        val response = apiCall()
        if (response.success && response.data != null) {
            NetworkResult.Success(response.data)
        } else {
            NetworkResult.Error(
                message = response.message ?: response.error?.message ?: "Unknown error",
                code = response.error?.code
            )
        }
    } catch (e: HttpException) {
        Timber.e(e, "HTTP error: ${e.code()}")
        NetworkResult.Error(
            message = when (e.code()) {
                401 -> "Unauthorized. Please login again."
                403 -> "Access forbidden."
                404 -> "Resource not found."
                500 -> "Server error. Please try again later."
                else -> "Network error: ${e.message()}"
            },
            code = e.code().toString()
        )
    } catch (e: IOException) {
        Timber.e(e, "Network error")
        NetworkResult.Error(
            message = "Network error. Please check your connection.",
            code = "NETWORK_ERROR"
        )
    } catch (e: Exception) {
        Timber.e(e, "Unexpected error")
        NetworkResult.Error(
            message = e.message ?: "An unexpected error occurred",
            code = "UNKNOWN_ERROR"
        )
    }
}
