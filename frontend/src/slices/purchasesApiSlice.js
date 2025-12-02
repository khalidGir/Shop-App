import { apiSlice } from './apiSlice';

const PURCHASES_URL = '/purchases';

export const purchasesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPurchases: builder.query({
            query: () => ({
                url: PURCHASES_URL,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Purchase'],
        }),
        getPurchaseById: builder.query({
            query: (id) => ({
                url: `${PURCHASES_URL}/${id}`,
            }),
            keepUnusedDataFor: 5,
        }),
        createPurchase: builder.mutation({
            query: (data) => ({
                url: PURCHASES_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Purchase', 'Product'],
        }),
        updatePurchase: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${PURCHASES_URL}/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Purchase'],
        }),
        deletePurchase: builder.mutation({
            query: (id) => ({
                url: `${PURCHASES_URL}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Purchase'],
        }),
        receivePurchase: builder.mutation({
            query: (id) => ({
                url: `${PURCHASES_URL}/${id}/receive`,
                method: 'PUT',
            }),
            invalidatesTags: ['Purchase', 'Product'], // Invalidate products too since stock updates
        }),
    }),
});

export const {
    useGetPurchasesQuery,
    useGetPurchaseByIdQuery,
    useCreatePurchaseMutation,
    useUpdatePurchaseMutation,
    useDeletePurchaseMutation,
    useReceivePurchaseMutation,
} = purchasesApiSlice;
