import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kttdnoylgmnftrulhieg.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0dGRub3lsZ21uZnRydWxoaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTQ0MjEsImV4cCI6MjA3MDQzMDQyMX0.kFEwRkbWIINnYsUZAud-LCKHs2z54YEyChlJN4lvE1Q';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to upload file to Supabase storage
export const uploadFile = async (
  bucket: string,
  fileName: string,
  file: Blob | File,
  options?: {
    cacheControl?: string;
    upsert?: boolean;
  }
) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: options?.cacheControl || '3600',
        upsert: options?.upsert || false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

// Helper function to get public URL for uploaded file
export const getPublicUrl = (bucket: string, filePath: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Helper function to delete file from Supabase storage
export const deleteFile = async (bucket: string, filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
};
