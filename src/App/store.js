import { configureStore } from "@reduxjs/toolkit";
import sVerseReducer from "../features/sVerse/sVerseSlice.js"

const store= configureStore({
    reducer: sVerseReducer,
})

export default store;