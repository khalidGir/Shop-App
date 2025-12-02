import { apiSlice } from './apiSlice';

const PAYMENTS_URL = '/payments';

export const paymentsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        recordPayment: builder.mutation({
            query: (data) => ({
                url: PAYMENTS_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Invoice', 'Customer', 'Payment'],
        }),
        getPayments: builder.query({
            query: () => ({
                url: PAYMENTS_URL,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Payment'],
        }),
        getCustomerPayments: builder.query({
            query: (customerId) => ({
                url: `${PAYMENTS_URL}/customer/${customerId}`,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Payment'],
        }),
    }),
});

export const {
    useRecordPaymentMutation,
    useGetPaymentsQuery,
    useGetCustomerPaymentsQuery,
} = paymentsApiSlice;
