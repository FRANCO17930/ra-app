import { supabase } from "./supabase";
import { ARAsset } from "./labs-config";

// Table name in Supabase
const TABLE_NAME = "assets";

export async function getAssets(): Promise<ARAsset[]> {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching from Supabase:", error);
            // Fallback to localStorage for compatibility/offline
            if (typeof window !== "undefined") {
                const saved = localStorage.getItem("ra_assets");
                return saved ? JSON.parse(saved) : [];
            }
            return [];
        }

        // Map snake_case from DB to camelCase for ARAsset
        return (data || []).map(item => ({
            id: item.id,
            lab: item.lab,
            title: item.title,
            imageName: item.image_name,
            imageUrl: item.image_url,
            videoUrl: item.video_url
        }));
    } catch (error) {
        console.error("Critical error in getAssets:", error);
        return [];
    }
}

export async function saveAsset(asset: ARAsset) {
    try {
        const { error } = await supabase
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
            console.error("Error saving to Supabase:", error);
            // Fallback
            if (typeof window !== "undefined") {
                const saved = localStorage.getItem("ra_assets");
                const current = saved ? JSON.parse(saved) : [];
                localStorage.setItem("ra_assets", JSON.stringify([...current, asset]));
            }
            throw error;
        }
    } catch (error) {
        console.error("Critical error in saveAsset:", error);
        throw error;
    }
}

export async function deleteAsset(id: string) {
    try {
        // First get the asset to know the URLs (to potentially delete from storage later)
        // For now, just delete the record
        const { error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting from Supabase:", error);
            throw error;
        }
    } catch (error) {
        console.error("Critical error in deleteAsset:", error);
        throw error;
    }
}
