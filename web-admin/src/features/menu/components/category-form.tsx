"use client"

import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { categorySchema, type CategoryFormValues } from "../schemas/menu-item.schema"
import type { Category } from "@/types"
import apiClient from "@/lib/api/client"

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  onSubmit: (data: CategoryFormValues) => Promise<void>
  loading?: boolean
}

const getImageUrl = (imageUrl: string | undefined) => {
  if (!imageUrl) return null
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) return imageUrl
  return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`
}

export function CategoryForm({ open, onOpenChange, category, onSubmit, loading }: CategoryFormProps) {
  const isEdit = !!category
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      sortOrder: 0,
    },
  })

  // Reset form when category changes (for edit mode)
  useEffect(() => {
    if (open && category) {
      form.reset({
        name: category.name || "",
        description: category.description || "",
        imageUrl: category.imageUrl || "",
        sortOrder: category.sortOrder || 0,
      })
      // Set preview for existing image
      if (category.imageUrl) {
        setPreviewUrl(getImageUrl(category.imageUrl))
      }
    } else if (open && !category) {
      form.reset({
        name: "",
        description: "",
        imageUrl: "",
        sortOrder: 0,
      })
      setPreviewUrl(null)
      setSelectedFile(null)
    }
  }, [open, category, form])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file tối đa 5MB')
        return
      }
      setSelectedFile(file)
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
    formData.append('category', 'categories')
    
    const response = await apiClient.post('/upload/image?optimize=true', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    const data = response.data.data
    if (data.variants) {
      const webpMedium = data.variants.find((v: { format: string; size: string }) => 
        v.format === 'webp' && v.size === 'medium'
      )
      if (webpMedium) return webpMedium.path
    }
    return data.imageUrl || data.url
  }

  const handleSubmit = async (data: CategoryFormValues) => {
    try {
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
    } catch (error: unknown) {
      setUploading(false)
      console.error('Error submitting form:', error)
      
      // Xử lý lỗi 409 - Category đã tồn tại
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } }
        if (axiosError.response?.status === 409) {
          form.setError("name", {
            type: "manual",
            message: axiosError.response.data?.message || "Tên danh mục đã tồn tại"
          })
          return
        }
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên danh mục *</Label>
            <Input id="name" {...form.register("name")} placeholder="Nhập tên danh mục" />
            {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea id="description" {...form.register("description")} placeholder="Mô tả danh mục" rows={3} />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Hình ảnh</Label>
            <div className="flex gap-4">
              {/* Preview */}
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                {previewUrl ? (
                  <div className="relative w-full h-full group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1" />
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
                  id="category-image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Chọn ảnh từ máy
                </Button>
                <p className="text-xs text-gray-500">
                  JPG, PNG, WebP. Tối đa 5MB
                </p>
                <Input
                  {...form.register("imageUrl")}
                  placeholder="Hoặc nhập URL"
                  className="text-sm"
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
            <Label htmlFor="sortOrder">Thứ tự sắp xếp</Label>
            <Input id="sortOrder" type="number" {...form.register("sortOrder")} />
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
