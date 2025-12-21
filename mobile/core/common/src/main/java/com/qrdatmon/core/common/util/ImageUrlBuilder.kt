package com.qrdatmon.core.common.util

/**
 * Utility object để build full URL cho hình ảnh từ relative path
 * 
 * Backend trả về imageUrl dạng: /uploads/menu-items/nuoc-suoi/medium-85.webp
 * Mobile cần full URL: http://10.0.2.2:3000/uploads/menu-items/nuoc-suoi/medium-85.webp
 */
object ImageUrlBuilder {
    
    // Base URL cho static files (không có /api)
    // Emulator: http://10.0.2.2:3000
    // Real device: http://YOUR_LOCAL_IP:3000 (ví dụ: http://192.168.1.100:3000)
    // Production: https://your-domain.com
    private const val STATIC_BASE_URL = "http://10.0.2.2:3000"
    
    /**
     * Convert relative image path thành full URL
     * 
     * @param imageUrl Relative path từ API (ví dụ: /uploads/menu-items/...)
     * @return Full URL để load hình ảnh, hoặc null nếu input null/empty
     */
    fun buildFullUrl(imageUrl: String?): String? {
        if (imageUrl.isNullOrBlank()) return null
        
        // Nếu đã là full URL thì trả về luôn
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            return imageUrl
        }
        
        // Nếu là data URI (base64) thì trả về luôn
        if (imageUrl.startsWith("data:")) {
            return imageUrl
        }
        
        // Build full URL từ relative path
        val fullUrl = if (imageUrl.startsWith("/")) {
            "$STATIC_BASE_URL$imageUrl"
        } else {
            "$STATIC_BASE_URL/$imageUrl"
        }
        
        // Log để debug
        println("ImageUrlBuilder: $imageUrl -> $fullUrl")
        
        return fullUrl
    }
    
    /**
     * Build URL với size cụ thể (thumbnail, small, medium, large)
     * 
     * @param basePath Base path của image (ví dụ: /uploads/menu-items/nuoc-suoi)
     * @param size Size variant (thumbnail, small, medium, large)
     * @param format Image format (webp, jpeg, avif)
     * @param quality Quality level (default: 85)
     */
    fun buildVariantUrl(
        basePath: String?,
        size: String = "medium",
        format: String = "webp",
        quality: Int = 85
    ): String? {
        if (basePath.isNullOrBlank()) return null
        
        val variantPath = "$basePath/$size-$quality.$format"
        return buildFullUrl(variantPath)
    }
}
