/**
 * SMS Service
 * Handles SMS sending via TextBee API (Self-hosted SMS Gateway)
 * Requirements: 1.3, 5.5
 */

const axios = require('axios');

// TextBee configuration from environment
const TEXTBEE_API_URL = process.env.TEXTBEE_API_URL || 'https://api.textbee.dev/api/v1';
const TEXTBEE_API_KEY = process.env.TEXTBEE_API_KEY;
const TEXTBEE_DEVICE_ID = process.env.TEXTBEE_DEVICE_ID;

/**
 * Mask phone number for logging (security requirement)
 * @param {string} phone - Phone number to mask
 * @returns {string} Masked phone number (e.g., +84***xxx678)
 */
const maskPhone = (phone) => {
  if (!phone || phone.length < 7) return '***';
  const last4 = phone.slice(-4);
  const prefix = phone.slice(0, 3);
  return `${prefix}***${last4}`;
};

/**
 * Send SMS via TextBee API
 * @param {string} phone - Phone number in E.164 format (+84xxxxxxxxx)
 * @param {string} message - SMS message content
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendSms = async (phone, message) => {
  // Validate configuration
  if (!TEXTBEE_API_KEY || !TEXTBEE_DEVICE_ID) {
    console.error('[SMS] TextBee configuration missing');
    return {
      success: false,
      error: 'SMS service not configured'
    };
  }

  try {
    const response = await axios.post(
      `${TEXTBEE_API_URL}/gateway/devices/${TEXTBEE_DEVICE_ID}/send-sms`,
      {
        recipients: [phone],
        message: message
      },
      {
        headers: {
          'x-api-key': TEXTBEE_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    // Log success without sensitive data
    console.log(`[SMS] Message sent to ${maskPhone(phone)}, status: ${response.status}`);

    return {
      success: true,
      messageId: response.data?.messageId || response.data?.id
    };
  } catch (error) {
    // Log error without exposing OTP or full phone number
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    console.error(`[SMS] Failed to send to ${maskPhone(phone)}: ${errorMessage}`);

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Format OTP message with security reminder
 * @param {string} otp - OTP code (will NOT be logged)
 * @returns {string} Formatted message
 */
const formatOtpMessage = (otp) => {
  return `[Menu Tai Ban] Ma OTP cua ban la: ${otp}. Ma co hieu luc trong 5 phut. KHONG chia se ma nay voi bat ky ai.`;
};

module.exports = {
  sendSms,
  formatOtpMessage,
  maskPhone
};
