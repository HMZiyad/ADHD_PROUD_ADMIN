'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Pencil, Trash2, ChevronLeft, ChevronRight,
  UploadCloud, AlertTriangle, RefreshCw, Loader2, NotebookPen, ImageOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { adminService, AdminBlogPost, AdminBlogCategory } from '@/services/admin.service';
import { toast } from 'sonner';

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

// ── Image Upload Widget ───────────────────────────────────────────────────────
function ImageUploader({
  preview, onFile, label = 'Cover Image',
}: {
  preview: string | null;
  onFile: (f: File) => void;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="relative w-full h-36 rounded-xl border-2 border-dashed border-black/10 bg-muted/30 hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2 overflow-hidden"
      >
        {preview ? (
          <img src={preview} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
        ) : (
          <>
            <UploadCloud className="h-7 w-7 text-muted-foreground/60" />
            <span className="text-xs text-muted-foreground">Click to upload image</span>
          </>
        )}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editPost, setEditPost] = useState<AdminBlogPost | null>(null);
  const [deletePost, setDeletePost] = useState<AdminBlogPost | null>(null);

  // Add form
  const [addTitle, setAddTitle] = useState('');
  const [addCategorySlug, setAddCategorySlug] = useState('');
  const [addExcerpt, setAddExcerpt] = useState('');
  const [addContent, setAddContent] = useState('');
  const [addDate, setAddDate] = useState(new Date().toISOString().slice(0, 10));
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);

  // Edit form
  const [editTitle, setEditTitle] = useState('');
  const [editCategorySlug, setEditCategorySlug] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminBlog', page],
    queryFn: () => adminService.getBlogPosts(page, PAGE_SIZE),
    staleTime: 30_000,
  });

  const { data: categories = [] } = useQuery<AdminBlogCategory[]>({
    queryKey: ['adminBlogCategories'],
    queryFn: () => adminService.getBlogCategories(),
    staleTime: 60_000,
    retry: false,
  });

  const posts = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (fd: FormData) => adminService.createBlogPost(fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBlog'] });
      setAddOpen(false);
      resetAddForm();
      toast.success('Blog post created successfully.');
    },
    onError: () => toast.error('Failed to create blog post.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }: { id: number; fd: FormData }) => adminService.updateBlogPost(id, fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBlog'] });
      setEditPost(null);
      toast.success('Blog post updated successfully.');
    },
    onError: () => toast.error('Failed to update blog post.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteBlogPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBlog'] });
      setDeletePost(null);
      toast.success('Blog post deleted.');
    },
    onError: () => toast.error('Failed to delete blog post.'),
  });

  // ── Helpers ───────────────────────────────────────────────────────────────────
  function resetAddForm() {
    setAddTitle(''); setAddCategorySlug(''); setAddExcerpt('');
    setAddContent(''); setAddDate(new Date().toISOString().slice(0, 10));
    setAddImageFile(null); setAddImagePreview(null);
  }

  function openEdit(post: AdminBlogPost) {
    setEditPost(post);
    setEditTitle(post.title);
    setEditCategorySlug(post.category?.slug ?? '');
    setEditExcerpt(post.excerpt);
    setEditContent(post.content);
    setEditDate(post.published_date);
    setEditImageFile(null);
    setEditImagePreview(post.image ?? null);
  }

  function handleAddImageFile(f: File) {
    setAddImageFile(f);
    setAddImagePreview(URL.createObjectURL(f));
  }

  function handleEditImageFile(f: File) {
    setEditImageFile(f);
    setEditImagePreview(URL.createObjectURL(f));
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', addTitle);
    fd.append('excerpt', addExcerpt);
    fd.append('content', addContent);
    fd.append('published_date', addDate);
    if (addCategorySlug) fd.append('category_slug', addCategorySlug);
    if (addImageFile) fd.append('image', addImageFile);
    createMutation.mutate(fd);
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editPost) return;
    const fd = new FormData();
    fd.append('title', editTitle);
    fd.append('excerpt', editExcerpt);
    fd.append('content', editContent);
    fd.append('published_date', editDate);
    if (editCategorySlug) fd.append('category_slug', editCategorySlug);
    if (editImageFile) fd.append('image', editImageFile);
    updateMutation.mutate({ id: editPost.id, fd });
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Blog</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your blog posts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button size="sm" className="gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> New Post
          </Button>
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          Failed to load blog posts. Make sure the backend is running.
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-black/5 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 bg-muted/20">
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Cover</th>
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground hidden md:table-cell">Category</th>
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground hidden lg:table-cell">Author</th>
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground hidden sm:table-cell">Date</th>
              <th className="px-5 py-3.5 text-left font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {isLoading
              ? [...Array(PAGE_SIZE)].map((_, i) => <SkeletonRow key={i} />)
              : posts.length === 0
              ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground">
                    <NotebookPen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                    No blog posts yet. Create your first one!
                  </td>
                </tr>
              )
              : posts.map(post => (
                <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                  {/* Cover thumbnail */}
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="h-12 w-16 rounded-lg overflow-hidden border border-black/5 bg-slate-100 flex items-center justify-center">
                      {post.image
                        ? <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                        : <ImageOff className="h-5 w-5 text-muted-foreground/40" />}
                    </div>
                  </td>
                  {/* Title */}
                  <td className="px-5 py-3 max-w-[200px]">
                    <p className="font-medium text-foreground truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{post.excerpt}</p>
                  </td>
                  {/* Category */}
                  <td className="px-5 py-3 whitespace-nowrap hidden md:table-cell">
                    {post.category
                      ? <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">{post.category.name}</span>
                      : <span className="text-muted-foreground/50 text-xs">—</span>}
                  </td>
                  {/* Author */}
                  <td className="px-5 py-3 whitespace-nowrap text-muted-foreground hidden lg:table-cell">{post.author}</td>
                  {/* Date */}
                  <td className="px-5 py-3 whitespace-nowrap text-muted-foreground hidden sm:table-cell">{post.published_date}</td>
                  {/* Actions */}
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(post)}
                        className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletePost(post)}
                        className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} posts
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 flex items-center justify-center rounded-md border border-black/10 text-muted-foreground disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  'h-8 w-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors',
                  page === p ? 'bg-[#3B82F6] text-white' : 'border border-black/10 text-muted-foreground hover:bg-muted/50'
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded-md border border-black/10 text-muted-foreground disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══ ADD MODAL ═════════════════════════════════════════════════════════════ */}
      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); resetAddForm(); } }}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-black/5">
            <DialogTitle className="text-xl font-semibold">New Blog Post</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <ImageUploader preview={addImagePreview} onFile={handleAddImageFile} />
              <div className="space-y-1.5">
                <Label>Title *</Label>
                <Input value={addTitle} onChange={e => setAddTitle(e.target.value)} placeholder="Post title" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <select
                    value={addCategorySlug}
                    onChange={e => setAddCategorySlug(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">— None —</option>
                    {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Published Date *</Label>
                  <Input type="date" value={addDate} onChange={e => setAddDate(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Excerpt</Label>
                <textarea
                  value={addExcerpt}
                  onChange={e => setAddExcerpt(e.target.value)}
                  placeholder="Short description shown in post listings..."
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Content *</Label>
                <textarea
                  value={addContent}
                  onChange={e => setAddContent(e.target.value)}
                  placeholder="Write your blog post content here (Markdown supported)..."
                  rows={8}
                  required
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y font-mono"
                />
              </div>
            </div>
            <div className="border-t border-black/5 px-6 py-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => { setAddOpen(false); resetAddForm(); }}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white gap-2" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Publish Post
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══ EDIT MODAL ════════════════════════════════════════════════════════════ */}
      <Dialog open={!!editPost} onOpenChange={o => { if (!o) setEditPost(null); }}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-black/5">
            <DialogTitle className="text-xl font-semibold">Edit Blog Post</DialogTitle>
          </DialogHeader>
          {editPost && (
            <form onSubmit={handleUpdate}>
              <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <ImageUploader preview={editImagePreview} onFile={handleEditImageFile} label="Cover Image (leave blank to keep current)" />
                <div className="space-y-1.5">
                  <Label>Title *</Label>
                  <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Post title" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <select
                      value={editCategorySlug}
                      onChange={e => setEditCategorySlug(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">— None —</option>
                      {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Published Date *</Label>
                    <Input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Excerpt</Label>
                  <textarea
                    value={editExcerpt}
                    onChange={e => setEditExcerpt(e.target.value)}
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Content *</Label>
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={8}
                    required
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y font-mono"
                  />
                </div>
              </div>
              <div className="border-t border-black/5 px-6 py-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setEditPost(null)}>Cancel</Button>
                <Button type="submit" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white gap-2" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ══ DELETE MODAL ══════════════════════════════════════════════════════════ */}
      <Dialog open={!!deletePost} onOpenChange={o => { if (!o) setDeletePost(null); }}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-sm p-0 gap-0 overflow-hidden rounded-2xl">
          <div className="p-6 flex flex-col items-center text-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-red-100 bg-red-50">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Delete Post?</h3>
              <p className="text-sm text-muted-foreground mt-1.5">
                Are you sure you want to delete <span className="font-medium text-foreground">"{deletePost?.title}"</span>? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 w-full pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeletePost(null)}>Cancel</Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white gap-2"
                disabled={deleteMutation.isPending}
                onClick={() => deletePost && deleteMutation.mutate(deletePost.id)}
              >
                {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
