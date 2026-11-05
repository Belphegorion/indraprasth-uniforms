import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Plus,
  Search,
  Upload,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  useAdminProducts,
  useAdminSchools,
  useAdminCategories,
  useUpdateProduct,
  useDeleteProduct,
  useImportProductsCsv,
} from '../../api';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import { SEASONS, TYPE_GROUPS, GENDERS } from '@indraprasth/shared';
import toast from 'react-hot-toast';

export const Products: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [selectedTypeGroup, setSelectedTypeGroup] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // CSV Import state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importReport, setImportReport] = useState<{
    importedCount: number;
    totalRows: number;
    errors: Array<{ row: number; error: string }>;
  } | null>(null);

  // API hooks
  const { data: schools } = useAdminSchools();
  const { data: categories } = useAdminCategories();
  const {
    data: productsData,
    isLoading,
    refetch,
  } = useAdminProducts({
    q: search,
    school: selectedSchool,
    category: selectedCategory,
    gender: selectedGender,
    season: selectedSeason,
    typeGroup: selectedTypeGroup,
    isActive: statusFilter,
    page,
    limit: 15,
  });

  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const importCsvMutation = useImportProductsCsv();

  const products = productsData?.items || [];
  const totalPages = productsData?.totalPages || 1;

  // Toggle active state
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateProductMutation.mutateAsync({
        id,
        data: { isActive: !currentStatus },
      });
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'}`);
      refetch();
    } catch (err: any) {
      toast.error('Failed to update product status');
    }
  };

  // Delete product (soft-delete)
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to deactivate/delete "${name}"?`)) {
      try {
        await deleteProductMutation.mutateAsync(id);
        toast.success(`Product deactivated`);
        refetch();
      } catch (err: any) {
        toast.error('Failed to delete product');
      }
    }
  };

  // Bulk activate/deactivate
  const handleBulkStatusChange = async (newStatus: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          updateProductMutation.mutateAsync({ id, data: { isActive: newStatus } })
        )
      );
      toast.success(
        `${selectedIds.length} products ${newStatus ? 'activated' : 'deactivated'}`
      );
      setSelectedIds([]);
      refetch();
    } catch (err) {
      toast.error('Bulk update failed');
    }
  };

  // Handle CSV import submit
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error('Please select a CSV file to upload');
      return;
    }
    try {
      const res = await importCsvMutation.mutateAsync(csvFile);
      setImportReport(res);
      toast.success(`Import complete: ${res.importedCount} products processed.`);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Import failed');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(
        products
          .map((p) => (p._id || p.id || '') as string)
          .filter((id) => Boolean(id))
      );
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage Uniform Products | Admin - Indraprasth Uniforms</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-navy-800 tracking-tight">
            Uniform Products
          </h1>
          <p className="text-xs sm:text-sm text-slate mt-1 font-sans">
            Manage school uniforms, sizing tiers, inventory stocks, and catalog pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setImportReport(null);
              setCsvFile(null);
              setImportModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-sand-300 hover:bg-sand-200/50 text-slate font-bold text-xs transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4 text-slate" />
            <span>Import CSV</span>
          </button>

          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-cream-50 font-bold text-xs shadow-sm transition-all btn-tactile"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-cream-50 p-4 rounded-xl border border-sand-300 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
          {/* Search */}
          <div className="relative xl:col-span-1">
            <Search className="w-4 h-4 text-slate/70 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title/SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* School Filter */}
          <div>
            <select
              value={selectedSchool}
              onChange={(e) => {
                setSelectedSchool(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="">All Schools</option>
              {schools?.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="">All Categories</option>
              {categories?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Season Filter */}
          <div>
            <select
              value={selectedSeason}
              onChange={(e) => {
                setSelectedSeason(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="">All Seasons</option>
              {SEASONS.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s === 'all' ? 'All-season' : s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Type Group Filter */}
          <div>
            <select
              value={selectedTypeGroup}
              onChange={(e) => {
                setSelectedTypeGroup(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="">All Types</option>
              {TYPE_GROUPS.map((tg) => (
                <option key={tg} value={tg} className="capitalize">
                  {tg.charAt(0).toUpperCase() + tg.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={selectedGender}
              onChange={(e) => {
                setSelectedGender(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="">All Genders</option>
              {GENDERS.map((g) => (
                <option key={g} value={g} className="capitalize">
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Active Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2.5 rounded-lg border border-sand-300 bg-cream-100/60 focus:bg-cream-50 text-ink focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-100/60 border border-blue-600/30 rounded-lg text-xs">
            <span className="font-semibold text-navy-800">
              {selectedIds.length} products selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatusChange(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold transition-colors shadow-sm"
              >
                Mark Active
              </button>
              <button
                onClick={() => handleBulkStatusChange(false)}
                className="px-3 py-1.5 rounded-lg bg-crimson-600 hover:bg-crimson-700 text-white font-bold transition-colors shadow-sm"
              >
                Mark Inactive
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-cream-50 rounded-xl border border-sand-300 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Layers className="w-12 h-12 text-sand-300 mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-navy-800">No products found</h3>
            <p className="text-xs text-slate mt-1 font-sans">
              Try adjusting your search criteria or add your first uniform product.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-sand-300 bg-sand-200/70 text-navy-800 font-serif font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        products.length > 0 && selectedIds.length === products.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-sand-300 text-blue-600 focus:ring-blue-600"
                    />
                  </th>
                  <th className="py-3 px-4">Product Details</th>
                  <th className="py-3 px-4">School / Branch</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-4">Stock Breakdown</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {products.map((prod) => {
                  const prodId = (prod._id || prod.id || '') as string;
                  const schoolObj = prod.school as any;
                  const catObj = prod.category as any;
                  const totalStock = prod.sizes.reduce(
                    (acc, s) => acc + (s.stock || 0),
                    0
                  );
                  const isLow = totalStock <= 10;
                  const isSelected = selectedIds.includes(prodId);

                  return (
                    <tr
                      key={prodId}
                      className={`hover:bg-sand-200/40 transition-colors ${
                        isSelected ? 'bg-blue-100/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(prodId)}
                          className="rounded border-sand-300 text-blue-600 focus:ring-blue-600"
                        />
                      </td>

                      {/* Image & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              prod.images?.[0]?.url ||
                              'https://res.cloudinary.com/dvaynkflu/image/upload/v1791370845/indraprasth/products/ngfiqedvngrgzvuc12td.png'
                            }
                            alt={prod.name}
                            className="w-12 h-12 rounded-lg object-cover bg-sand-200 border border-sand-300 shrink-0"
                          />
                          <div>
                            <Link
                              to={`/admin/products/${prodId}`}
                              className="font-serif font-bold text-navy-800 hover:text-blue-600 text-xs block leading-snug line-clamp-1"
                            >
                              {prod.name}
                            </Link>
                            <span className="text-[10px] text-slate font-mono block mt-0.5">
                              {prod.sku || prod.slug}
                            </span>
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {prod.season && (
                                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-sand-200 text-navy-800 border border-sand-300">
                                  {prod.season}
                                </span>
                              )}
                              {prod.typeGroup && (
                                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-100 text-navy-800 border border-blue-600/30">
                                  {prod.typeGroup}
                                </span>
                              )}
                              {prod.itemType && (
                                <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-cream-100 text-slate border border-sand-300">
                                  {prod.itemType}
                                </span>
                              )}
                              {prod.gender && (
                                <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-sand-200 text-navy-800">
                                  {prod.gender}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* School */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-navy-800 font-bold text-[10px] uppercase tracking-wide border border-blue-600/30">
                          {schoolObj?.code || 'GEN'}
                        </span>
                        <span className="text-[11px] text-slate block mt-0.5 line-clamp-1 font-serif">
                          {schoolObj?.name || 'All Schools'}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate font-medium">
                        {catObj?.name || 'Winter-ware'}
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-navy-800 font-sans">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </div>
                        {prod.mrp && prod.mrp > prod.price && (
                          <div className="text-[10px] text-taupe-500 line-through font-sans">
                            ₹{prod.mrp.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      {/* Stock Breakdown */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-bold font-sans text-xs ${
                              isLow ? 'text-crimson-600' : 'text-navy-800'
                            }`}
                          >
                            {totalStock} units
                          </span>
                          {isLow && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-crimson-100 text-crimson-700 font-bold">
                              Low
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate font-mono mt-0.5 line-clamp-1">
                          {prod.sizes.map((s) => `${s.label}:${s.stock}`).join(', ')}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(prodId, prod.isActive)}
                          className="flex items-center gap-1.5 text-xs font-semibold"
                        >
                          {prod.isActive ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="navy">Draft</Badge>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/products/${prodId}`}
                            className="p-1.5 rounded-lg text-slate hover:text-blue-600 hover:bg-sand-200 transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(prodId, prod.name)}
                            className="p-1.5 rounded-lg text-slate hover:text-crimson-600 hover:bg-crimson-100/50 transition-colors"
                            title="Deactivate Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-sand-300 flex items-center justify-between text-xs font-sans">
            <span className="text-slate">
              Page <span className="font-bold text-navy-800">{page}</span> of{' '}
              <span className="font-bold text-navy-800">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-sand-300 disabled:opacity-40 hover:bg-sand-200 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg border border-sand-300 disabled:opacity-40 hover:bg-sand-200 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSV Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Uniform Products from CSV"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate">
            Upload a CSV containing school uniforms catalog data. Required columns:{' '}
            <code className="bg-sand-200 px-1 py-0.5 rounded text-navy-800 font-mono">
              name, price, schoolCode, category, imageUrl
            </code>
            .
          </p>

          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-sand-300 hover:border-blue-600 rounded-xl p-6 text-center transition-colors">
              <Upload className="w-8 h-8 text-slate/70 mx-auto mb-2" />
              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                className="hidden"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              />
              <label
                htmlFor="csv-file-input"
                className="cursor-pointer text-xs font-bold text-blue-600 hover:underline block"
              >
                {csvFile ? csvFile.name : 'Click to select CSV file'}
              </label>
              <p className="text-[10px] text-slate mt-1 font-mono">UTF-8 encoded CSV up to 10MB</p>
            </div>

            {/* Error Report if any */}
            {importReport && (
              <div className="p-4 bg-sand-200/50 border border-sand-300 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy-800 font-sans">
                    Import Result: {importReport.importedCount} / {importReport.totalRows} Rows
                  </span>
                  {importReport.errors.length === 0 ? (
                    <span className="text-success-text font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> All clean
                    </span>
                  ) : (
                    <span className="text-crimson-600 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {importReport.errors.length} Issues
                    </span>
                  )}
                </div>

                {importReport.errors.length > 0 && (
                  <div className="max-h-36 overflow-y-auto space-y-1 pt-2 border-t border-sand-300">
                    {importReport.errors.map((err, idx) => (
                      <div key={idx} className="text-[11px] text-crimson-600 flex gap-2">
                        <span className="font-mono font-bold shrink-0">Row {err.row}:</span>
                        <span>{err.error}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-lg text-slate font-bold text-xs hover:bg-sand-200 transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={!csvFile || importCsvMutation.isPending}
                className="px-4 py-2 rounded-lg bg-navy-800 hover:bg-navy-700 disabled:opacity-50 text-cream-50 font-bold text-xs shadow-sm transition-all btn-tactile"
              >
                {importCsvMutation.isPending ? 'Processing...' : 'Upload & Import'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
