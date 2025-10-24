import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (should be in environment variables)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const storageService = {
    /**
     * Upload a media file to Supabase storage
     * @param {Object} mediaFile - Media file object from IndexedDB
     * @returns {Promise<Object>} - Upload result with URL
     */
    uploadMedia: async (mediaFile) => {
        try {
            // Extract file data from base64 string
            const base64Data = mediaFile.data.split(',')[1];
            const blob = await fetch(`data:${mediaFile.mimeType};base64,${base64Data}`).then(res => res.blob());

            // Create file object
            const file = new File([blob], mediaFile.fileName, { type: mediaFile.mimeType });

            // Determine folder based on media type
            const folder = mediaFile.type === 'image' ? 'images' : 'videos';

            // Create a unique file path
            const filePath = `${folder}/${mediaFile.donorId}/${Date.now()}-${mediaFile.fileName}`;

            // Upload to Supabase
            const { data, error } = await supabase.storage
                .from('donor-media')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('donor-media')
                .getPublicUrl(filePath);

            return {
                path: filePath,
                url: urlData.publicUrl,
                mediaType: mediaFile.type
            };
        } catch (error) {
            console.error('Error uploading media to Supabase:', error);
            throw error;
        }
    },

    /**
     * Delete a media file from Supabase storage
     * @param {string} filePath - Path to file in Supabase
     * @returns {Promise<void>}
     */
    deleteMedia: async (filePath) => {
        try {
            const { error } = await supabase.storage
                .from('donor-media')
                .remove([filePath]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting media from Supabase:', error);
            throw error;
        }
    }
};

export default storageService;
