import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://vssbmbuoqsroljsazxql.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzc2JtYnVvcXNyb2xqc2F6eHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzY4ODQsImV4cCI6MjA2ODQxMjg4NH0.clMf0ENAz4RD97tQxWRqDHAytNVP2dTkeNhvs5WKgWE';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility functions for media handling
const supabaseStorage = {
    // Upload a file to Supabase storage
    uploadFile: async (file, path) => {
        try {
            let fileBuffer;

            // Handle both File objects and base64 strings
            if (typeof file === 'string' && file.startsWith('data:')) {
                // Convert base64 to blob
                const res = await fetch(file);
                const blob = await res.blob();
                fileBuffer = blob;
            } else if (file instanceof Blob || file instanceof File) {
                fileBuffer = file;
            } else {
                throw new Error('Invalid file format');
            }

            // Get file extension from type or name
            const fileExtension = (file.name && file.name.split('.').pop()) ||
                (file.type && file.type.split('/')[1]) ||
                'bin';

            const filePath = path || `uploads/${Date.now()}.${fileExtension}`;

            const { data, error } = await supabase.storage
                .from('media')
                .upload(filePath, fileBuffer, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Get the public URL
            const { data: publicUrlData } = supabase.storage
                .from('media')
                .getPublicUrl(filePath);

            return {
                path: filePath,
                url: publicUrlData.publicUrl,
                ...data
            };
        } catch (error) {
            console.error('Supabase storage upload error:', error);
            throw error;
        }
    },

    // Get a public URL for a file
    getPublicUrl: (path) => {
        const { data } = supabase.storage
            .from('media')
            .getPublicUrl(path);

        return data.publicUrl;
    },

    // Delete a file from storage
    deleteFile: async (path) => {
        try {
            const { data, error } = await supabase.storage
                .from('media')
                .remove([path]);

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Supabase storage delete error:', error);
            throw error;
        }
    }
};

export { supabase, supabaseStorage };
