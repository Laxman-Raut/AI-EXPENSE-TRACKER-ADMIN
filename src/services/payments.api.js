export const paymentsApi = {
  getPayments: async () => {
    // TODO: Payments Ledger API endpoint is not supported by the original Express backend.
    // Create a TODO comment instead of using dummy data or creating backend endpoints.
    console.warn('TODO: Implement GET /v1/admin/payments in the Express backend.');
    return {
      payments: [],
      total: 0,
      page: 1,
      totalPages: 1,
      isMissingApi: true,
    };
  },

  getDetails: async (id) => {
    // TODO: Payment details API endpoint is not supported by the original Express backend.
    console.warn(`TODO: Implement GET /v1/admin/payments/${id} in the Express backend.`);
    throw new Error('Payment details API is not supported by the backend.');
  }
};
export default paymentsApi;
