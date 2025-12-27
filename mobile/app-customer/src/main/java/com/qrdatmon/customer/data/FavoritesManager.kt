package com.qrdatmon.customer.data

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONArray
import org.json.JSONObject

/**
 * Data class for favorite item
 */
data class FavoriteItem(
    val id: String,
    val name: String,
    val description: String,
    val price: Int,
    val imageUrl: String,
    val categoryId: String? = null
)

/**
 * Singleton to manage favorite items
 */
object FavoritesManager {
    private const val PREFS_NAME = "favorites_prefs"
    private const val KEY_FAVORITES = "favorite_items"
    
    private val _favorites = MutableStateFlow<List<FavoriteItem>>(emptyList())
    val favorites: StateFlow<List<FavoriteItem>> = _favorites.asStateFlow()
    
    private var prefs: SharedPreferences? = null
    
    /**
     * Initialize with context (call once in Application or MainActivity)
     */
    fun init(context: Context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        loadFavorites()
    }
    
    /**
     * Load favorites from SharedPreferences
     */
    private fun loadFavorites() {
        val json = prefs?.getString(KEY_FAVORITES, null)
        if (json != null) {
            try {
                val jsonArray = JSONArray(json)
                val items = mutableListOf<FavoriteItem>()
                for (i in 0 until jsonArray.length()) {
                    val obj = jsonArray.getJSONObject(i)
                    items.add(
                        FavoriteItem(
                            id = obj.getString("id"),
                            name = obj.getString("name"),
                            description = obj.optString("description", ""),
                            price = obj.getInt("price"),
                            imageUrl = obj.optString("imageUrl", ""),
                            categoryId = if (obj.has("categoryId") && !obj.isNull("categoryId")) obj.getString("categoryId") else null
                        )
                    )
                }
                _favorites.value = items
            } catch (e: Exception) {
                _favorites.value = emptyList()
            }
        }
    }
    
    /**
     * Save favorites to SharedPreferences
     */
    private fun saveFavorites() {
        val jsonArray = JSONArray()
        _favorites.value.forEach { item ->
            val obj = JSONObject().apply {
                put("id", item.id)
                put("name", item.name)
                put("description", item.description)
                put("price", item.price)
                put("imageUrl", item.imageUrl)
                item.categoryId?.let { put("categoryId", it) }
            }
            jsonArray.put(obj)
        }
        prefs?.edit()?.putString(KEY_FAVORITES, jsonArray.toString())?.apply()
    }
    
    /**
     * Add item to favorites
     */
    fun addFavorite(item: FavoriteItem) {
        if (!isFavorite(item.id)) {
            _favorites.value = _favorites.value + item
            saveFavorites()
        }
    }
    
    /**
     * Remove item from favorites
     */
    fun removeFavorite(itemId: String) {
        _favorites.value = _favorites.value.filter { it.id != itemId }
        saveFavorites()
    }
    
    /**
     * Toggle favorite status
     */
    fun toggleFavorite(item: FavoriteItem): Boolean {
        return if (isFavorite(item.id)) {
            removeFavorite(item.id)
            false
        } else {
            addFavorite(item)
            true
        }
    }
    
    /**
     * Check if item is favorite
     */
    fun isFavorite(itemId: String): Boolean {
        return _favorites.value.any { it.id == itemId }
    }
    
    /**
     * Clear all favorites
     */
    fun clearFavorites() {
        _favorites.value = emptyList()
        saveFavorites()
    }
}
