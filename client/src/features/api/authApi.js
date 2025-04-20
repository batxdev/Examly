import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";
import API_BASE_URL from "../../config/api";

const USER_API = `${API_BASE_URL}/api/v1/user/`;

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (inputData) => ({
        url: "register",
        method: "POST",
        body: inputData,
      }),
    }),
    loginUser: builder.mutation({
      query: (inputData) => ({
        url: "login",
        method: "POST",
        body: inputData,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          console.log("Login result:", result);
          if (result?.data?.user) {
            dispatch(userLoggedIn({ user: result.data.user }));
          } else {
            console.error("Login response missing user data:", result);
          }
        } catch (error) {
          console.log("Login error:", error);
        }
      },
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          dispatch(userLoggedOut());
        } catch (error) {
          console.log(error);
        }
      },
    }),
    loadUser: builder.query({
      query: () => ({
        url: "profile",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          console.log("Load user result:", result);
          if (result?.data?.user) {
            dispatch(userLoggedIn({ user: result.data.user }));
          } else {
            console.error("Load user response missing user data:", result);
          }
        } catch (error) {
          console.log("Load user error:", error);
        }
      },
    }),
    updateUser: builder.mutation({
      query: (formData) => ({
        url: "profile/update",
        method: "PUT",
        body: formData,
        credentials: "include",
      }),
    }),
    getAttendance: builder.query({
      query: (date) => ({
        url: `attendance?date=${date.toISOString().split("T")[0]}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});
export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useLoadUserQuery,
  useUpdateUserMutation,
  useGetAttendanceQuery,
} = authApi;
