import { apiSlice } from './apiSlice';

const CUSTOMERS_URL = '/customers';

export const customersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCustomers: builder.query({
            query: () => ({
                url: CUSTOMERS_URL,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Customer'],
        }),
        getCustomerById: builder.query({
            query: (id) => ({
                url: `${CUSTOMERS_URL}/${id}`,
            }),
            keepUnusedDataFor: 5,
        }),
        createCustomer: builder.mutation({
            query: (data) => ({
                url: CUSTOMERS_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Customer'],
        }),
        updateCustomer: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${CUSTOMERS_URL}/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Customer'],
        }),
        deleteCustomer: builder.mutation({
            query: (id) => ({
                url: `${CUSTOMERS_URL}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Customer'],
        }),
        getCustomerOrders: builder.query({
            query: (id) => ({
                url: `${CUSTOMERS_URL}/${id}/orders`,
            }),
            keepUnusedDataFor: 5,
        }),
    }),
});

export const {
    useGetCustomersQuery,
    useGetCustomerByIdQuery,
    useCreateCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
    useGetCustomerOrdersQuery,
} = customersApiSlice;
