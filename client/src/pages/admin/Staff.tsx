import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Shield, UserCheck, UserX, AlertCircle, Users } from 'lucide-react';
import {
  useAdminStaff,
  useCreateStaff,
  useToggleStaffStatus,
  useDeleteStaff,
} from '../../api';
import { useAuthStore } from '../../store/auth';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const staffFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['staff', 'owner']),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

export const Staff: React.FC = () => {
  const { user } = useAuthStore();
  const { data: staffList, isLoading, refetch } = useAdminStaff();
  const createStaffMutation = useCreateStaff();
  const toggleStatusMutation = useToggleStaffStatus();
  const deleteStaffMutation = useDeleteStaff();

  const [modalOpen, setModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'staff',
    },
  });

  const isOwner = user?.role === 'owner';

  if (!isOwner) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Helmet>
          <title>Staff Management | Indraprasth Uniforms</title>
        </Helmet>
        <div className="bg-cream-50 border border-sand-300 rounded-xl p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-crimson-100 rounded-full flex items-center justify-center mx-auto text-crimson-700">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="font-serif font-bold text-2xl text-navy-800">Owner Access Required</h2>
          <p className="text-slate text-sm max-w-md mx-auto">
            Staff management is restricted to system administrators with the Owner role.
          </p>
        </div>
      </div>
    );
  }

  const openCreateModal = () => {
    reset({
      name: '',
      email: '',
      password: '',
      role: 'staff',
    });
    setModalOpen(true);
  };

  const onSubmit = async (values: StaffFormValues) => {
    try {
      await createStaffMutation.mutateAsync(values);
      toast.success(`Staff account for "${values.name}" created!`);
      setModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create staff account');
    }
  };

  const handleToggleStatus = async (staffId: string, currentStatus: boolean, staffName: string) => {
    try {
      await toggleStatusMutation.mutateAsync(staffId);
      toast.success(
        `Staff account for "${staffName}" ${currentStatus ? 'deactivated' : 'activated'}`
      );
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update staff status');
    }
  };

  const handleDelete = async (staffId: string, staffName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete the account for "${staffName}"?`)) {
      try {
        await deleteStaffMutation.mutateAsync(staffId);
        toast.success(`Staff account for "${staffName}" deleted`);
        refetch();
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to delete staff account');
      }
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <Helmet>
        <title>Staff Management | Indraprasth Uniforms</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl md:text-3xl text-navy-800 flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-600" />
            <span>Staff Management</span>
          </h1>
          <p className="text-slate text-sm mt-1">
            Manage administrator accounts, permissions, and active statuses.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-crimson-600 hover:bg-crimson-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm btn-tactile"
          aria-label="Add Staff Member"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-cream-50 rounded-xl border border-sand-300 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : !staffList || staffList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-sand-400 mx-auto" />
            <p className="font-serif font-bold text-navy-800">No staff members found</p>
            <p className="text-slate text-sm">Add your first staff member to delegate portal access.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-sand-300 bg-sand-100 text-navy-800 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Name & Email</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-300">
                {staffList.map((member) => {
                  const memberId = (member as any)._id || member.id;
                  const isCurrentSelf = user?.id === memberId || (user as any)?._id === memberId;

                  return (
                    <tr key={memberId} className="hover:bg-sand-100/60 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-navy-800">{member.name}</div>
                        <div className="text-xs text-slate font-mono">{member.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={member.role === 'owner' ? 'accent' : 'brand'}
                          className="capitalize font-mono"
                        >
                          {member.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={member.isActive ? 'success' : 'slate'}
                          className="font-mono"
                        >
                          {member.isActive ? 'Active' : 'Deactivated'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate font-mono">
                        {member.createdAt
                          ? new Date(member.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(memberId, member.isActive, member.name)}
                            disabled={isCurrentSelf}
                            className={`p-2 min-w-[44px] min-h-[44px] rounded-lg border transition-colors flex items-center justify-center btn-tactile ${
                              isCurrentSelf
                                ? 'opacity-40 cursor-not-allowed border-sand-300 text-slate'
                                : member.isActive
                                ? 'border-sand-300 text-slate hover:text-crimson-600 hover:bg-crimson-50 hover:border-crimson-200'
                                : 'border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                            title={
                              isCurrentSelf
                                ? 'Cannot modify your own active status'
                                : member.isActive
                                ? 'Deactivate staff account'
                                : 'Activate staff account'
                            }
                            aria-label={
                              isCurrentSelf
                                ? `Your account (${member.name})`
                                : member.isActive
                                ? `Deactivate account for ${member.name}`
                                : `Activate account for ${member.name}`
                            }
                          >
                            {member.isActive ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleDelete(memberId, member.name)}
                            disabled={isCurrentSelf}
                            className={`p-2 min-w-[44px] min-h-[44px] rounded-lg border transition-colors flex items-center justify-center btn-tactile ${
                              isCurrentSelf
                                ? 'opacity-40 cursor-not-allowed border-sand-300 text-slate'
                                : 'border-sand-300 text-slate hover:text-crimson-600 hover:bg-crimson-50 hover:border-crimson-200'
                            }`}
                            title={
                              isCurrentSelf
                                ? 'Cannot delete your own account'
                                : 'Delete staff account'
                            }
                            aria-label={`Delete account for ${member.name}`}
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
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Staff Account"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy-800 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.name && (
              <p className="text-crimson-600 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy-800 mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="e.g. rahul@indraprasth.com"
              className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.email && (
              <p className="text-crimson-600 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy-800 mb-1.5">
              Temporary Password *
            </label>
            <input
              type="password"
              {...register('password')}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.password && (
              <p className="text-crimson-600 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-navy-800 mb-1.5">
              Role *
            </label>
            <select
              {...register('role')}
              className="w-full px-3 py-2 border border-sand-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="staff">Staff (Standard portal access)</option>
              <option value="owner">Owner (Full administrative rights & staff control)</option>
            </select>
            {errors.role && (
              <p className="text-crimson-600 text-xs mt-1">{errors.role.message}</p>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-sand-300">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 min-h-[44px] border border-sand-300 text-slate hover:text-navy-800 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 min-h-[44px] bg-crimson-600 hover:bg-crimson-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
