import {createSlice} from "@reduxjs/toolkit"

const initialState = {
    user: null,
}

export const sVerseSlice= createSlice({
    name: "SourVerse",
    initialState,
    reducers:{
        setUser(state,action){
            state.user=action.payload
        }
    }
})

export const {setUser} = sVerseSlice.actions;

export default sVerseSlice.reducer