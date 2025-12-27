package com.qrdatmon.customer.ui.qr

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qrdatmon.core.network.api.TableApi
import com.qrdatmon.core.network.dto.table.TableSessionResponse
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * UI State cho QR Scan flow
 * Requirements: 2.2, 2.4
 */
data class QrScanState(
    val isScanning: Boolean = false,
    val isJoining: Boolean = false,
    val error: String? = null,
    val needsConfirmation: Boolean = false,
    val sessionInfo: SessionInfo? = null,
    val existingUsers: List<ExistingUser> = emptyList(),
    val sessionAge: Int = 0,
    val pendingQrToken: String? = null,  // Store qrToken for confirmation flow
    
    // Table transfer states
    val needsTransferConfirmation: Boolean = false,
    val pendingTransferTableId: String? = null,
    val pendingTransferTableNumber: String? = null,
    val isTransferring: Boolean = false,
    
    // Navigation flag
    val shouldNavigateToMenu: Boolean = false
)

/**
 * Session information after successful join
 * Requirements: 2.4
 */
data class SessionInfo(
    val sessionId: String,
    val tableId: String,
    val billId: String,
    val tableNumber: String,
    val areaName: String,
    val isNewSession: Boolean,
    val isNewBill: Boolean
)

/**
 * Existing user information for confirmation dialog
 * Requirements: 4.3
 */
data class ExistingUser(
    val name: String,
    val joinedAt: String
)

/**
 * ViewModel cho QR Scan với state management
 * Requirements: 2.1, 2.2, 2.3, 2.4, 4.3, 4.4
 */
