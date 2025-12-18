package com.qrdatmon.staff.di

import android.content.Context
import com.google.firebase.auth.FirebaseAuth
import com.qrdatmon.core.common.auth.AuthManager
import com.qrdatmon.core.network.auth.TokenProvider
import com.qrdatmon.staff.auth.StaffTokenProvider
import com.qrdatmon.staff.data.api.AttendanceApiService
import com.qrdatmon.staff.data.repository.AttendanceRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
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
        return AuthManager(context, "staff_auth_prefs")
    }

    @Provides
    @Singleton
    fun provideTokenProvider(authManager: AuthManager): TokenProvider {
        return StaffTokenProvider(authManager)
    }
    
    @Provides
    @Singleton
    fun provideAttendanceApiService(retrofit: Retrofit): AttendanceApiService {
        return retrofit.create(AttendanceApiService::class.java)
    }
    
    @Provides
    @Singleton
    fun provideAttendanceRepository(apiService: AttendanceApiService): AttendanceRepository {
        return AttendanceRepository(apiService)
    }
}
