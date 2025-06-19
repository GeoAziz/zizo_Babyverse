import { useState } from 'react';
import { Button } from './button';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/useToast';

interface FileUploaderProps {
  onUploadComplete: (url: string) => void;
  folder?: string;
  currentImage?: string;
}

export function FileUploader({ onUploadComplete, folder = 'products', currentImage }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentImage || '');
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please select a file under 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setPreview(data.secure_url);
      onUploadComplete(data.secure_url);
      
      toast({
        title: "Upload complete",
        description: "Your image has been uploaded successfully"
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!preview) return;
    
    try {
      // Extract public_id from Cloudinary URL
      const urlParts = preview.split('/');
      const publicId = urlParts[urlParts.length - 1].split('.')[0];
      
      await fetch(`/api/upload?publicId=${publicId}`, {
        method: 'DELETE',
      });
      
      setPreview('');
      onUploadComplete('');
      
      toast({
        title: "Image removed",
        description: "The image has been removed successfully"
      });
    } catch (error) {
      console.error('Remove error:', error);
      toast({
        title: "Remove failed",
        description: "There was a problem removing the image",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-[200px]"
          disabled={uploading}
        >
          <label className="cursor-pointer flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </Button>
        {preview && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {preview && (
        <div className="relative w-[200px] h-[200px]">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover rounded-md"
          />
        </div>
      )}
    </div>
  );
}