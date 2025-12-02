import { apiSlice } from './apiSlice';

const ORDERS_URL = '/orders';

export const ordersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: (order) => ({
                url: ORDERS_URL,
                method: 'POST',
                body: order,
            }),
            invalidatesTags: ['Order'],
        }),
        getOrderById: builder.query({
            query: (id) => ({
                url: `${ORDERS_URL}/${id}`,
            }),
            keepUnusedDataFor: 5,
        }),
        getMyOrders: builder.query({
            query: () => ({
                url: `${ORDERS_URL}/myorders`,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Order'],
        }),
        updateOrderToPaid: builder.mutation({
            query: ({ id, ...details }) => ({
                url: `${ORDERS_URL}/${id}/pay`,
                method: 'PUT',
                body: details,
            }),
            invalidatesTags: ['Order'],
        }),
    }),
});

export const {
    useCreateOrderMutation,
    useGetOrderByIdQuery,
    useGetMyOrdersQuery,
    useUpdateOrderToPaidMutation,
} = ordersApiSlice;
