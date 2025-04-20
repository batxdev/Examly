import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { cheatingApi } from "@/features/api/cheatingApi";
import { testSubmissionApi } from "@/features/api/testSubmissionApi";

const rootRedcuer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [courseApi.reducerPath]: courseApi.reducer,
  [purchaseApi.reducerPath]: purchaseApi.reducer,
  [courseProgressApi.reducerPath]: courseProgressApi.reducer,
  [cheatingApi.reducerPath]: cheatingApi.reducer,
  [testSubmissionApi.reducerPath]: testSubmissionApi.reducer,
  auth: authReducer,
});
export default rootRedcuer;
