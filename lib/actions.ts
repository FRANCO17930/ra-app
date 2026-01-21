"use server";

import { createClient } from '@supabase/supabase-js';
import { ARAsset } from './labs-config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_j1Tff1oyJQgJOnMtrAXkEQ_U3F6H4J0';

// Client with Service Role (Bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const TABLE_NAME = "assets";
const CONFIG_TABLE = "lab_configs";

export async function serverSaveAsset(asset: ARAsset) {
    const { error } = await supabaseAdmin
        .from(TABLE_NAME)
        .insert([{
            id: asset.id,
            lab: asset.lab,
            title: asset.title,
            image_name: asset.imageName,
            image_url: asset.imageUrl,
            video_url: asset.videoUrl
        }]);

    if (error) {
        console.error("Error in serverSaveAsset:", error);
        throw new Error(error.message);
    }
    return { success: true };
}

export async function serverDeleteAsset(id: string) {
    const { error } = await supabaseAdmin
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error in serverDeleteAsset:", error);
        throw new Error(error.message);
    }
    return { success: true };
}

export async function serverSaveLabConfig(labName: string, markerUrl: string) {
    const { error } = await supabaseAdmin
        .from(CONFIG_TABLE)
        .upsert({
            lab_name: labName,
            marker_url: markerUrl
        }, { onConflict: 'lab_name' });

    if (error) {
        console.error("Error in serverSaveLabConfig:", error);
        throw new Error(error.message);
    }
    return { success: true };
}
