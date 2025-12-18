/**
 * Profile Page
 */

"use client"

import { ProfileForm } from "@/features/profile"

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground">Quản lý thông tin tài khoản của bạn</p>
      </div>
      <ProfileForm />
    </div>
  )
}
