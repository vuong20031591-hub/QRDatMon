"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Wand2 } from "lucide-react"
import { promotionSchema, type PromotionFormValues, discountTypeLabels } from "../schemas/promotion.schema"
import type { Promotion } from "@/types"

interface PromotionFormProps {
  promotion?: Promotion
  onSubmit: (data: PromotionFormValues) => Promise<void>
  onCancel: () => void
  onGenerateCode?: () => Promise<string>
  isLoading?: boolean
}

export function PromotionForm({ 
  promotion, 
  onSubmit, 
  onCancel, 
  onGenerateCode,
  isLoading 
}: PromotionFormProps) {
  const isEditing = !!promotion
  const [isGenerating, setIsGenerating] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      code: promotion?.code || "",
      name: promotion?.name || "",
      description: promotion?.description || "",
      discountType: promotion?.discountType || "percent",
      discountValue: promotion?.discountValue || 0,
      minOrderAmount: promotion?.minOrderAmount || 0,
      maxDiscount: promotion?.maxDiscount || null,
      startDate: promotion?.startDate 
        ? new Date(promotion.startDate).toISOString().split("T")[0] 
        : "",
      endDate: promotion?.endDate 
        ? new Date(promotion.endDate).toISOString().split("T")[0] 
        : "",
      usageLimit: promotion?.usageLimit || null,
      usagePerUser: promotion?.usagePerUser || 1,
    },
  })

  const discountType = watch("discountType")

  const handleGenerateCode = async () => {
    if (!onGenerateCode) return
    try {
      setIsGenerating(true)
      const code = await onGenerateCode()
      setValue("code", code)
    } catch {
      // Error handled by parent
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Code */}
        <div className="space-y-2">
          <Label htmlFor="code">Mã voucher *</Label>
          <div className="flex gap-2">
            <Input
              id="code"
              {...register("code")}
              placeholder="VD: SALE50"
              className="uppercase flex-1"
            />
            {onGenerateCode && (
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={handleGenerateCode}
                disabled={isGenerating}
              >
                <Wand2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          {errors.code && (
            <p className="text-sm text-destructive">{errors.code.message}</p>
          )}
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Tên khuyến mãi *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="VD: Giảm 50% đơn hàng"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Mô tả chi tiết về khuyến mãi..."
          rows={2}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Discount Type */}
        <div className="space-y-2">
          <Label>Loại giảm giá *</Label>
          <Select
            value={discountType}
            onValueChange={(value) => setValue("discountType", value as "percent" | "fixed")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(discountTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.discountType && (
            <p className="text-sm text-destructive">{errors.discountType.message}</p>
          )}
        </div>

        {/* Discount Value */}
        <div className="space-y-2">
          <Label htmlFor="discountValue">
            Giá trị giảm {discountType === "percent" ? "(%)" : "(VNĐ)"} *
          </Label>
          <Input
            id="discountValue"
            type="number"
            {...register("discountValue")}
            placeholder={discountType === "percent" ? "VD: 50" : "VD: 100000"}
          />
          {errors.discountValue && (
            <p className="text-sm text-destructive">{errors.discountValue.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Min Order Amount */}
        <div className="space-y-2">
          <Label htmlFor="minOrderAmount">Đơn tối thiểu (VNĐ)</Label>
          <Input
            id="minOrderAmount"
            type="number"
            {...register("minOrderAmount")}
            placeholder="VD: 200000"
          />
          {errors.minOrderAmount && (
            <p className="text-sm text-destructive">{errors.minOrderAmount.message}</p>
          )}
        </div>

        {/* Max Discount */}
        {discountType === "percent" && (
          <div className="space-y-2">
            <Label htmlFor="maxDiscount">Giảm tối đa (VNĐ)</Label>
            <Input
              id="maxDiscount"
              type="number"
              {...register("maxDiscount")}
              placeholder="VD: 100000"
            />
            {errors.maxDiscount && (
              <p className="text-sm text-destructive">{errors.maxDiscount.message}</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="startDate">Ngày bắt đầu *</Label>
          <Input
            id="startDate"
            type="date"
            {...register("startDate")}
          />
          {errors.startDate && (
            <p className="text-sm text-destructive">{errors.startDate.message}</p>
          )}
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="endDate">Ngày kết thúc *</Label>
          <Input
            id="endDate"
            type="date"
            {...register("endDate")}
          />
          {errors.endDate && (
            <p className="text-sm text-destructive">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Usage Limit */}
        <div className="space-y-2">
          <Label htmlFor="usageLimit">Giới hạn sử dụng</Label>
          <Input
            id="usageLimit"
            type="number"
            {...register("usageLimit")}
            placeholder="Không giới hạn"
          />
          {errors.usageLimit && (
            <p className="text-sm text-destructive">{errors.usageLimit.message}</p>
          )}
        </div>

        {/* Usage Per User */}
        <div className="space-y-2">
          <Label htmlFor="usagePerUser">Giới hạn mỗi người</Label>
          <Input
            id="usagePerUser"
            type="number"
            {...register("usagePerUser")}
            placeholder="VD: 1"
          />
          {errors.usagePerUser && (
            <p className="text-sm text-destructive">{errors.usagePerUser.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Tạo mới"}
        </Button>
      </div>
    </form>
  )
}
