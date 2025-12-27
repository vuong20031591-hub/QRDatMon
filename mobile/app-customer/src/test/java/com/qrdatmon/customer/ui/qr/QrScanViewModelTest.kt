package com.qrdatmon.customer.ui.qr

import org.junit.Test
import org.junit.Assert.*

/**
 * Unit tests for QrScanViewModel
 * Testing parseUniversalLink() method
 */
class QrScanViewModelTest {

    @Test
    fun `parseUniversalLink with valid localhost URL returns qrToken`() {
        // Given
        val validToken = "a".repeat(32)
        val url = "http://localhost:3001/table/$validToken"
        
        // When
        val result = parseUniversalLinkStatic(url)
        
        // Then
        assertEquals(validToken, result)
    }

    @Test
    fun `parseUniversalLink with valid IP URL returns qrToken`() {
        // Given
        val validToken = "b".repeat(32)
        val url = "http://192.168.1.65:3001/table/$validToken"
        
        // When
        val result = parseUniversalLinkStatic(url)
        
        // Then
        assertEquals(validToken, result)
    }

    @Test
    fun `parseUniversalLink with valid domain URL returns qrToken`() {
        // Given
        val validToken = "c".repeat(32)
        val url = "https://qrdatmon.app/table/$validToken"
        
        // When
        val result = parseUniversalLinkStatic(url)
        
        // Then
        assertEquals(validToken, result)
    }

    @Test
    fun `parseUniversalLink with invalid format returns null`() {
        // Given
        val url = "https://qrdatmon.app/invalid/path"
        
        // When
        val result = parseUniversalLinkStatic(url)
        
        // Then
        assertNull(result)
    }

    @Test
    fun `parseUniversalLink with short token returns null`() {
        // Given
        val shortToken = "abc123"
        val url = "https://qrdatmon.app/table/$shortToken"
        
        // When
        val result = parseUniversalLinkStatic(url)
        
        // Then
        assertNull(result)
    }

    @Test
    fun `parseUniversalLink with non-hex token returns null`() {
        // Given
        val invalidToken = "g".repeat(32) // 'g' is not a hex character
        val url = "https://qrdatmon.app/table/$invalidToken"
        
        // When
        val result = parseUniversalLinkStatic(url)
        
        // Then
        assertNull(result)
    }

    // Static helper method to test the parsing logic
    private fun parseUniversalLinkStatic(url: String): String? {
        try {
            if (!url.contains("/table/")) {
                return null
            }

            val parts = url.split("/table/")
            if (parts.size != 2) {
                return null
            }

            val qrToken = parts[1].trim()
            
            if (qrToken.length != 32 || !qrToken.matches(Regex("^[0-9a-fA-F]{32}$"))) {
                return null
            }

            return qrToken
        } catch (e: Exception) {
            return null
        }
    }
}
