import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  MessageSquare,
  Search,
  CheckCircle,
  Building2,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Send,
  Clock,
  Archive,
} from 'lucide-react';
import { useAdminInquiries, useUpdateInquiryStatus } from '../../api';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Modal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export const Inquiries: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);

  const {
    data: inquiriesData,
    isLoading,
    refetch,
  } = useAdminInquiries({
    q: search,
    type: typeFilter,
    status: statusFilter,
    page,
    limit: 15,
  });

  const updateStatusMutation = useUpdateInquiryStatus();

  const inquiries = inquiriesData?.items || [];
  const totalPages = inquiriesData?.totalPages || 1;

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast.success(`Inquiry marked as ${status}`);
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry({ ...selectedInquiry, status });
      }
      refetch();
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Institutional & Contact Inquiries | Admin - Indraprasth Uniforms</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-800 font-serif tracking-tight">
            Customer & Institutional Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-taupe-500 mt-1">
            Review bulk school uniform requests, corporate tenders, and direct parent messages.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-cream-50 p-4 rounded-2xl border border-sand-300 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-taupe-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, organization or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800 placeholder:text-taupe-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800"
            >
              <option value="">All Inquiry Types</option>
              <option value="bulk">Bulk / Institutional Orders</option>
              <option value="contact">General Contact Messages</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-navy-800"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-cream-50 rounded-3xl border border-sand-300 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-16 px-4">
            <MessageSquare className="w-12 h-12 text-taupe-500/60 mx-auto mb-3" />
            <h3 className="text-base font-bold text-navy-800 font-serif">No inquiries found</h3>
            <p className="text-xs text-taupe-500 mt-1">
              Customer inquiries submitted through the contact or bulk forms will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-sand-300 bg-sand-200/70 text-navy-800 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Sender / Organization</th>
                  <th className="py-3 px-4">Message Snippet</th>
                  <th className="py-3 px-4">Estimated Volume</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {inquiries.map((inq: any) => {
                  const dateStr = new Date(inq.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  });

                  return (
                    <tr key={inq._id} className="hover:bg-sand-200/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-taupe-500 whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase tracking-wide border ${
                            inq.type === 'bulk'
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-sand-200/80 text-navy-800 border-sand-300'
                          }`}
                        >
                          {inq.type === 'bulk' ? 'Institutional' : 'Contact'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-navy-800">{inq.name}</div>
                        {inq.organisation && (
                          <div className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" />
                            <span>{inq.organisation}</span>
                          </div>
                        )}
                        <div className="text-[10px] text-taupe-500 font-mono mt-0.5">{inq.phone}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs text-slate truncate">
                        {inq.message}
                      </td>

                      <td className="py-3.5 px-4">
                        {inq.quantityEstimate ? (
                          <span className="font-bold text-navy-800 font-mono">
                            {inq.quantityEstimate} pcs
                          </span>
                        ) : (
                          <span className="text-taupe-500">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            inq.status === 'closed'
                              ? 'neutral'
                              : inq.status === 'contacted'
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {inq.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedInquiry(inq)}
                          className="px-2.5 py-1.5 rounded-lg bg-sand-200 hover:bg-sand-300 text-navy-800 font-bold text-[11px] transition-colors"
                        >
                          View Details
                        </button>
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
          <div className="p-4 border-t border-sand-200 flex items-center justify-between text-xs">
            <span className="text-taupe-500">
              Page <span className="font-bold text-navy-800 font-mono">{page}</span> of{' '}
              <span className="font-bold text-navy-800 font-mono">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg border border-sand-300 disabled:opacity-40 hover:bg-sand-200/60 text-navy-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg border border-sand-300 disabled:opacity-40 hover:bg-sand-200/60 text-navy-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <Modal
          isOpen={!!selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          title={`Inquiry from ${selectedInquiry.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-sand-100/70 rounded-xl border border-sand-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-taupe-500 block">Type</span>
                <span className="font-black text-navy-800 uppercase font-serif">
                  {selectedInquiry.type} INQUIRY
                </span>
              </div>
              <Badge
                variant={
                  selectedInquiry.status === 'closed'
                    ? 'neutral'
                    : selectedInquiry.status === 'contacted'
                    ? 'info'
                    : 'warning'
                }
              >
                {selectedInquiry.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-sand-100/70 rounded-xl border border-sand-200">
                <span className="text-[10px] text-taupe-500 block font-bold">Contact Person</span>
                <span className="font-bold text-navy-800 text-sm block">
                  {selectedInquiry.name}
                </span>
                {selectedInquiry.organisation && (
                  <span className="text-blue-600 block mt-0.5 font-medium">
                    {selectedInquiry.organisation}
                  </span>
                )}
              </div>

              <div className="p-3 bg-sand-100/70 rounded-xl border border-sand-200 space-y-1">
                <span className="text-[10px] text-taupe-500 block font-bold">Direct Channels</span>
                <p className="font-mono text-navy-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-taupe-500" />
                  <a href={`tel:${selectedInquiry.phone}`} className="hover:underline text-blue-600">
                    {selectedInquiry.phone}
                  </a>
                </p>
                {selectedInquiry.email && (
                  <p className="text-slate flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-taupe-500" />
                    <span>{selectedInquiry.email}</span>
                  </p>
                )}
              </div>
            </div>

            {selectedInquiry.quantityEstimate && (
              <div className="p-3 bg-blue-100/60 border border-blue-200 rounded-xl text-navy-800 font-bold">
                Estimated Order Quantity: <span className="font-mono">{selectedInquiry.quantityEstimate}</span> uniforms
              </div>
            )}

            <div>
              <span className="text-[10px] text-taupe-500 uppercase font-bold block mb-1">
                Full Message
              </span>
              <div className="p-3 bg-sand-100/60 border border-sand-200 rounded-xl text-slate whitespace-pre-wrap leading-relaxed">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-sand-200">
              <a
                href={`https://wa.me/91${selectedInquiry.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hello ${selectedInquiry.name}, thank you for contacting Indraprasth Uniforms regarding: `
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp Prospect</span>
              </a>

              {selectedInquiry.status !== 'contacted' && (
                <button
                  onClick={() => handleStatusChange(selectedInquiry._id, 'contacted')}
                  className="px-3.5 py-2 rounded-xl bg-blue-100 text-blue-700 font-bold hover:bg-blue-200 transition-colors"
                >
                  Mark as Contacted
                </button>
              )}

              {selectedInquiry.status !== 'closed' && (
                <button
                  onClick={() => handleStatusChange(selectedInquiry._id, 'closed')}
                  className="px-3.5 py-2 rounded-xl bg-sand-200 text-navy-800 font-bold hover:bg-sand-300 transition-colors"
                >
                  Mark Closed
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
