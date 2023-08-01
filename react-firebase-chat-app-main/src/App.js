import React, { useEffect } from "react";
import { Router, Routes, Route, useNavigate } from "react-router-dom";
import ChatPage from "./components/ChatPage/ChatPage";
import LoginPage from "./components/LoginPage/LoginPage";
import RegisterPage from "./components/RegisterPage/RegisterPage";
import firebase from "./firebase";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./redux/actions/user_action";

function App(props) {
  // 인증된 이후의 페이지 이동
  let navigate = useNavigate();
  let dispatch = useDispatch();
  const isLoading = useSelector((state) => state.user.isLoading); // Redux 스토어에 있는 정보 가져올 때

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      console.log(user);
      // 로그인이 된 상태
      if (user) {
        navigate("/");
        // 로그인한 유저의 정보를 redux에 저장
        dispatch(setUser(user));
      } else {
        navigate("/login");
      }
    });
  }, []);

  // 로그인 정보를 가져올 때까지
  // if (isLoading) {
  //   return <div>...loading</div>;
  // }

  return (
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default App;
