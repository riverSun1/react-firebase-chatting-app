import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import firebase from "../../firebase";

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [errorFromSubmit, setErrorFromSubmit] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      // firebase에서 이메일과 비번을 이용해 유저 생성
      // console.log(data);
      setLoading(true);

      await firebase
        .auth()
        .signInWithEmailAndPassword(data.email, data.password);

      setLoading(false);
    } catch (error) {
      setErrorFromSubmit(error.message);
      setLoading(false);
      setTimeout(() => {
        setErrorFromSubmit("");
      }, 5000);
    }
  };

  return (
    <div className="auth-wrapper">
      <div style={{ textAlign: "center" }}>
        <h3>Login</h3>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Email</label>
        <input
          name="email"
          type="email"
          {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
        />
        {errors.email && <span>This field is required</span>}
        <label>Password</label>
        <input
          name="password"
          type="password"
          {...register("password", { required: true, minLength: 6 })}
        />
        {errors.password && errors.password.type === "required" && (
          <p> This password field is required</p>
        )}
        {errors.password && errors.password.type === "minLength" && (
          <p> Password must have at least 6 characters</p>
        )}
        <input type="submit" disabled={loading} />
        <Link style={{ color: "gray", textDecoration: "none" }} to="/register">
          아직 아이디가 없다면...
        </Link>
      </form>
    </div>
  );
}

export default LoginPage;
