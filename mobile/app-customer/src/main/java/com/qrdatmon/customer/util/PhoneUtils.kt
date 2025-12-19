package com.qrdatmon.customer.util

/**
 * Utility class cho xử lý số điện thoại
 * Requirements: 4.7
 */
object PhoneUtils {

    private const val VIETNAM_COUNTRY_CODE = "+84"
    
    // Các đầu số di động Việt Nam hợp lệ (sau khi bỏ số 0)
    private val VALID_PREFIXES = listOf(
        "3", "5", "7", "8", "9" // Các đầu số mới
    )

    /**
     * Validate số điện thoại Việt Nam
     * Chấp nhận:
     * - 10 số bắt đầu bằng 0 (VD: 0912345678)
     * - 9 số không bắt đầu bằng 0 (VD: 912345678)
     * 
     * @param phone Số điện thoại cần validate
     * @return true nếu số điện thoại hợp lệ
     */
    fun isValidPhoneNumber(phone: String): Boolean {
        val cleanPhone = cleanPhoneNumber(phone)
        
        return when {
            // 10 số bắt đầu bằng 0
            cleanPhone.length == 10 && cleanPhone.startsWith("0") -> {
                val prefix = cleanPhone.substring(1, 2)
                VALID_PREFIXES.contains(prefix)
            }
            // 9 số không bắt đầu bằng 0
            cleanPhone.length == 9 && !cleanPhone.startsWith("0") -> {
                val prefix = cleanPhone.substring(0, 1)
                VALID_PREFIXES.contains(prefix)
            }
            else -> false
        }
    }

    /**
     * Format số điện thoại với country code +84
     * 
     * @param phone Số điện thoại gốc
     * @return Số điện thoại đã format (VD: +84912345678)
     */
    fun formatPhoneNumber(phone: String): String {
        val cleanPhone = cleanPhoneNumber(phone)
        
        return when {
            // Đã có country code 84
            cleanPhone.startsWith("84") && cleanPhone.length == 11 -> 
                "$VIETNAM_COUNTRY_CODE${cleanPhone.substring(2)}"
            // Bắt đầu bằng 0, bỏ số 0 và thêm +84
            cleanPhone.startsWith("0") && cleanPhone.length == 10 -> 
                "$VIETNAM_COUNTRY_CODE${cleanPhone.substring(1)}"
            // 9 số, thêm +84
            cleanPhone.length == 9 -> 
                "$VIETNAM_COUNTRY_CODE$cleanPhone"
            else -> 
                "$VIETNAM_COUNTRY_CODE$cleanPhone"
        }
    }

    /**
     * Format số điện thoại để hiển thị (masked)
     * VD: +84912345678 -> +84***xxx678
     * 
     * @param phone Số điện thoại đã format
     * @return Số điện thoại đã mask
     */
    fun maskPhoneNumber(phone: String): String {
        val cleanPhone = cleanPhoneNumber(phone)
        if (cleanPhone.length < 6) return phone
        
        val lastDigits = cleanPhone.takeLast(3)
        val prefix = if (phone.startsWith("+")) "+84" else ""
        
        return "${prefix}***xxx$lastDigits"
    }

    /**
     * Format số điện thoại để hiển thị đẹp
     * VD: 0912345678 -> 091 234 5678
     * 
     * @param phone Số điện thoại
     * @return Số điện thoại đã format đẹp
     */
    fun formatForDisplay(phone: String): String {
        val cleanPhone = cleanPhoneNumber(phone)
        
        return when {
            cleanPhone.length == 10 -> {
                "${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6)}"
            }
            cleanPhone.length == 9 -> {
                "0${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2, 5)} ${cleanPhone.substring(5)}"
            }
            else -> phone
        }
    }

    /**
     * Loại bỏ các ký tự không phải số
     * 
     * @param phone Số điện thoại gốc
     * @return Số điện thoại chỉ chứa số
     */
    fun cleanPhoneNumber(phone: String): String {
        return phone.replace(Regex("[^0-9]"), "")
    }

    /**
     * Kiểm tra xem số điện thoại có đủ độ dài tối thiểu để validate không
     * 
     * @param phone Số điện thoại
     * @return true nếu đủ độ dài
     */
    fun hasMinimumLength(phone: String): Boolean {
        val cleanPhone = cleanPhoneNumber(phone)
        return cleanPhone.length >= 9
    }
}
