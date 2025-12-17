package com.qrdatmon.staff.di

import android.content.Context
import com.google.firebase.auth.FirebaseAuth
import com.qrdatmon.core.network.auth.TokenProvider
import com.qrdatmon.staff.auth.StaffTokenProvider
import com.qrdatmon.staff.util.AuthManager
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
        return AuthManager(context)
    }

    @Provides
    @Singleton
    fun provideTokenProvider(authManager: AuthManager): TokenProvider {
        return StaffTokenProvider(authManager)
    }
}
