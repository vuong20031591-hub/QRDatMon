# Add project specific ProGuard rules here.
-keep class androidx.compose.** { *; }
-keep class dagger.hilt.** { *; }
-keep class retrofit2.** { *; }
-keepattributes *Annotation*, Signature, Exceptions
-keepclassmembers class com.qrdatmon.** {
    *** Companion;
}
