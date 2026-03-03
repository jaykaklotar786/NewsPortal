# Image Upload Configuration

This project is configured with multer for handling image uploads in Express.js.

## Features

- **Image-only uploads**: Restricts file uploads to image files only (JPEG, JPG, PNG, GIF, WEBP)
- **Timestamp-based filenames**: Generates unique filenames using timestamps to avoid conflicts
- **Field name**: Uses 'image' as the field name for file uploads
- **File size limit**: 5MB maximum file size (configurable via MAX_FILE_SIZE environment variable)
- **Automatic directory creation**: Creates uploads directory if it doesn't exist

## API Endpoints

### POST /api/upload/image

Upload a single image file.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Body:**
```
image: <file> (required)
```

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "image": {
    "filename": "imagename-1691234567890.jpg",
    "originalName": "original-image.jpg",
    "size": 123456,
    "mimetype": "image/jpeg",
    "path": "./uploads/imagename-1691234567890.jpg",
    "url": "/uploads/imagename-1691234567890.jpg"
  }
}
```

## Configuration

The upload configuration is located in `utils/upload.js`:

- **Storage**: Files are saved to the `./uploads` directory
- **Filename**: `{originalname}-{timestamp}.{extension}`
- **File filter**: Only allows image files
- **Size limit**: 5MB (configurable via environment variable)

## Environment Variables

Add these to your `config.env` file:

```env
# File Upload Configuration
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_PATH=./uploads
```

## Usage Example

### Frontend (React/JavaScript)

```javascript
const uploadImage = async (file, token) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/api/upload/image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const result = await response.json();
    if (response.ok) {
      console.log('Image uploaded:', result.image.url);
      return result.image;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};
```

### cURL Example

```bash
curl -X POST \
  http://localhost:3000/api/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/your/image.jpg"
```

## Error Handling

The API returns appropriate error messages for:

- **No file uploaded**: `400 Bad Request`
- **Invalid file type**: `400 Bad Request` (only image files allowed)
- **File too large**: `400 Bad Request` (exceeds MAX_FILE_SIZE)
- **Authentication required**: `401 Unauthorized`
- **Server errors**: `500 Internal Server Error`

## File Structure

```
uploads/
├── .gitkeep
└── [uploaded images with timestamp filenames]
```

The uploads directory is automatically created when the server starts and is served statically at `/uploads/` endpoint.
