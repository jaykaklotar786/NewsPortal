import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";

import { newsAPI, uploadAPI, toAbsoluteUploadUrl } from "../services/api";
import { toast } from "react-toastify";

const AddNews = () => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Validate Token
  useEffect(() => {
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  // Formik Setup
  const formik = useFormik({
    initialValues: {
      title: "",
      content: "",
      category: "",
      image: null,
    },

    validationSchema: Yup.object({
      title: Yup.string()
        .required("Title is required")
        .min(3, "Minimum 3 characters"),

      content: Yup.string()
        .required("Content is required")
        .min(10, "Minimum 10 characters"),

      category: Yup.string().required("Category is required"),

      image: Yup.mixed()
        .required("Please upload an image")
        .test(
          "fileType",
          "Only JPG/PNG allowed",
          (value) =>
            value &&
            ["image/jpeg", "image/png", "image/jpg"].includes(value.type)
        )
        .test(
          "fileSize",
          "Max size 5MB allowed",
          (value) => value && value.size <= 5 * 1024 * 1024
        ),
    }),

    onSubmit: async (values) => {
      try {
        setLoading(true);

        let imageUrl = "";

        if (values.image) {
          const uploadResponse = await uploadAPI.uploadImage(values.image);
          imageUrl = toAbsoluteUploadUrl(uploadResponse.data.image.url);
        }

        const newsData = {
          title: values.title.trim(),
          content: values.content.trim(),
          category: values.category,
          image: imageUrl,
        };

        const response = await newsAPI.create(newsData);

        if (response.data.success) {
          toast.success("News article created successfully!");
          formik.resetForm();
          setImagePreview(null);

          setTimeout(() => navigate("/"), 1500);
        } else {
          toast.error("Failed to create news article");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
  });

  // Image Change Handler
  const handleImageChange = (event) => {
    const file = event.currentTarget.files[0];
    formik.setFieldValue("image", file);

    if (file) {
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const removeImage = () => {
    formik.setFieldValue("image", null);
    setImagePreview(null);
    document.getElementById("image").value = "";
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Add News Article
        </h1>
        <p className="text-gray-600">Share your news with the world</p>
      </div>

      {/* FORM CARD */}
      <div className="card p-6">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              name="title"
              className="input"
              {...formik.getFieldProps("title")}
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-red-600 text-sm">{formik.errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="label">Category *</label>
            <select
              name="category"
              className="input"
              {...formik.getFieldProps("category")}
            >
              <option value="">Select category</option>
              {[
                "Technology",
                "Business",
                "Health",
                "Sports",
                "Entertainment",
                "Politics",
                "Environment",
                "Science",
                "World",
                "Local",
              ].map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>

            {formik.touched.category && formik.errors.category && (
              <p className="text-red-600 text-sm">{formik.errors.category}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="label">
              Image *
            </label>

            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <label
              htmlFor="image"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
            >
              <svg
                className="w-8 h-8 mb-3 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm">Click to upload image</p>
              <p className="text-xs text-gray-400">PNG, JPG, Max 5MB</p>
            </label>

            {formik.touched.image && formik.errors.image && (
              <p className="text-red-600 text-sm mt-1">{formik.errors.image}</p>
            )}

            {/* Preview */}
            {imagePreview && (
              <div className="relative mt-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="label">Content *</label>
            <textarea
              rows="7"
              className="input"
              {...formik.getFieldProps("content")}
            />
            {formik.touched.content && formik.errors.content && (
              <p className="text-red-600 text-sm">{formik.errors.content}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Creating..." : "Create News"}
          </button>
        </form>
      </div>

      {/* 🔥 PREVIEW SECTION (OLD UI RESTORED) */}
      {(formik.values.title || formik.values.content) && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Category */}
            {formik.values.category && (
              <span className="inline-block bg-primary-100 text-primary-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3">
                {formik.values.category}
              </span>
            )}

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {formik.values.title || "News Title"}
            </h2>

            {/* Image */}
            {imagePreview && (
              <img
                src={imagePreview}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}

            {/* Content */}
            <p className="text-gray-600 whitespace-pre-wrap">
              {formik.values.content || "News content will appear here..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddNews;
