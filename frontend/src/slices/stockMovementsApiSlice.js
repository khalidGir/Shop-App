import { apiSlice } from './apiSlice';

const STOCK_MOVEMENTS_URL = '/stock-movements';

export const stockMovementsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getStockMovements: builder.query({
            query: (params) => ({
                url: STOCK_MOVEMENTS_URL,
                params,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['StockMovement'],
        }),
        getProductStockMovements: builder.query({
            query: (id) => ({
                url: `${STOCK_MOVEMENTS_URL}/product/${id}`,
            }),
            keepUnusedDataFor: 5,
        }),
        createStockMovement: builder.mutation({
            query: (data) => ({
                url: STOCK_MOVEMENTS_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['StockMovement', 'Product'],
        }),
        getRecentMovements: builder.query({
            query: () => ({
                url: `${STOCK_MOVEMENTS_URL}/recent`,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['StockMovement'],
        }),
    }),
});

export const {
    useGetStockMovementsQuery,
    useGetProductStockMovementsQuery,
    useCreateStockMovementMutation,
    useGetRecentMovementsQuery,
} = stockMovementsApiSlice;
