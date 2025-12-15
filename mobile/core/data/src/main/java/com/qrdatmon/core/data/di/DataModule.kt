package com.qrdatmon.core.data.di

import com.qrdatmon.core.data.repository.MenuRepositoryImpl
import com.qrdatmon.core.data.repository.OrderRepositoryImpl
import com.qrdatmon.core.domain.repository.MenuRepository
import com.qrdatmon.core.domain.repository.OrderRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class DataModule {

    @Binds
    @Singleton
    abstract fun bindMenuRepository(
        menuRepositoryImpl: MenuRepositoryImpl
    ): MenuRepository

    @Binds
    @Singleton
    abstract fun bindOrderRepository(
        orderRepositoryImpl: OrderRepositoryImpl
    ): OrderRepository
}
