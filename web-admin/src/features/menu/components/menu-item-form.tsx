"use client"

import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { menuItemSchema, type MenuItemFormValues } from "../schemas/menu-item.schema"
import type { MenuItem, Category } from "@/types"
import apiClient from "@/lib/api/client"

interface MenuItemFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: MenuItem | null
  categories: Category[]
  onSubmit: (data: MenuItemFormValues) => Promise<void>
  loading?: boolean
}

const getImageUrl = (imageUrl: string | undefined) => {
  if (!imageUrl) return null
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) return imageUrl
  return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`
}

export function MenuItemForm({ open, onOpenChange, item, categories, onSubmit, loading }: MenuItemFormProps) {
  const isEdit = !!item
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      costPrice: 0,
      unit: "phần",
      category: "",
      imageUrl: "",
      status: "available",
      isPopular: false,
      isNew: false,
      preparationTime: 15,
    },
  })

  // Reset form when item changes (for edit mode)
  useEffect(() => {
    if (open && item) {
      form.reset({
        name: item.name || "",
        description: item.description || "",
        price: item.price || 0,
        costPrice: item.costPrice || 0,
        unit: item.unit || "phần",
        category: typeof item.category === "string" ? item.category : item.category?.id || "",
        imageUrl: item.imageUrl || "",
        status: item.status || "available",
        isPopular: item.isPopular || false,
        isNew: item.isNew || false,
        preparationTime: item.preparationTime || 15,
      })
      setPreviewUrl(getImageUrl(item.imageUrl))
      setSelectedFile(null)
    } else if (open && !item) {
      form.reset({
        name: "",
        description: "",
        price: 0,
        costPrice: 0,
        unit: "phần",
        category: "",
        imageUrl: "",
        status: "available",
        isPopular: false,
        isNew: false,
        preparationTime: 15,
      })
      setPreviewUrl(null)
      setSelectedFile(null)
    }
  }, [open, item, form])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file tối đa 5MB')
        return
      }
      setSelectedFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    form.setValue("imageUrl", "")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('category', 'menu-items')
    
    const response = await apiClient.post('/upload/image?optimize=true', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    // Return the WebP medium variant URL
    const data = response.data.data
    if (data.variants) {
      const webpMedium = data.variants.find((v: { format: string; size: string }) => 
        v.format === 'webp' && v.size === 'medium'
      )
      if (webpMedium) return webpMedium.path
    }
    return data.imageUrl || data.url
  }

  const handleSubmit = async (data: MenuItemFormValues) => {
    try {
      // Upload image if new file selected
      if (selectedFile) {
        setUploading(true)
        const imageUrl = await uploadImage(selectedFile)
        data.imageUrl = imageUrl
        setUploading(false)
      }
      
      await onSubmit(data)
      form.reset()
      setPreviewUrl(null)
      setSelectedFile(null)
      onOpenChange(false)
    } catch (error) {
      setUploading(false)
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên món *</Label>
              <Input id="name" {...form.register("name")} placeholder="Nhập tên món" />
              {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Danh mục *</Label>
              {/* eslint-disable-next-line react-hooks/incompatible-library */}
              <Select value={form.watch("category")} onValueChange={(v) => form.setValue("category", v)}>
                <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea id="description" {...form.register("description")} placeholder="Mô tả món ăn" rows={3} />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Giá bán (VNĐ) *</Label>
              <Input id="price" type="number" {...form.register("price")} />
              {form.formState.errors.price && <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice">Giá vốn (VNĐ)</Label>
              <Input id="costPrice" type="number" {...form.register("costPrice")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Đơn vị</Label>
              <Input id="unit" {...form.register("unit")} placeholder="phần" />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Hình ảnh</Label>
            <div className="flex gap-4">
              {/* Preview */}
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                {previewUrl ? (
                  <div className="relative w-full h-full group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                    <span className="text-xs">Chưa có ảnh</span>
                  </div>
                )}
              </div>
              
              {/* Upload Controls */}
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Chọn ảnh từ máy
                </Button>
                <p className="text-xs text-gray-500">
                  Hỗ trợ: JPG, PNG, WebP. Tối đa 5MB
                </p>
                <Input
                  {...form.register("imageUrl")}
                  placeholder="Hoặc nhập URL hình ảnh"
                  onChange={(e) => {
                    form.setValue("imageUrl", e.target.value)
                    if (e.target.value && !selectedFile) {
                      setPreviewUrl(getImageUrl(e.target.value))
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preparationTime">Thời gian chuẩn bị (phút)</Label>
            <Input id="preparationTime" type="number" {...form.register("preparationTime")} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as MenuItemFormValues["status"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Còn hàng</SelectItem>
                <SelectItem value="out_of_stock">Hết hàng</SelectItem>
                <SelectItem value="suspended">Tạm ngưng</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch id="isPopular" checked={form.watch("isPopular")} onCheckedChange={(v) => form.setValue("isPopular", v)} />
              <Label htmlFor="isPopular">Món phổ biến</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="isNew" checked={form.watch("isNew")} onCheckedChange={(v) => form.setValue("isNew", v)} />
              <Label htmlFor="isNew">Món mới</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" disabled={loading || uploading}>
              {uploading ? "Đang tải ảnh..." : loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
