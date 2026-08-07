import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Ticket, CheckCircle, Users, TrendingDown, 
  Search, RefreshCw, Copy, Edit2, Trash2, Check,
  AlertCircle
} from 'lucide-react';
import { couponsApi } from '@/services/coupons.api';
import { plansApi } from '@/services/plans.api';
import { useCurrency } from '@/hooks/useCurrency';
import Dialog from '../ui/Dialog';
import { ChartSkeleton } from '../ui/Skeleton';

export default function CouponsView() {
  const queryClient = useQueryClient();
  const { formatAmount } = useCurrency();

  const [filters, setFilters] = useState({ search: '', status: 'all', page: 1, limit: 10 });
  const [searchInput, setSearchInput] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount: '',
    maxCap: '',
    minPurchase: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    applicablePlans: []
  });

  const [copiedCode, setCopiedCode] = useState(null);

  // Queries
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['couponStats'],
    queryFn: () => couponsApi.getStats(),
  });

  const { data: couponsData, isLoading: isCouponsLoading, isFetching } = useQuery({
    queryKey: ['couponsList', filters],
    queryFn: () => couponsApi.getCoupons(filters),
  });

  const { data: plansData } = useQuery({
    queryKey: ['plansList'],
    queryFn: () => plansApi.getPlans(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: couponsApi.createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couponsList'] });
      queryClient.invalidateQueries({ queryKey: ['couponStats'] });
      alert('Coupon created successfully!');
      closeModal();
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err.message || 'Failed to create coupon';
      alert(`Error: ${msg}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => couponsApi.updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couponsList'] });
      queryClient.invalidateQueries({ queryKey: ['couponStats'] });
      alert('Coupon updated successfully!');
      closeModal();
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err.message || 'Failed to update coupon';
      alert(`Error: ${msg}`);
    }
  });

  const toggleMutation = useMutation({
    mutationFn: couponsApi.toggleStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couponsList'] });
      queryClient.invalidateQueries({ queryKey: ['couponStats'] });
    },
    onError: (err) => {
      alert(err?.response?.data?.message || err.message || 'Failed to update status');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: couponsApi.deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couponsList'] });
      queryClient.invalidateQueries({ queryKey: ['couponStats'] });
      alert('Coupon deleted successfully!');
    },
    onError: (err) => {
      alert(err?.response?.data?.message || err.message || 'Failed to delete coupon');
    }
  });

  // Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['couponsList'] });
    queryClient.invalidateQueries({ queryKey: ['couponStats'] });
  };

  const openModal = (coupon = null) => {
    if (coupon) {
      const cId = coupon._id || coupon.id;
      setEditingId(cId);
      
      const plansList = Array.isArray(coupon.applicablePlans)
        ? coupon.applicablePlans.map(p => typeof p === 'object' ? (p._id || p.id) : p)
        : [];

      setFormData({
        code: coupon.code || '',
        description: coupon.description || '',
        discountValue: coupon.discountValue !== undefined ? String(coupon.discountValue) : (coupon.discount !== undefined ? String(coupon.discount) : ''),
        maxDiscount: coupon.maxDiscount !== undefined && coupon.maxDiscount !== null ? String(coupon.maxDiscount) : (coupon.maxCap !== undefined && coupon.maxCap !== null ? String(coupon.maxCap) : ''),
        minPurchase: coupon.minPurchase !== undefined && coupon.minPurchase !== null ? String(coupon.minPurchase) : '',
        validFrom: coupon.validFrom ? coupon.validFrom.split('T')[0] : '',
        validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : '',
        usageLimit: coupon.usageLimit !== undefined ? String(coupon.usageLimit) : '',
        applicablePlans: plansList
      });
    } else {
      setEditingId(null);
      setFormData({
        code: '',
        description: '',
        discountValue: '',
        maxDiscount: '',
        minPurchase: '',
        validFrom: '',
        validUntil: '',
        usageLimit: '',
        applicablePlans: []
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      alert('Promo code is required.');
      return;
    }

    const val = Number(formData.discountValue || formData.discount);
    if (isNaN(val) || val < 1 || val > 99) {
      alert('Discount percentage must be between 1% and 99%.');
      return;
    }

    if (!formData.validFrom || !formData.validUntil) {
      alert('Valid From and Valid Until dates are required.');
      return;
    }

    if (!formData.usageLimit || Number(formData.usageLimit) < 1) {
      alert('Total usage limit is required (minimum 1).');
      return;
    }

    if (!formData.applicablePlans || formData.applicablePlans.length === 0) {
      alert('Please select at least one applicable plan.');
      return;
    }

    const payload = {
      code: formData.code.toUpperCase().trim(),
      description: formData.description || '',
      discountValue: val,
      maxDiscount: (formData.maxDiscount || formData.maxCap) ? Number(formData.maxDiscount || formData.maxCap) : null,
      minPurchase: formData.minPurchase ? Number(formData.minPurchase) : 0,
      validFrom: formData.validFrom,
      validUntil: formData.validUntil,
      usageLimit: Number(formData.usageLimit),
      applicablePlans: formData.applicablePlans,
    };
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handlePlanToggle = (planId) => {
    setFormData(prev => {
      const plans = prev.applicablePlans || [];
      if (plans.includes(planId)) {
        return { ...prev, applicablePlans: plans.filter(p => p !== planId) };
      } else {
        return { ...prev, applicablePlans: [...plans, planId] };
      }
    });
  };

  const stats = statsData || {};
  const coupons = couponsData?.coupons || couponsData?.items || (Array.isArray(couponsData) ? couponsData : []);
  const totalPages = couponsData?.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Coupon Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage discount codes for plans.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="px-4 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-md shadow-primary/20 active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Ticket size={18} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isStatsLoading ? (
          Array(4).fill(0).map((_, i) => <ChartSkeleton key={i} height={100} />)
        ) : (
          <>
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Coupons</p>
                  <h3 className="text-2xl font-bold text-foreground">{stats.totalCoupons ?? stats.total ?? 0}</h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Ticket size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Active Coupons</p>
                  <h3 className="text-2xl font-bold text-foreground">{stats.activeCoupons ?? stats.active ?? 0}</h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                  <CheckCircle size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Redemptions</p>
                  <h3 className="text-2xl font-bold text-foreground">{stats.totalRedemptions ?? stats.redemptions ?? 0}</h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Users size={20} />
                </div>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Discount Given</p>
                  <h3 className="text-2xl font-bold text-foreground">{formatAmount(stats.totalDiscountGiven ?? stats.revenueImpact ?? 0)}</h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <TrendingDown size={20} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by code or description..." 
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            className="w-full md:w-auto px-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>

          <button 
            onClick={handleRefresh}
            className="p-2 border border-border rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
            title="Refresh"
            disabled={isFetching}
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Discount</th>
                <th className="px-6 py-4 font-medium">Max Cap</th>
                <th className="px-6 py-4 font-medium">Usage</th>
                <th className="px-6 py-4 font-medium">Valid Until</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isCouponsLoading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-muted-foreground">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-primary/50" />
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-muted-foreground">
                    <AlertCircle size={24} className="mx-auto mb-2 text-muted-foreground/50" />
                    No coupons found
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const couponId = coupon._id || coupon.id;
                  const isExpired = new Date(coupon.validUntil) < new Date();
                  const usagePercent = coupon.usageLimit ? ((coupon.usedCount || 0) / coupon.usageLimit) * 100 : 0;
                  const isCouponActive = coupon.isActive !== undefined ? coupon.isActive : (coupon.status === 'active');
                  const discountVal = coupon.discountValue !== undefined ? coupon.discountValue : coupon.discount;
                  const maxCapVal = coupon.maxDiscount !== undefined ? coupon.maxDiscount : coupon.maxCap;
                  
                  return (
                    <tr key={couponId} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                            {coupon.code}
                          </span>
                          <button 
                            onClick={() => handleCopyCode(coupon.code)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copiedCode === coupon.code ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground truncate max-w-[150px]">
                        {coupon.description || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {discountVal}% OFF
                        </span>
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        {maxCapVal ? formatAmount(maxCapVal) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 w-32">
                          <div className="flex justify-between text-xs">
                            <span className="text-foreground">{coupon.usedCount || 0}</span>
                            <span className="text-muted-foreground">/ {coupon.usageLimit || '∞'}</span>
                          </div>
                          {coupon.usageLimit && (
                            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${usagePercent >= 100 ? 'bg-red-500' : 'bg-primary'}`} 
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${isExpired ? 'text-red-500 font-medium' : 'text-foreground'}`}>
                          {new Date(coupon.validUntil).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={isCouponActive && !isExpired}
                            onChange={() => toggleMutation.mutate(couponId)}
                            disabled={isExpired || toggleMutation.isPending}
                          />
                          <div className="w-9 h-5 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary opacity-80 peer-disabled:opacity-50"></div>
                        </label>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openModal(coupon)}
                            className="p-1.5 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                            title="Edit Coupon"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(couponId)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete Coupon"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Page {filters.page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={filters.page === totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingId ? "Edit Coupon" : "Create New Coupon"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Code *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground uppercase font-mono"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SUMMER2026"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Discount Value (%) *</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  max="99"
                  className="w-full pl-3 pr-8 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  placeholder="20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Description *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summer special discount for new users"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Max Discount Cap (Optional)</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                placeholder="e.g. 500"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Min Purchase Amount (Optional)</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                placeholder="e.g. 1000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Valid From *</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground [color-scheme:dark]"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Valid Until *</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground [color-scheme:dark]"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Total Usage Limit *</label>
            <input
              type="number"
              required
              min="1"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              placeholder="e.g. 100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Applicable Plans *</label>
            <div className="bg-background border border-border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
              {plansData?.map((plan) => {
                const planId = plan._id || plan.id;
                return (
                  <label key={planId} className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-secondary/50 rounded transition-colors">
                    <input 
                      type="checkbox"
                      className="rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background"
                      checked={formData.applicablePlans.includes(planId)}
                      onChange={() => handlePlanToggle(planId)}
                    />
                    <span className="text-sm text-foreground font-medium">{plan.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto bg-secondary px-2 py-0.5 rounded capitalize">
                      {plan.billingCycle || 'Monthly'}
                    </span>
                  </label>
                );
              })}
              {(!plansData || plansData.length === 0) && (
                <div className="text-sm text-muted-foreground text-center py-2">
                  No plans available
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Select at least 1 plan this coupon can be applied to.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button 
              type="button" 
              onClick={closeModal}
              className="px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-md shadow-primary/20 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Ticket size={16} />
                  <span>{editingId ? 'Save Changes' : 'Create Coupon'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
