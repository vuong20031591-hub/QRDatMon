package com.qrdatmon.core.network.dto.menu

import kotlinx.serialization.Serializable

/**
 * Wrapper response for single menu item endpoint
 * Backend returns: { success: true, data: { item: {...} } }
 */
@Serializable
data class MenuItemDetailResponse(
    val item: MenuItemResponse
)