@HiltViewModel
class QrScanViewModel @Inject constructor(
    private val tableApi: TableApi
) : ViewModel() {

    private val _uiState = MutableStateFlow(QrScanState())
    val uiState: StateFlow<QrScanState> = _uiState.asStateFlow()

    /**
     * Parse Universal Link to extract qrToken
     * Requirements: 2.2
     * 
     * Supported formats:
     * - http://localhost:3001/table/{qrToken}
     * - http://192.168.x.x:3001/table/{qrToken}
     * - https://qrdatmon.app/table/{qrToken}
     * 
     * @param url Universal Link URL
     * @return qrToken or null if invalid format
     */
    fun parseUniversalLink(url: String): String? {
        try {
            Timber.d("Parsing Universal Link: $url")
            
            // Validate URL format
            if (!url.contains("/table/")) {
                Timber.w("Invalid URL format: missing /table/ path")
                return null
            }

            // Extract qrToken from path
            val parts = url.split("/table/")
            if (parts.size != 2) {
                Timber.w("Invalid URL format: incorrect path structure")
                return null
            }

            val qrToken = parts[1].trim()
            
            // Validate qrToken format (32 hex characters)
            if (qrToken.length != 32 || !qrToken.matches(Regex("^[0-9a-fA-F]{32}$"))) {
                Timber.w("Invalid qrToken format: $qrToken")
                return null
            }

            Timber.d("Successfully parsed qrToken: $qrToken")
            return qrToken
        } catch (e: Exception) {
            Timber.e(e, "Error parsing Universal Link")
            return null
        }
    }

    /**
     * Join table by QR token
     * Requirements: 2.3, 2.4, 4.3, 4.4
     * 
     * @param qrToken QR token from scanned code
     * @param confirmed Whether user confirmed joining existing session
     */
    fun joinTable(qrToken: String, confirmed: Boolean = false) {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(
                    isJoining = true,
                    error = null,
                    pendingQrToken = qrToken  // Store for confirmation flow
                )

                Timber.d("Joining table with qrToken: $qrToken, confirmed: $confirmed")

                // Call API to join table
                val response = tableApi.joinTableByQR(
                    request = com.qrdatmon.core.network.dto.table.JoinByQRRequest(
                        qrToken = qrToken,
                        confirmed = confirmed
                    )
                )

                if (response.success && response.data != null) {
                    val data = response.data!!
                    
                    // Check if needs confirmation
                    if (data.needsConfirmation == true) {
                        Timber.d("Table requires confirmation")
                        _uiState.value = _uiState.value.copy(
                            isJoining = false,
                            needsConfirmation = true,
                            existingUsers = data.existingUsers?.map { user ->
                                ExistingUser(
                                    name = user.name ?: "Guest",
                                    joinedAt = user.joinedAt ?: ""
                                )
                            } ?: emptyList(),
                            sessionAge = data.sessionAge ?: 0,
                            error = null
                        )
                        return@launch
                    }

                    // Success - create session info
                    val sessionInfo = SessionInfo(
                        sessionId = data.sessionId ?: "",
                        tableId = data.tableId ?: "",
                        billId = data.billId ?: "",
                        tableNumber = data.table?.tableNumber ?: "",
                        areaName = data.table?.area?.name ?: "",
                        isNewSession = data.isNewSession ?: true,
                        isNewBill = data.isNewBill ?: true
                    )

                    Timber.d("Join table successful: $sessionInfo")

                    _uiState.value = _uiState.value.copy(
                        isJoining = false,
                        sessionInfo = sessionInfo,
                        needsConfirmation = false,
                        pendingQrToken = null,
                        error = null,
                        shouldNavigateToMenu = true  // Set flag to navigate
                    )
                } else {
                    // API returned error
                    val errorMessage = response.message ?: "Failed to join table"
                    Timber.e("Join table failed: $errorMessage")
                    
                    _uiState.value = _uiState.value.copy(
                        isJoining = false,
                        pendingQrToken = null,
                        error = errorMessage
                    )
                }
            } catch (e: Exception) {
                Timber.e(e, "Error joining table")
                _uiState.value = _uiState.value.copy(
                    isJoining = false,
                    pendingQrToken = null,
                    error = e.message ?: "An error occurred while joining table"
                )
            }
        }
    }

    /**
     * Reset state after navigation or error
     */
    fun resetState() {
        _uiState.value = QrScanState()
    }

    /**
     * Clear error message
     */
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    /**
     * Cancel confirmation dialog
     */
    fun cancelConfirmation() {
        _uiState.value = _uiState.value.copy(
            needsConfirmation = false,
            existingUsers = emptyList(),
            sessionAge = 0,
            pendingQrToken = null
        )
    }
    
    /**
     * Confirm joining existing session
     */
    fun confirmJoin() {
        val qrToken = _uiState.value.pendingQrToken
        if (qrToken != null) {
            joinTable(qrToken, confirmed = true)
        }
    }
    
    /**
     * Handle QR code detection - Check if need to transfer table
     * Requirements: Table transfer flow
     * 
     * @param qrToken QR token from scanned code
     */
    fun handleQrCodeDetected(qrToken: String) {
        viewModelScope.launch {
            try {
                // Check if user already has an active session
                val currentSession = _uiState.value.sessionInfo
                
                if (currentSession != null) {
                    // User already at a table - need to verify new table first
                    Timber.d("User already at table ${currentSession.tableNumber}, verifying new table")
                    
                    val verifyResponse = tableApi.verifyQRToken(qrToken)
                    
                    if (verifyResponse.success && verifyResponse.data != null) {
                        val newTable = verifyResponse.data!!
                        
                        // Check if scanning same table
                        if (newTable.tableId == currentSession.tableId) {
                            Timber.d("Scanning same table, ignoring")
                            _uiState.value = _uiState.value.copy(
                                error = "Bạn đang ở bàn này rồi"
                            )
                            return@launch
                        }
                        
                        // Show transfer confirmation dialog
                        Timber.d("Show transfer confirmation: ${currentSession.tableNumber} → ${newTable.tableNumber}")
                        _uiState.value = _uiState.value.copy(
                            needsTransferConfirmation = true,
                            pendingTransferTableId = newTable.tableId,
                            pendingTransferTableNumber = newTable.tableNumber,
                            pendingQrToken = qrToken
                        )
                    } else {
                        _uiState.value = _uiState.value.copy(
                            error = verifyResponse.message ?: "Mã QR không hợp lệ"
                        )
                    }
                } else {
                    // No active session - normal join flow
                    joinTable(qrToken)
                }
            } catch (e: Exception) {
                Timber.e(e, "Error handling QR code")
                _uiState.value = _uiState.value.copy(
                    error = e.message ?: "Lỗi khi xử lý mã QR"
                )
            }
        }
    }
    
    /**
     * Transfer to new table
     * Requirements: Table transfer flow
     */
    fun confirmTransferTable() {
        val newTableId = _uiState.value.pendingTransferTableId
        
        if (newTableId == null) {
            Timber.e("No pending transfer table ID")
            return
        }
        
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(
                    isTransferring = true,
                    error = null
                )
                
                Timber.d("Transferring to table: $newTableId")
                
                val response = tableApi.transferToTable(newTableId)
                
                if (response.success && response.data != null) {
                    val data = response.data!!
                    
                    // Update session info with new table
                    val newSessionInfo = SessionInfo(
                        sessionId = data.session.id,
                        tableId = data.newTable.getTableId(),
                        billId = data.bill.id,
                        tableNumber = data.newTable.tableNumber,
                        areaName = data.newTable.area?.name ?: "",
                        isNewSession = false,
                        isNewBill = false
                    )
                    
                    val oldTableNumber = _uiState.value.sessionInfo?.tableNumber ?: "?"
                    Timber.d("Transfer successful: $oldTableNumber → ${data.newTable.tableNumber}")
                    
                    _uiState.value = _uiState.value.copy(
                        isTransferring = false,
                        needsTransferConfirmation = false,
                        pendingTransferTableId = null,
                        pendingTransferTableNumber = null,
                        pendingQrToken = null,
                        sessionInfo = newSessionInfo,
                        error = null,
                        shouldNavigateToMenu = true  // Set flag to navigate
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isTransferring = false,
                        error = response.message ?: "Không thể chuyển bàn"
                    )
                }
            } catch (e: Exception) {
                Timber.e(e, "Error transferring table")
                _uiState.value = _uiState.value.copy(
                    isTransferring = false,
                    error = e.message ?: "Lỗi khi chuyển bàn"
                )
            }
        }
    }
    
    /**
     * Cancel table transfer
     */
    fun cancelTransfer() {
        _uiState.value = _uiState.value.copy(
            needsTransferConfirmation = false,
            pendingTransferTableId = null,
            pendingTransferTableNumber = null,
            pendingQrToken = null
        )
    }
    
    /**
     * Clear navigation flag after navigating
     */
    fun clearNavigationFlag() {
        _uiState.value = _uiState.value.copy(
            shouldNavigateToMenu = false
        )
    }
}
