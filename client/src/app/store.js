import { configureStore } from "@reduxjs/toolkit";
import rootRedcuer from "./rootRedcuer";
import { authApi } from "@/features/api/authApi";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";
import { cheatingApi } from "@/features/api/cheatingApi";
import { testSubmissionApi } from "@/features/api/testSubmissionApi";

export const appStore = configureStore({
  reducer: rootRedcuer,
  middleware: (defaultMiddleware) =>
    defaultMiddleware().concat(
      authApi.middleware,
      courseApi.middleware,
      purchaseApi.middleware,
      courseProgressApi.middleware,
      cheatingApi.middleware,
      testSubmissionApi.middleware
    ),
});

const initializeApp = async () => {
  try {
    console.log("Initializing app and loading user data...");
    const result = await appStore.dispatch(
      authApi.endpoints.loadUser.initiate(null, { forceRefetch: true })
    );
    console.log("User load result:", result);
  } catch (error) {
    console.error("Error initializing app:", error);
  }
};

initializeApp();
