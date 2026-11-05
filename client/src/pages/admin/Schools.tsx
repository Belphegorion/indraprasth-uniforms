import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  Upload,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import {
  useAdminSchools,
  useCreateSchool,
  useUpdateSchool,
  useDeleteSchool,
  useUploadImage,
} from '../../api';
import { schoolCreateSchema, ISchool } from '@indraprasth/shared';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

export const Schools: React.FC = () => {
  const { data: schools, isLoading, refetch } = useAdminSchools();
  const createSchoolMutation = useCreateSchool();
  const updateSchoolMutation = useUpdateSchool();
  const deleteSchoolMutation = useDeleteSchool();
  const uploadImageMutation = useUploadImage();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<ISchool | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schoolCreateSchema),
    defaultValues: {
      name: '',
      code: '',
      slug: '',
      branchLabel: '',
      logoUrl: '',
      isActive: true,
    },
  });

  const logoUrlValue = watch('logoUrl');

  const openCreateModal = () => {
    setEditingSchool(null);
    reset({
      name: '',
      code: '',
      slug: '',
      branchLabel: '',
      logoUrl: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (school: any) => {
    setEditingSchool(school);
    reset({
      name: school.name,
      code: school.code,
      slug: school.slug,
      branchLabel: school.branchLabel || '',
      logoUrl: school.logoUrl || '',
      isActive: school.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadImageMutation.mutateAsync(file);
      setValue('logoUrl', res.url, { shouldValidate: true });
      toast.success('School logo uploaded successfully');
    } catch (err: any) {
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: any) => {
    try {
      if (editingSchool) {
        await updateSchoolMutation.mutateAsync({
          id: (editingSchool as any)._id,
          data: values,
        });
        toast.success(`School "${values.name}" updated!`);
      } else {
        await createSchoolMutation.mutateAsync(values);
        toast.success(`School "${values.name}" created!`);
      }
      setModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (school: any) => {
    if (
      window.confirm(
        `Are you sure you want to deactivate ${school.name} (${school.code})?`
      )
    ) {
      try {
        await deleteSchoolMutation.mutateAsync(school._id);
        toast.success('School deactivated');
        refetch();
      } catch (err: any) {
        toast.error(
          err.response?.data?.error ||
            'Cannot deactivate school while active products exist'
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Schools | Admin - Indraprasth Uniforms</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800 font-serif tracking-tight">
            Partner Schools & Colleges
          </h1>
          <p className="text-xs sm:text-sm text-taupe-500 mt-1">
            Manage school codes, official emblems, and assigned campus uniform catalogs.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-bold text-xs shadow-md shadow-navy-900/10 btn-tactile transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add School</span>
        </button>
      </div>

      {/* Schools Grid / Table */}
      <div className="bg-cream-50 rounded-3xl border border-sand-300 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : !schools || schools.length === 0 ? (
          <div className="text-center py-16 px-4">
            <GraduationCap className="w-12 h-12 text-taupe-500/60 mx-auto mb-3" />
            <h3 className="text-base font-bold text-navy-800 font-serif">No schools listed yet</h3>
            <p className="text-xs text-taupe-500 mt-1">
              Add Delhi Public School, SPS, St. Joseph's or other Bhopal institutions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-sand-300 bg-sand-200/70 text-navy-800 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">School Details</th>
                  <th className="py-3 px-4">School Code</th>
                  <th className="py-3 px-4">Branch / Campus</th>
                  <th className="py-3 px-4">Active Uniforms</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {schools.map((school: any) => (
                  <tr key={school._id} className="hover:bg-sand-200/40 transition-colors">
                    {/* Name + Logo */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {school.logoUrl ? (
                          <img
                            src={school.logoUrl}
                            alt={school.name}
                            className="w-10 h-10 rounded-xl object-contain bg-cream-100 border border-sand-300 p-0.5 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center font-black text-blue-600 text-xs shrink-0 font-serif">
                            {school.code.slice(0, 3)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-navy-800">{school.name}</div>
                          <a
                            href={`/schools/${school.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <span>/schools/{school.slug}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-sand-200/80 text-navy-800 font-black text-[11px] font-mono border border-sand-300">
                        {school.code}
                      </span>
                    </td>

                    {/* Campus */}
                    <td className="py-3.5 px-4 text-slate">
                      {school.branchLabel || 'Main Campus, Bhopal'}
                    </td>

                    {/* Uniform Count */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-navy-800">
                        {school.productCount ?? 0} products
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {school.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="neutral">Inactive</Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(school)}
                          className="p-1.5 rounded-lg text-slate hover:text-blue-600 hover:bg-sand-200/60 transition-colors"
                          title="Edit School"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(school)}
                          className="p-1.5 rounded-lg text-taupe-500 hover:text-crimson-600 hover:bg-crimson-100 transition-colors"
                          title="Deactivate School"
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

      {/* School Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSchool ? 'Edit School Details' : 'Add Partner School'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-navy-800">School Name *</label>
            <input
              type="text"
              {...register('name')}
              placeholder="Delhi Public School Bhopal"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 placeholder:text-taupe-500"
            />
            {errors.name && (
              <p className="text-[11px] text-crimson-600 font-semibold">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-navy-800">School Code * (e.g. DPS)</label>
              <input
                type="text"
                {...register('code')}
                placeholder="DPS"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 placeholder:text-taupe-500 uppercase font-mono font-bold"
              />
              {errors.code && (
                <p className="text-[11px] text-crimson-600 font-semibold">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-navy-800">URL Slug *</label>
              <input
                type="text"
                {...register('slug')}
                placeholder="dps-bhopal"
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 placeholder:text-taupe-500 font-mono"
              />
              {errors.slug && (
                <p className="text-[11px] text-crimson-600 font-semibold">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-navy-800">Campus / Branch Label</label>
            <input
              type="text"
              {...register('branchLabel')}
              placeholder="e.g. Bhadbhada Road or Kolar Road"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 placeholder:text-taupe-500"
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-navy-800">School Emblem / Logo</label>
            <div className="flex items-center gap-3">
              {logoUrlValue && (
                <img
                  src={logoUrlValue}
                  alt="School Emblem"
                  className="w-12 h-12 rounded-xl object-contain bg-cream-100 border border-sand-300 p-1"
                />
              )}
              <label
                htmlFor="school-logo-input"
                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sand-200 hover:bg-sand-300 text-navy-800 text-xs font-bold transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading...' : 'Upload Logo'}</span>
              </label>
              <input
                id="school-logo-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={isUploading}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="school-active"
              {...register('isActive')}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-sand-300"
            />
            <label htmlFor="school-active" className="text-xs font-bold text-navy-800">
              Active in storefront & quick-switch
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
              disabled={isSubmitting || isUploading}
              className="px-5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-navy-900/10 btn-tactile transition-all"
            >
              {isSubmitting ? 'Saving...' : editingSchool ? 'Save Changes' : 'Create School'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
