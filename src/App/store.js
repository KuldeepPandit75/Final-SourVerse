import { configureStore } from "@reduxjs/toolkit";
import sVerseReducer from "../features/sVerseSlice.js"

const store= configureStore({
    reducer: sVerseReducer,
})

export default store;