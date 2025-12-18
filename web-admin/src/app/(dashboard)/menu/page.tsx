"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, Pencil, Trash2, FolderPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTable } from "@/components/shared/data-table"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { MenuItemForm } from "@/features/menu/components/menu-item-form"
import { CategoryForm } from "@/features/menu/components/category-form"
import { useMenuItems, useCategories } from "@/features/menu/hooks/use-menu"
import type { MenuItem, Category } from "@/types"
import type { MenuItemFormValues, CategoryFormValues } from "@/features/menu/schemas/menu-item.schema"
// Sử dụng img tag thay vì next/image để tránh lỗi private IP trong development

const statusMap = {
  available: { label: "Còn hàng", variant: "success" as const },
  out_of_stock: { label: "Hết hàng", variant: "destructive" as const },
  suspended: { label: "Tạm ngưng", variant: "secondary" as const },
}

export default function MenuPage() {
  const { items, loading, createItem, updateItem, deleteItem, updateStatus } = useMenuItems()
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories()
  
  const [itemFormOpen, setItemFormOpen] = useState(false)
  const [categoryFormOpen, setCategoryFormOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [formLoading, setFormLoading] = useState(false)

  const filteredItems = filterCategory === "all" 
    ? items 
    : items.filter(item => {
        const catId = typeof item.category === "string" ? item.category : item.category?.id
        return catId === filterCategory
      })

  const handleCreateItem = async (data: MenuItemFormValues) => {
    setFormLoading(true)
    try { await createItem(data) } finally { setFormLoading(false) }
  }

  const handleUpdateItem = async (data: MenuItemFormValues) => {
    if (!selectedItem) return
    setFormLoading(true)
    try { await updateItem(selectedItem.id, data) } finally { setFormLoading(false) }
  }

  const handleDeleteItem = async () => {
    if (!itemToDelete) return
    setFormLoading(true)
    try {
      await deleteItem(itemToDelete.id)
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } finally { setFormLoading(false) }
  }

  const handleCreateCategory = async (data: CategoryFormValues) => {
    setFormLoading(true)
    try { await createCategory(data) } finally { setFormLoading(false) }
  }

  const handleUpdateCategory = async (data: CategoryFormValues) => {
    if (!selectedCategory) return
    setFormLoading(true)
    try { await updateCategory(selectedCategory.id, data) } finally { setFormLoading(false) }
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return
    setFormLoading(true)
    try {
      await deleteCategory(categoryToDelete.id)
      setDeleteCategoryDialogOpen(false)
      setCategoryToDelete(null)
    } finally { setFormLoading(false) }
  }

  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return null
    if (imageUrl.startsWith('http')) return imageUrl
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`
  }

  const columns: ColumnDef<MenuItem>[] = [
    { accessorKey: "name", header: "Tên món", cell: ({ row }) => (
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {row.original.imageUrl && <img src={getImageUrl(row.original.imageUrl) || ''} alt="" className="w-10 h-10 rounded object-cover" />}
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.isNew && <Badge variant="warning" className="mr-1">Mới</Badge>}
          {row.original.isPopular && <Badge variant="default">Hot</Badge>}
        </div>
      </div>
    )},
    { accessorKey: "category", header: "Danh mục", cell: ({ row }) => {
      const cat = row.original.category
      return typeof cat === "string" ? categories.find(c => c.id === cat)?.name || cat : cat?.name || "-"
    }},
    { accessorKey: "price", header: "Giá", cell: ({ row }) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(row.original.price) },
    { accessorKey: "status", header: "Trạng thái", cell: ({ row }) => {
      const status = statusMap[row.original.status]
      return <Badge variant={status.variant}>{status.label}</Badge>
    }},
    { id: "actions", cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => { setSelectedItem(row.original); setItemFormOpen(true) }}><Pencil className="mr-2 h-4 w-4" />Chỉnh sửa</DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateStatus(row.original.id, row.original.status === "available" ? "out_of_stock" : "available")}>
            {row.original.status === "available" ? "Đánh dấu hết hàng" : "Đánh dấu còn hàng"}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-600" onClick={() => { setItemToDelete(row.original); setDeleteDialogOpen(true) }}><Trash2 className="mr-2 h-4 w-4" />Xóa</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý thực đơn</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setSelectedCategory(null); setCategoryFormOpen(true) }}><FolderPlus className="mr-2 h-4 w-4" />Thêm danh mục</Button>
          <Button onClick={() => { setSelectedItem(null); setItemFormOpen(true) }}><Plus className="mr-2 h-4 w-4" />Thêm món</Button>
        </div>
      </div>

      {/* Categories Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh mục ({categories.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Chưa có danh mục nào</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
                  {cat.imageUrl && (
                    <img 
                      src={getImageUrl(cat.imageUrl) || ''} 
                      alt={cat.name} 
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <span className="text-sm font-medium">{cat.name}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => { setSelectedCategory(cat); setCategoryFormOpen(true) }}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => { setCategoryToDelete(cat); setDeleteCategoryDialogOpen(true) }}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách món ăn ({filteredItems.length})</CardTitle>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Lọc theo danh mục" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <div className="text-center py-8">Đang tải...</div> : <DataTable columns={columns} data={filteredItems} searchKey="name" searchPlaceholder="Tìm kiếm món ăn..." />}
        </CardContent>
      </Card>

      <MenuItemForm open={itemFormOpen} onOpenChange={setItemFormOpen} item={selectedItem} categories={categories} onSubmit={selectedItem ? handleUpdateItem : handleCreateItem} loading={formLoading} />
      <CategoryForm open={categoryFormOpen} onOpenChange={setCategoryFormOpen} category={selectedCategory} onSubmit={selectedCategory ? handleUpdateCategory : handleCreateCategory} loading={formLoading} />
      <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Xác nhận xóa" description={`Bạn có chắc muốn xóa món "${itemToDelete?.name}"?`} variant="destructive" confirmText="Xóa" onConfirm={handleDeleteItem} loading={formLoading} />
      <ConfirmDialog open={deleteCategoryDialogOpen} onOpenChange={setDeleteCategoryDialogOpen} title="Xác nhận xóa danh mục" description={`Bạn có chắc muốn xóa danh mục "${categoryToDelete?.name}"? Các món trong danh mục này sẽ không bị xóa.`} variant="destructive" confirmText="Xóa" onConfirm={handleDeleteCategory} loading={formLoading} />
    </div>
  )
}
