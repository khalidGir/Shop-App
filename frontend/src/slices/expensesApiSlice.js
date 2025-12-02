import { apiSlice } from './apiSlice';

const EXPENSES_URL = '/expenses';

export const expensesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getExpenses: builder.query({
            query: () => ({
                url: EXPENSES_URL,
            }),
            keepUnusedDataFor: 5,
            providesTags: ['Expense'],
        }),
        getExpenseById: builder.query({
            query: (id) => ({
                url: `${EXPENSES_URL}/${id}`,
            }),
            keepUnusedDataFor: 5,
        }),
        createExpense: builder.mutation({
            query: (data) => ({
                url: EXPENSES_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Expense'],
        }),
        updateExpense: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${EXPENSES_URL}/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Expense'],
        }),
        deleteExpense: builder.mutation({
            query: (id) => ({
                url: `${EXPENSES_URL}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Expense'],
        }),
    }),
});

export const {
    useGetExpensesQuery,
    useGetExpenseByIdQuery,
    useCreateExpenseMutation,
    useUpdateExpenseMutation,
    useDeleteExpenseMutation,
} = expensesApiSlice;
