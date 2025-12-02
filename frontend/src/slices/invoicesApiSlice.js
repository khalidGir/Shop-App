import { apiSlice } from './apiSlice';

const INVOICES_URL = '/invoices';

export const invoicesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getInvoices: builder.query({
            query: () => ({
                url: INVOICES_URL,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Invoice'],
        }),
        getInvoiceById: builder.query({
            query: (id) => ({
                url: `${INVOICES_URL}/${id}`,
            }),
            keepUnusedDataFor: 5,
        }),
        createInvoice: builder.mutation({
            query: (data) => ({
                url: INVOICES_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Invoice'],
        }),
        updateInvoice: builder.mutation({
            query: (data) => ({
                url: `${INVOICES_URL}/${data._id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Invoice'],
        }),
        deleteInvoice: builder.mutation({
            query: (id) => ({
                url: `${INVOICES_URL}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Invoice'],
        }),
        generateInvoiceFromOrder: builder.mutation({
            query: (orderId) => ({
                url: `${INVOICES_URL}/generate/${orderId}`,
                method: 'POST',
            }),
            invalidatesTags: ['Invoice'],
        }),
    }),
});

export const {
    useGetInvoicesQuery,
    useGetInvoiceByIdQuery,
    useCreateInvoiceMutation,
    useUpdateInvoiceMutation,
    useDeleteInvoiceMutation,
    useGenerateInvoiceFromOrderMutation,
} = invoicesApiSlice;
