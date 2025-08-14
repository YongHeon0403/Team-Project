import { configureStore } from "@reduxjs/toolkit";
import LoginSlice from "./slices/LoginSlice"

export default configureStore({
    reducer: {
        "LoginSlice": LoginSlice
    }
})