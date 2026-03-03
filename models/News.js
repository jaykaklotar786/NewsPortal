const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      maxlength: [50, 'Category cannot be more than 50 characters'],
    },
    image: {
      type: String,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
  }
);

// Create text index for search functionality on title and content
newsSchema.index({
  title: 'text',
  content: 'text',
});

// Create individual indexes for better query performance
newsSchema.index({ category: 1 });
newsSchema.index({ author: 1 });
newsSchema.index({ createdAt: -1 }); // Descending order for latest news first

// Virtual for formatted date
newsSchema.virtual('formattedDate').get(function () {
  return this.createdAt.toLocaleDateString();
});

// Ensure virtual fields are serialized
newsSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('News', newsSchema);
