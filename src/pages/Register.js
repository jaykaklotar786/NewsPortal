import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters"),

  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),

  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

const Register = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);

      try {
        const response = await authAPI.register(values);

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        toast.success("Registration successful! Redirecting...");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } catch (error) {
        console.error("Registration error:", error);
        toast.error(
          error.response?.data?.message ||
            "Registration failed. Please try again."
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
            Create Account
          </h1>
          <p className="text-gray-600">
            Sign up to get started with News Portal
          </p>
        </div>

        {/* Registration Form Card */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your full name"
                className={`input ${
                  formik.touched.name && formik.errors.name
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : ""
                }`}
                disabled={formik.isSubmitting}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-600 text-sm mt-2">
                  {formik.errors.name}
                </p>
              )}
            </div>

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
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your password (min 6 characters)"
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
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
