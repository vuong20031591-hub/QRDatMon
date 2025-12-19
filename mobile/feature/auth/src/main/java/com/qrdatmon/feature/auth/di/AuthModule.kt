package com.qrdatmon.feature.auth.di

import com.google.firebase.auth.FirebaseAuth
import com.qrdatmon.core.network.auth.TokenProvider
import com.qrdatmon.feature.auth.data.google.GoogleSignInHelper
import com.qrdatmon.feature.auth.data.token.AppTokenProvider
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AuthModule {
    
    @Provides
    @Singleton
    fun provideFirebaseAuth(): FirebaseAuth {
        return FirebaseAuth.getInstance()
    }
    
    @Provides
    @Singleton
    fun provideGoogleSignInHelper(firebaseAuth: FirebaseAuth): GoogleSignInHelper {
        return GoogleSignInHelper(firebaseAuth)
    }
}

@Module
@InstallIn(SingletonComponent::class)
abstract class AuthBindingModule {
    
    @Binds
    @Singleton
    abstract fun bindTokenProvider(
        appTokenProvider: AppTokenProvider
    ): TokenProvider
}
