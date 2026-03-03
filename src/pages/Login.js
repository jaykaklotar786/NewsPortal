import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../services/api";
import { saveAuthToSession } from "../services/api";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),

  password: Yup.string().required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAuthenticated, setUser } = useAuth();

  const from = location.state?.from?.pathname || "/";

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);

      try {
        const response = await authAPI.login(values);
        saveAuthToSession(response.data.token, response.data.user);
        setIsAuthenticated(true);
        setUser(response.data.user);
        toast.success("Login successful! Redirecting...");
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1500);
      } catch (error) {
        console.error("Login error:", error);
        toast.error(
          error.response?.data?.message || "Login failed. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your email"
                className={`input ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : ""
                }`}
                disabled={formik.isSubmitting}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-600 text-sm mt-2">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                autoComplete="current-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your password"
                className={`input ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : ""
                }`}
                disabled={formik.isSubmitting}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-600 text-sm mt-2">
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full btn btn-primary"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">
            Demo Credentials
          </h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              <strong>Email:</strong> demo@example.com
            </p>
            <p>
              <strong>Password:</strong> password123
            </p>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Use these credentials to test the login functionality
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
