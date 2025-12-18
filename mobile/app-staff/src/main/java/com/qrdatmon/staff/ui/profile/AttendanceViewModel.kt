package com.qrdatmon.staff.ui.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.qrdatmon.staff.data.model.Shift
import com.qrdatmon.staff.data.model.ShiftsResponse
import com.qrdatmon.staff.data.repository.AttendanceRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject

sealed class AttendanceUiState {
    object Idle : AttendanceUiState()
    object Loading : AttendanceUiState()
    data class Success(val message: String) : AttendanceUiState()
    data class Error(val message: String) : AttendanceUiState()
}

data class AttendanceState(
    val activeShift: Shift? = null,
    val isCheckedIn: Boolean = false,
    val checkInTime: String? = null,
    val isLoading: Boolean = false
)

@HiltViewModel
class AttendanceViewModel @Inject constructor(
    private val repository: AttendanceRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow<AttendanceUiState>(AttendanceUiState.Idle)
    val uiState: StateFlow<AttendanceUiState> = _uiState.asStateFlow()
    
    private val _attendanceState = MutableStateFlow(AttendanceState())
    val attendanceState: StateFlow<AttendanceState> = _attendanceState.asStateFlow()
    
    private val _shifts = MutableStateFlow<List<Shift>>(emptyList())
    val shifts: StateFlow<List<Shift>> = _shifts.asStateFlow()
    
    init {
        loadActiveShift()
    }
    
    fun loadActiveShift() {
        viewModelScope.launch {
            _attendanceState.value = _attendanceState.value.copy(isLoading = true)
            
            repository.getActiveShift().fold(
                onSuccess = { shift ->
                    _attendanceState.value = AttendanceState(
                        activeShift = shift,
                        isCheckedIn = shift != null,
                        checkInTime = shift?.checkInAt?.let { formatTime(it) },
                        isLoading = false
                    )
                },
                onFailure = {
                    _attendanceState.value = _attendanceState.value.copy(isLoading = false)
                }
            )
        }
    }
    
    fun clockIn(shiftType: String, note: String? = null) {
        viewModelScope.launch {
            _uiState.value = AttendanceUiState.Loading
            
            repository.clockIn(shiftType, note).fold(
                onSuccess = { shift ->
                    _attendanceState.value = AttendanceState(
                        activeShift = shift,
                        isCheckedIn = true,
                        checkInTime = shift.checkInAt?.let { formatTime(it) },
                        isLoading = false
                    )
                    _uiState.value = AttendanceUiState.Success("Chấm công vào thành công")
                },
                onFailure = { error ->
                    _uiState.value = AttendanceUiState.Error(
                        error.message ?: "Chấm công vào thất bại"
                    )
                }
            )
        }
    }
    
    fun clockOut(note: String? = null) {
        viewModelScope.launch {
            _uiState.value = AttendanceUiState.Loading
            
            repository.clockOut(note).fold(
                onSuccess = { shift ->
                    _attendanceState.value = AttendanceState(
                        activeShift = null,
                        isCheckedIn = false,
                        checkInTime = null,
                        isLoading = false
                    )
                    _uiState.value = AttendanceUiState.Success("Chấm công ra thành công")
                },
                onFailure = { error ->
                    _uiState.value = AttendanceUiState.Error(
                        error.message ?: "Chấm công ra thất bại"
                    )
                }
            )
        }
    }
    
    fun loadShiftHistory(
        startDate: String? = null,
        endDate: String? = null,
        shiftType: String? = null,
        page: Int = 1
    ) {
        viewModelScope.launch {
            _uiState.value = AttendanceUiState.Loading
            
            repository.getMyShifts(startDate, endDate, shiftType, page).fold(
                onSuccess = { response ->
                    _shifts.value = response.shifts
                    _uiState.value = AttendanceUiState.Idle
                },
                onFailure = { error ->
                    _uiState.value = AttendanceUiState.Error(
                        error.message ?: "Tải lịch sử thất bại"
                    )
                }
            )
        }
    }
    
    fun resetUiState() {
        _uiState.value = AttendanceUiState.Idle
    }
    
    private fun formatTime(isoString: String): String {
        return try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
            inputFormat.timeZone = TimeZone.getTimeZone("UTC")
            val date = inputFormat.parse(isoString)
            val outputFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
            outputFormat.format(date ?: Date())
        } catch (e: Exception) {
            "--:--"
        }
    }
}
