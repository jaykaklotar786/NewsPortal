import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { newsAPI, uploadAPI } from '../services/api';
import { toAbsoluteUploadUrl } from '../services/api';

const EditNews = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialNews = location.state?.news || null;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    imageFile: null,
    imageUrl: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        let data = initialNews;
        if (!data) {
          const res = await newsAPI.getById(id);
          data = res.data.data;
        }
        setFormData({
          title: data.title || '',
          content: data.content || '',
          category: data.category || '',
          imageFile: null,
          imageUrl: data.image || '',
        });
        setImagePreview(data.image ? toAbsoluteUploadUrl(data.image) : '');
      } catch (e) {
        setError('Failed to load news');
      }
    };
    load();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleImageChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    setFormData(prev => ({ ...prev, imageFile: file }));
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageFile: null, imageUrl: '' }));
    setImagePreview('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      let updatePayload;
      if (formData.imageFile) {
        // Use multipart to let backend save and set image
        const fd = new FormData();
        fd.append('title', formData.title.trim());
        fd.append('content', formData.content.trim());
        if (formData.category) fd.append('category', formData.category);
        fd.append('image', formData.imageFile);
        updatePayload = fd;
      } else {
        // JSON update; send imageUrl (can be empty to clear)
        updatePayload = {
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category || undefined,
          image: formData.imageUrl || '',
        };
      }

      const res = await newsAPI.update(id, updatePayload);
      if (res.data.success) {
        setSuccess('News updated successfully!');
        setTimeout(() => {
          navigate('/');
        }, 1200);
      } else {
        setError('Failed to update news');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update news';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Edit News</h1>
        <p className="text-gray-600">Update your article details</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input name="title" value={formData.title} onChange={handleChange} className="input" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <input name="category" value={formData.category} onChange={handleChange} className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            <div className="space-y-3">
              <input type="file" accept="image/*" onChange={handleImageChange} disabled={loading} />
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border" />
                  <button type="button" className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded" onClick={removeImage}>
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
            <textarea name="content" value={formData.content} onChange={handleChange} rows={8} className="input resize-none" required />
          </div>

          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}

          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNews;


