import { uploadImage, deleteImage } from '@/lib/upload/cloudinary';

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

export class ImageUploadService {
  static async uploadProductImage(file: Buffer, productId: string) {
    try {
      const result = await uploadImage(file, `products/${productId}`) as CloudinaryResponse;
      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Failed to upload product image:', error);
      throw new Error('Image upload failed');
    }
  }

  static async uploadAvatarImage(file: Buffer, userId: string) {
    try {
      const result = await uploadImage(file, `avatars/${userId}`) as CloudinaryResponse;
      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Failed to upload avatar image:', error);
      throw new Error('Avatar upload failed');
    }
  }

  static async deleteImage(publicId: string) {
    try {
      await deleteImage(publicId);
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw new Error('Image deletion failed');
    }
  }
}