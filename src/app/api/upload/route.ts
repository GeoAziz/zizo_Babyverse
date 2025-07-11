import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { authOptions } from "@/lib/auth";
import { uploadImage, deleteImage } from '@/lib/upload/cloudinary';

export async function POST(request: Request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'products';

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImage(buffer, folder);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ message: "Failed to upload image" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== 'ADMIN') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json({ message: "No public ID provided" }, { status: 400 });
    }

    const result = await deleteImage(publicId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ message: "Failed to delete image" }, { status: 500 });
  }
}