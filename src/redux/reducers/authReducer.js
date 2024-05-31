import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  userData: null,
  loginWith: null,
  isLoggedin: false,
};

const primaryLogin = createSlice({
  name: "login",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setLoginWith: (state, action) => {
      state.loginWith = action.payload;
    },
    setIsLoggedIn: (state, action) => {
      state.isLoggedin = action.payload;
    },
  },
});

export const { setToken, setUserData, setLoginWith, setIsLoggedIn } = primaryLogin.actions;
export default primaryLogin.reducer;
