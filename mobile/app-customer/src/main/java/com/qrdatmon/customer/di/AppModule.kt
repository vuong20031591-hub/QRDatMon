package com.qrdatmon.customer.di

import com.google.firebase.auth.FirebaseAuth
import com.qrdatmon.core.network.auth.TokenProvider
import com.qrdatmon.customer.auth.CustomerTokenProvider
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
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
    fun provideTokenProvider(
        customerTokenProvider: CustomerTokenProvider
    ): TokenProvider {
        return customerTokenProvider
    }
}
