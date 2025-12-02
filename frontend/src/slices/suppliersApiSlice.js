import { apiSlice } from './apiSlice';

const SUPPLIERS_URL = '/suppliers';

export const suppliersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSuppliers: builder.query({
            query: () => ({
                url: SUPPLIERS_URL,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Supplier'],
        }),
        getSupplierById: builder.query({
            query: (id) => ({
                url: `${SUPPLIERS_URL}/${id}`,
            }),
            keepUnusedDataFor: 5,
        }),
        createSupplier: builder.mutation({
            query: (data) => ({
                url: SUPPLIERS_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Supplier'],
        }),
        updateSupplier: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${SUPPLIERS_URL}/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Supplier'],
        }),
        deleteSupplier: builder.mutation({
            query: (id) => ({
                url: `${SUPPLIERS_URL}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Supplier'],
        }),
        getSupplierProducts: builder.query({
            query: (id) => ({
                url: `${SUPPLIERS_URL}/${id}/products`,
            }),
            keepUnusedDataFor: 5,
        }),
    }),
});

export const {
    useGetSuppliersQuery,
    useGetSupplierByIdQuery,
    useCreateSupplierMutation,
    useUpdateSupplierMutation,
    useDeleteSupplierMutation,
    useGetSupplierProductsQuery,
} = suppliersApiSlice;
