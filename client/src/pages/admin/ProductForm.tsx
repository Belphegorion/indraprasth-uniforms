import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Upload,
  Trash2,
  Plus,
  Star,
  Check,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import {
  useAdminProduct,
  useAdminSchools,
  useAdminCategories,
  useCreateProduct,
  useUpdateProduct,
  useUploadImage,
} from '../../api';
import {
  productCreateSchema,
  TYPE_GROUPS,
  SEASONS,
  ITEM_TYPES_BY_GROUP,
  ProductSeason,
  ProductTypeGroup,
} from '@indraprasth/shared';
import toast from 'react-hot-toast';

const DEFAULT_SIZES = [
  { label: '26', stock: 15 },
  { label: '28', stock: 20 },
  { label: '30', stock: 25 },
  { label: '32', stock: 20 },
  { label: '34', stock: 15 },
  { label: '36', stock: 10 },
];

export const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id && id !== 'new');
  const navigate = useNavigate();

  const { data: schools } = useAdminSchools();
  const { data: categories } = useAdminCategories();
  const { data: existingProduct, isLoading: productLoading } = useAdminProduct(id || '');

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const uploadImageMutation = useUploadImage();

  const [isUploading, setIsUploading] = useState(false);
  const [manualSlug, setManualSlug] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      mrp: 0,
      school: '',
      category: '',
      images: [] as Array<{ url: string; publicId: string }>,
      sizes: DEFAULT_SIZES,
      gender: 'unisex' as 'boys' | 'girls' | 'unisex',
      season: 'all' as ProductSeason,
      typeGroup: 'tops' as ProductTypeGroup,
      itemType: 'Shirt',
      isActive: true,
      isFeatured: false,
      sku: '',
    },
  });

  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({
    control,
    name: 'sizes',
  });

  const images = watch('images') || [];
  const nameValue = watch('name');
  const selectedTypeGroup = (watch('typeGroup') || 'tops') as ProductTypeGroup;

  // Slugify helper
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  // Auto generate slug if not edited manually
  useEffect(() => {
    if (!manualSlug && nameValue && !isEdit) {
      setValue('slug', slugify(nameValue), { shouldValidate: true });
    }
  }, [nameValue, manualSlug, isEdit, setValue]);

  // Load existing data in edit mode
  useEffect(() => {
    if (existingProduct) {
      reset({
        name: existingProduct.name,
        slug: existingProduct.slug,
        description: existingProduct.description,
        price: existingProduct.price,
        mrp: existingProduct.mrp || 0,
        school:
          typeof existingProduct.school === 'object'
            ? (existingProduct.school as any)._id
            : existingProduct.school,
        category:
          typeof existingProduct.category === 'object'
            ? (existingProduct.category as any)._id
            : existingProduct.category,
        images: existingProduct.images || [],
        sizes: existingProduct.sizes || DEFAULT_SIZES,
        gender: existingProduct.gender || 'unisex',
        season: existingProduct.season || 'all',
        typeGroup: existingProduct.typeGroup || 'tops',
        itemType: existingProduct.itemType || 'Shirt',
        isActive: existingProduct.isActive ?? true,
        isFeatured: existingProduct.isFeatured ?? false,
        sku: existingProduct.sku || '',
      });
      setManualSlug(true);
    }
  }, [existingProduct, reset]);

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5 MB limit.`);
          continue;
        }
        const uploaded = await uploadImageMutation.mutateAsync(file);
        const currentImages = watch('images') || [];
        setValue('images', [...currentImages, uploaded], { shouldValidate: true });
      }
      toast.success('Images uploaded successfully to Cloudinary');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSetPrimary = (index: number) => {
    const current = [...images];
    const [selected] = current.splice(index, 1);
    current.unshift(selected);
    setValue('images', current, { shouldValidate: true });
  };

  const handleRemoveImage = (index: number) => {
    const current = [...images];
    current.splice(index, 1);
    setValue('images', current, { shouldValidate: true });
  };

  const onSubmit = async (values: any) => {
    try {
      if (isEdit && id) {
        await updateProductMutation.mutateAsync({ id, data: values });
        toast.success('Uniform product updated successfully!');
      } else {
        await createProductMutation.mutateAsync(values);
        toast.success('Uniform product created successfully!');
      }
      navigate('/admin/products');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Operation failed';
      toast.error(msg);
    }
  };

  if (isEdit && productLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-96 bg-white rounded-3xl p-6 border border-slate-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Helmet>
        <title>
          {isEdit ? 'Edit Uniform Product' : 'Create New Product'} | Admin - Indraprasth Uniforms
        </title>
      </Helmet>

      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 rounded-lg bg-cream-50 border border-sand-300 text-slate hover:text-navy-800 shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-navy-800 tracking-tight">
              {isEdit ? 'Edit Product' : 'Add New Uniform Product'}
            </h1>
            <p className="text-xs text-slate font-sans">
              Configure uniform school assignment, sizes, stocks, and media gallery.
            </p>
          </div>
        </div>

        {isDirty && (
          <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Unsaved changes
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Details Card */}
        <div className="bg-cream-50 p-6 sm:p-8 rounded-xl border border-sand-300 shadow-sm space-y-5 text-ink">
          <h2 className="text-xs font-serif uppercase tracking-wider text-brass-text font-bold">
            1. Core Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Product Name *</label>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g. DPS Winter Blazer"
                className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
              />
              {errors.name && (
                <p className="text-[11px] text-crimson-600 font-semibold">{errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-1">
              <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold flex items-center justify-between">
                <span>URL Slug *</span>
                <span className="text-[10px] text-slate/70 font-normal">
                  Auto-synced from name
                </span>
              </label>
              <input
                type="text"
                {...register('slug')}
                onChange={() => setManualSlug(true)}
                placeholder="dps-winter-blazer"
                className="w-full text-xs px-4 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
              />
              {errors.slug && (
                <p className="text-[11px] text-crimson-600 font-semibold">{errors.slug.message}</p>
              )}
            </div>

            {/* SKU */}
            <div className="space-y-1">
              <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">SKU Code (Optional)</label>
              <input
                type="text"
                {...register('sku')}
                placeholder="e.g. IU-DPS-BLAZ-30"
                className="w-full text-xs px-4 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>

            {/* School Select */}
            <div className="space-y-1">
              <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">School / Institution *</label>
              <select
                {...register('school')}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
              >
                <option value="">-- Choose Institution --</option>
                {schools?.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
              {errors.school && (
                <p className="text-[11px] text-crimson-600 font-semibold">{errors.school.message}</p>
              )}
            </div>

            {/* Category Select */}
            <div className="space-y-1">
              <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Uniform Category *</label>
              <select
                {...register('category')}
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
              >
                <option value="">-- Choose Category --</option>
                {categories?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-[11px] text-crimson-600 font-semibold">{errors.category.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Description & Fabric Notes *</label>
              <textarea
                rows={3}
                {...register('description')}
                placeholder="High quality regulation school blazer with brass buttons, durable inner lining and superior shape retention..."
                className="w-full text-xs px-4 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
              />
              {errors.description && (
                <p className="text-[11px] text-crimson-600 font-semibold">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Garment Taxonomy Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:col-span-2 p-4 bg-sand-200/50 rounded-lg border border-sand-300">
              {/* Gender */}
              <div className="space-y-1">
                <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Gender</label>
                <select
                  {...register('gender')}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                >
                  <option value="unisex">Unisex</option>
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                </select>
              </div>

              {/* Season */}
              <div className="space-y-1">
                <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Season</label>
                <select
                  {...register('season')}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                >
                  <option value="all">All-season</option>
                  <option value="winter">Winter</option>
                  <option value="summer">Summer</option>
                </select>
              </div>

              {/* Type Group */}
              <div className="space-y-1">
                <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Garment Group</label>
                <select
                  {...register('typeGroup')}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                >
                  {TYPE_GROUPS.map((tg) => (
                    <option key={tg} value={tg}>
                      {tg.charAt(0).toUpperCase() + tg.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Type (Dependent select) */}
              <div className="space-y-1">
                <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Item Type *</label>
                <select
                  {...register('itemType')}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans font-medium"
                >
                  {(ITEM_TYPES_BY_GROUP[selectedTypeGroup] || ['Shirt']).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                {errors.itemType && (
                  <p className="text-[11px] text-crimson-600 font-semibold">{errors.itemType.message}</p>
                )}
              </div>
            </div>

            {/* Price & MRP */}
            <div className="grid grid-cols-2 gap-2 sm:col-span-2">
              <div className="space-y-1">
                <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">Selling Price (₹) *</label>
                <input
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="1650"
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-bold"
                />
                {errors.price && (
                  <p className="text-[11px] text-crimson-600 font-semibold">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-serif uppercase tracking-wider text-slate font-bold">MRP / List (₹)</label>
                <input
                  type="number"
                  {...register('mrp', { valueAsNumber: true })}
                  placeholder="1800"
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Media Gallery Card */}
        <div className="bg-cream-50 p-6 sm:p-8 rounded-xl border border-sand-300 shadow-sm space-y-4 text-ink">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-serif uppercase tracking-wider text-brass-text font-bold">
                2. Product Media (Cloudinary)
              </h2>
              <p className="text-xs text-slate">
                Uploaded to folder{' '}
                <code className="bg-sand-200 px-1 py-0.5 rounded font-mono text-navy-800">
                  indraprasth/products/
                </code>
              </p>
            </div>
            <label
              htmlFor="product-media-upload"
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-cream-50 text-xs font-bold transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Uploading...' : 'Upload Photos'}</span>
            </label>
            <input
              id="product-media-upload"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </div>

          {errors.images && (
            <p className="text-xs text-crimson-600 font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.images.message}
            </p>
          )}

          {/* Image Previews */}
          {images.length === 0 ? (
            <div className="border-2 border-dashed border-sand-300 rounded-xl p-8 text-center">
              <Upload className="w-8 h-8 text-slate/50 mx-auto mb-2" />
              <p className="text-xs text-slate">No images yet. Click upload button above.</p>
              <p className="text-[10px] text-slate/70 mt-0.5 font-mono">JPEG, PNG, WebP up to 5MB each</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div
                  key={img.publicId || idx}
                  className="relative group rounded-xl overflow-hidden border border-sand-300 aspect-square bg-sand-200 shadow-sm"
                >
                  <img
                    src={img.url}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-md shadow-md">
                      PRIMARY
                    </span>
                  )}
                  <div className="absolute inset-0 bg-navy-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="p-1.5 rounded-lg bg-cream-50 text-navy-800 hover:bg-white text-xs font-bold shadow-sm"
                        title="Set Primary Image"
                      >
                        <Star className="w-4 h-4 text-brass" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 rounded-lg bg-crimson-600 text-white hover:bg-crimson-700 text-xs shadow-sm"
                      title="Remove Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sizes & Inventory Stock Matrix */}
        <div className="bg-cream-50 p-6 sm:p-8 rounded-xl border border-sand-300 shadow-sm space-y-4 text-ink">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-serif uppercase tracking-wider text-brass-text font-bold">
                3. Size Variations & Inventory Stock
              </h2>
              <p className="text-xs text-slate">
                Specify available sizes and on-hand inventory for each size.
              </p>
            </div>

            <button
              type="button"
              onClick={() => appendSize({ label: '', stock: 20 })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sand-200 hover:bg-navy-800 hover:text-cream-50 text-navy-800 text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Size</span>
            </button>
          </div>

          <div className="space-y-2">
            {sizeFields.map((field, idx) => (
              <div
                key={field.id}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-sand-300 bg-sand-200/40"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    {...register(`sizes.${idx}.label` as const)}
                    placeholder="Size (e.g. 30 or Standard)"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-sand-300 bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    {...register(`sizes.${idx}.stock` as const, { valueAsNumber: true })}
                    placeholder="Stock Qty"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-sand-300 bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600 font-bold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSize(idx)}
                  className="p-2 rounded-lg text-slate hover:text-crimson-600 hover:bg-crimson-100/50 transition-colors"
                  title="Remove size"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {errors.sizes && (
            <p className="text-xs text-crimson-600 font-bold">{errors.sizes.message}</p>
          )}
        </div>

        {/* Visibility Toggles */}
        <div className="bg-cream-50 p-6 rounded-xl border border-sand-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-ink">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-navy-800">
              <input
                type="checkbox"
                {...register('isActive')}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-sand-300"
              />
              <span>Active in Storefront</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-navy-800">
              <input
                type="checkbox"
                {...register('isFeatured')}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-sand-300"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brass" />
                <span>Featured on Homepage</span>
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-4 py-2.5 rounded-lg border border-sand-300 text-slate font-bold text-xs hover:bg-sand-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-6 py-2.5 rounded-lg bg-navy-800 hover:bg-navy-700 disabled:opacity-50 text-cream-50 font-serif font-bold text-xs shadow-sm transition-all btn-tactile"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
