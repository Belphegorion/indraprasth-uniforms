import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit, Trash2, FolderTree, AlertCircle } from 'lucide-react';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../api';
import { categoryCreateSchema, ICategory } from '@indraprasth/shared';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

export const Categories: React.FC = () => {
  const { data: categories, isLoading, refetch } = useAdminCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      sortOrder: 0,
      isActive: true,
    },
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    reset({
      name: '',
      slug: '',
      description: '',
      sortOrder: (categories?.length || 0) + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    reset({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      sortOrder: cat.sortOrder ?? 0,
      isActive: cat.isActive ?? true,
    });
    setModalOpen(true);
  };

  const onSubmit = async (values: any) => {
    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: (editingCategory as any)._id,
          data: values,
        });
        toast.success(`Category "${values.name}" updated!`);
      } else {
        await createCategoryMutation.mutateAsync(values);
        toast.success(`Category "${values.name}" created!`);
      }
      setModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (cat: any) => {
    if (window.confirm(`Are you sure you want to deactivate "${cat.name}"?`)) {
      try {
        await deleteCategoryMutation.mutateAsync(cat._id);
        toast.success('Category deactivated');
        refetch();
      } catch (err: any) {
        toast.error(
          err.response?.data?.error ||
            'Cannot deactivate category while active products exist'
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Categories | Admin - Indraprasth Uniforms</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800 font-serif tracking-tight">
            Uniform Categories
          </h1>
          <p className="text-xs sm:text-sm text-taupe-500 mt-1">
            Organize uniforms by season (Winter-ware, Summer-ware) or sector (Hospital, Corporate).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-bold text-xs shadow-md shadow-navy-900/10 btn-tactile transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-cream-50 rounded-3xl border border-sand-300 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : !categories || categories.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FolderTree className="w-12 h-12 text-taupe-500/60 mx-auto mb-3" />
            <h3 className="text-base font-bold text-navy-800 font-serif">No categories found</h3>
            <p className="text-xs text-taupe-500 mt-1">
              Add Winter-ware, Summer-ware, Accessories, Hospital, or Corporate.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-sand-300 bg-sand-200/70 text-navy-800 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">URL Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Sort Order</th>
                  <th className="py-3 px-4">Active Items</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {categories.map((cat: any) => (
                  <tr key={cat._id} className="hover:bg-sand-200/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-navy-800">{cat.name}</td>
                    <td className="py-3.5 px-4 font-mono text-taupe-500">{cat.slug}</td>
                    <td className="py-3.5 px-4 text-slate max-w-xs truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-800">
                      {cat.sortOrder ?? 0}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-navy-800">
                      {cat.productCount ?? 0} products
                    </td>
                    <td className="py-3.5 px-4">
                      {cat.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="neutral">Inactive</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg text-slate hover:text-blue-600 hover:bg-sand-200/60 transition-colors"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 rounded-lg text-taupe-500 hover:text-crimson-600 hover:bg-crimson-100 transition-colors"
                          title="Deactivate Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Uniform Category'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-navy-800">Category Name *</label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Winter-ware"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 placeholder:text-taupe-500"
            />
            {errors.name && (
              <p className="text-[11px] text-crimson-600 font-semibold">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-navy-800">Slug *</label>
              <input
                type="text"
                {...register('slug')}
                placeholder="winter-ware"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 placeholder:text-taupe-500 font-mono"
              />
              {errors.slug && (
                <p className="text-[11px] text-crimson-600 font-semibold">{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-navy-800">Sort Priority Order</label>
              <input
                type="number"
                {...register('sortOrder', { valueAsNumber: true })}
                placeholder="1"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 placeholder:text-taupe-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-navy-800">Description</label>
            <textarea
              rows={2}
              {...register('description')}
              placeholder="Official winter blazers, sweaters, track uppers, thermal shirts & pants"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 placeholder:text-taupe-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="cat-active"
              {...register('isActive')}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-sand-300"
            />
            <label htmlFor="cat-active" className="text-xs font-bold text-navy-800">
              Active in catalog and navigation
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-sand-200">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate font-bold text-xs hover:bg-sand-200/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-navy-900/10 btn-tactile transition-all"
            >
              {isSubmitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
