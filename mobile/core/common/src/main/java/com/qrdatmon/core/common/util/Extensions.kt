package com.qrdatmon.core.common.util

import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

// String extensions
fun String.isEmailValid(): Boolean {
    return android.util.Patterns.EMAIL_ADDRESS.matcher(this).matches()
}

fun String.capitalizeWords(): String {
    return this.split(" ").joinToString(" ") { word ->
        word.lowercase().replaceFirstChar { it.uppercase() }
    }
}

// Double extensions
fun Double.toCurrency(): String {
    val format = NumberFormat.getCurrencyInstance(Locale("en", "IN"))
    return format.format(this)
}

// Long extensions for timestamps
fun Long.toDateString(): String {
    val formatter = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
    return formatter.format(Date(this))
}

fun Long.toTimeString(): String {
    val formatter = SimpleDateFormat("HH:mm", Locale.getDefault())
    return formatter.format(Date(this))
}

fun Long.toDateTimeString(): String {
    val formatter = SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault())
    return formatter.format(Date(this))
}

// Collection extensions
fun <T> List<T>.safeGet(index: Int): T? {
    return if (index >= 0 && index < size) this[index] else null
}
