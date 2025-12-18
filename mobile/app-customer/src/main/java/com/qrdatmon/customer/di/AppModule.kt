package com.qrdatmon.customer.di

import android.content.Context
import com.google.firebase.auth.FirebaseAuth
import com.qrdatmon.core.common.auth.AuthManager
import com.qrdatmon.core.network.auth.TokenProvider
import com.qrdatmon.customer.auth.CustomerTokenProvider
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideFirebaseAuth(): FirebaseAuth {
        return FirebaseAuth.getInstance()
    }

    @Provides
    @Singleton
    fun provideAuthManager(@ApplicationContext context: Context): AuthManager {
        return AuthManager(context, "customer_auth_prefs")
    }

    @Provides
    @Singleton
    fun provideTokenProvider(
        customerTokenProvider: CustomerTokenProvider
    ): TokenProvider {
        return customerTokenProvider
    }
}
