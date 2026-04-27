'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Box, UploadCloud, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { adminService, AdminProduct } from '@/services/admin.service';
import { toast } from 'sonner';

type StatusType = 'In Stock' | 'Out of Stock';

const PAGE_SIZE = 10;

// ── Skeleton Row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-5 py-3 whitespace-nowrap">
          <div className="h-4 bg-muted/60 rounded w-24" />
        </td>
      ))}
    </tr>
  );
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Modal states
  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<AdminProduct | null>(null);

  // Add form state
  const [addName, setAddName] = useState('');
  const [addCategory, setAddCategory] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addStock, setAddStock] = useState('');
  const [addSizes, setAddSizes] = useState('S,M,L,XL');
  const [addDescription, setAddDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Edit modal local state
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editSizes, setEditSizes] = useState('');
  const [editStatus, setEditStatus] = useState<StatusType>('In Stock');
  const [editVariants, setEditVariants] = useState<{ size: string; stock: number }[]>([]);
  const [editImagePreview, setEditImagePreview] = useState<string>('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminProducts', page],
    queryFn: () => adminService.getProducts(page, PAGE_SIZE),
    staleTime: 30_000,
  });

  const products = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (fd: FormData) => adminService.createProduct(fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      setAddOpen(false);
      resetAddForm();
      toast.success('Product created successfully.');
    },
    onError: () => toast.error('Failed to create product.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }: { id: number; fd: FormData }) => adminService.updateProduct(id, fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      setEditProduct(null);
      toast.success('Product updated successfully.');
    },
    onError: () => toast.error('Failed to update product.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      setDeleteProduct(null);
      toast.success('Product deleted.');
    },
    onError: () => toast.error('Failed to delete product.'),
  });

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function resetAddForm() {
    setAddName(''); setAddCategory(''); setAddPrice('');
    setAddStock(''); setAddSizes('S,M,L,XL'); setAddDescription('');
    setImagePreview(null); setImageFile(null);
  }

  function openEdit(p: AdminProduct) {
    setEditProduct(p);
    setEditPrice(String(p.price));
    setEditStock(String(p.inventory));
    setEditSizes(p.variants.map(v => v.size).join(','));
    setEditStatus(p.inventory > 0 ? 'In Stock' : 'Out of Stock');
    setEditVariants(p.variants.map(v => ({ ...v })));
    setEditImagePreview(p.image);
    setEditImageFile(null);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  }

  function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { setEditImageFile(file); setEditImagePreview(URL.createObjectURL(file)); }
  }

  function handleAdd() {
    const fd = new FormData();
    fd.append('name', addName);
    fd.append('category_slug', addCategory.toLowerCase().replace(/\s+/g, '-'));
    fd.append('price', addPrice);
    fd.append('stock', addStock);
    fd.append('sizes', addSizes);
    fd.append('description', addDescription);
    if (imageFile) fd.append('image_file', imageFile);
    createMutation.mutate(fd);
  }

  function handleSaveEdit() {
    if (!editProduct) return;
    const fd = new FormData();
    fd.append('price', editPrice);
    fd.append('stock', editStock);
    fd.append('sizes', editSizes);
    if (editImageFile) fd.append('image_file', editImageFile);
    updateMutation.mutate({ id: editProduct.id, fd });
  }

  function confirmDelete() {
    if (!deleteProduct) return;
    deleteMutation.mutate(deleteProduct.id);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:p-8">
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Products</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of all products and their current inventory status
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => { resetAddForm(); setAddOpen(true); }}
            className="bg-[#3B82F6] hover:bg-[#2563EB] text-white h-10 px-5 gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          Failed to load products. Make sure the backend is running.
        </div>
      )}

      {/* Table card */}
      <div className="rounded-xl border border-black/5 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 bg-muted/30">
                <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Category</th>
                <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Price</th>
                <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Inventory</th>
                <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isLoading
                ? [...Array(PAGE_SIZE)].map((_, i) => <SkeletonRow key={i} />)
                : products.map((p) => {
                    const inStock = p.inventory > 0;
                    return (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-black/5 bg-slate-100">
                              {p.image
                                ? <img src={p.image} alt={p.name} className="h-10 w-10 object-cover" />
                                : <div className="h-10 w-10 flex items-center justify-center text-muted-foreground"><Box className="h-4 w-4" /></div>
                              }
                            </div>
                            <span className="font-medium text-foreground">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-2.5 whitespace-nowrap text-muted-foreground">{p.category}</td>
                        <td className="px-5 py-2.5 whitespace-nowrap text-foreground">${Number(p.price).toFixed(2)}</td>
                        <td className="px-5 py-2.5 whitespace-nowrap text-muted-foreground">{p.inventory} in stock</td>
                        <td className="px-5 py-2.5 whitespace-nowrap">
                          <span className={cn(
                            'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
                            inStock ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-600 border border-red-200'
                          )}>
                            {inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(p)}
                              className="h-8 w-8 flex items-center justify-center rounded-md border border-black/10 text-muted-foreground hover:text-foreground hover:border-black/20 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteProduct(p)}
                              className="h-8 w-8 flex items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-black/5 px-5 py-3">
          <p className="text-xs text-primary">
            Showing {totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} products
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="h-8 w-8 flex items-center justify-center rounded-md border border-black/10 text-muted-foreground hover:bg-muted/50 disabled:opacity-40 disabled:pointer-events-none transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={cn('h-8 w-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors',
                  page === p ? 'bg-[#3B82F6] text-white' : 'border border-black/10 text-muted-foreground hover:bg-muted/50')}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
              className="h-8 w-8 flex items-center justify-center rounded-md border border-black/10 text-muted-foreground hover:bg-muted/50 disabled:opacity-40 disabled:pointer-events-none transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ══ ADD PRODUCT MODAL ══════════════════════════════════════════════════ */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-xl p-0 gap-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-6 pt-6 pb-4">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-500">
                <Box className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-[#3B82F6]">Add New Product</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">Fill in the details to add a new product</p>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-5 overflow-y-auto max-h-[65vh]">
            <h4 className="text-sm font-semibold">Product Details</h4>
            <div className="space-y-1.5">
              <Label htmlFor="productName">Product Name</Label>
              <Input id="productName" placeholder="e.g., Premium ADHD T-Shirt" value={addName} onChange={e => setAddName(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="addCategory">Category Slug</Label>
                <Input id="addCategory" placeholder="e.g., t-shirts" value={addCategory} onChange={e => setAddCategory(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addPrice">Price ($)</Label>
                <Input id="addPrice" placeholder="65.00" type="number" min={0} value={addPrice} onChange={e => setAddPrice(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="addStock">Stock</Label>
                <Input id="addStock" placeholder="42" type="number" min={0} value={addStock} onChange={e => setAddStock(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addSizes">Sizes (comma-separated)</Label>
                <Input id="addSizes" placeholder="S,M,L,XL" value={addSizes} onChange={e => setAddSizes(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addDesc">Description</Label>
              <Input id="addDesc" placeholder="Short product description" value={addDescription} onChange={e => setAddDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Product Image</Label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full sm:w-48 h-32 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/15 text-muted-foreground hover:border-primary/40 transition-colors overflow-hidden"
              >
                {imagePreview
                  ? <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  : <><UploadCloud className="h-5 w-5" /><span className="text-xs">Add product image</span></>
                }
              </button>
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-black/5 px-6 py-4">
            <Button variant="outline" onClick={() => setAddOpen(false)} className="w-full sm:w-auto h-10 px-6 rounded-lg">Cancel</Button>
            <Button
              onClick={handleAdd}
              disabled={createMutation.isPending}
              className="w-full sm:w-auto h-10 px-6 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white gap-2"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ EDIT PRODUCT MODAL ════════════════════════════════════════════════ */}
      <Dialog open={!!editProduct} onOpenChange={(o) => !o && setEditProduct(null)}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-black/5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-500">
                <Pencil className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-[#3B82F6]">Edit Product</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">Update status, price and inventory variants</p>
              </div>
            </div>
          </DialogHeader>

          <div className="px-6 py-5 space-y-6 overflow-y-auto max-h-[65vh]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="editPrice">Price ($)</Label>
                <Input id="editPrice" type="number" min={0} value={editPrice} onChange={e => setEditPrice(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="editStock">Total Stock</Label>
                <Input id="editStock" type="number" min={0} value={editStock} onChange={e => setEditStock(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editSizes">Sizes (comma-separated)</Label>
              <Input id="editSizes" placeholder="S,M,L,XL" value={editSizes} onChange={e => setEditSizes(e.target.value)} />
            </div>

            {/* Inventory Variants (read-only display from API) */}
            {editVariants.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Current Inventory by Variant</Label>
                <div className="rounded-xl border border-black/8 overflow-hidden divide-y divide-black/5">
                  <div className="grid grid-cols-2 bg-muted/40 px-4 py-2.5">
                    <span className="text-xs font-medium text-muted-foreground">Size</span>
                    <span className="text-xs font-medium text-muted-foreground">Stock</span>
                  </div>
                  {editVariants.map((v) => (
                    <div key={v.size} className="grid grid-cols-2 items-center px-4 py-3">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-black/10 bg-white text-xs font-semibold">{v.size}</span>
                      <span className="text-sm text-foreground">{v.stock}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Image */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Product Image</Label>
              <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={handleEditImageChange} />
              <div className="flex items-end gap-4">
                <div className="h-24 w-24 shrink-0 rounded-xl overflow-hidden border border-black/10 bg-slate-100">
                  {editImagePreview
                    ? <img src={editImagePreview} alt="Product" className="h-full w-full object-cover" />
                    : <div className="h-full w-full flex items-center justify-center text-muted-foreground"><Box className="h-8 w-8" /></div>
                  }
                </div>
                <button
                  type="button"
                  onClick={() => editFileRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 h-24 flex-1 rounded-xl border-2 border-dashed border-black/15 text-muted-foreground hover:border-primary/40 transition-colors text-xs"
                >
                  <UploadCloud className="h-5 w-5" />
                  Replace image
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-black/5 px-6 py-4">
            <Button variant="outline" onClick={() => setEditProduct(null)} className="w-full sm:w-auto h-10 px-6 rounded-lg">Cancel</Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
              className="w-full sm:w-auto h-10 px-6 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white gap-2"
            >
              {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ DELETE CONFIRMATION MODAL ══════════════════════════════════════════ */}
      <Dialog open={!!deleteProduct} onOpenChange={(o) => !o && setDeleteProduct(null)}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl" showCloseButton={false}>
          <div className="px-8 pt-10 pb-6 flex flex-col items-center text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-100">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Delete Product?</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Are you sure you want to delete{' '}
                <span className="font-medium text-foreground">&ldquo;{deleteProduct?.name}&rdquo;</span>?<br />
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 border-t border-black/5 px-8 py-5">
            <Button
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="w-full h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium gap-2"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Yes, Delete
            </Button>
            <Button variant="outline" onClick={() => setDeleteProduct(null)} className="w-full h-11 rounded-xl font-medium">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
