import { supabase } from './supabase';
import { ShitsumonKobo_Content } from '../types';

export const getPublicContents = async (): Promise<ShitsumonKobo_Content[]> => {
  try {
    const { data, error } = await supabase
      .from('shitsumon_contents')
      .select('*')
      .eq('isPublic', true);
      
    if (error) throw error;
    
    // Convert stringified fields if any, or just return as is if Supabase returns JSON
    return (data || []) as unknown as ShitsumonKobo_Content[];
  } catch (error) {
    console.error("Failed to get public contents", error);
    return [];
  }
};

export const getMyContents = async (userId: string | null): Promise<ShitsumonKobo_Content[]> => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('shitsumon_contents')
      .select('*')
      .eq('creatorId', userId);
      
    if (error) throw error;
    return (data || []) as unknown as ShitsumonKobo_Content[];
  } catch (error) {
    console.error("Failed to get my contents", error);
    return [];
  }
};

export const getContentById = async (id: string): Promise<ShitsumonKobo_Content | null> => {
  try {
    const { data, error } = await supabase
      .from('shitsumon_contents')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return null; // not found
      throw error;
    }
    return (data || null) as unknown as ShitsumonKobo_Content | null;
  } catch (error) {
    console.error("Failed to get content", error);
    return null;
  }
};

export const saveContent = async (content: ShitsumonKobo_Content): Promise<void> => {
  try {
    if (!content.id) {
      content.id = "ShitsumonKobo_" + Math.random().toString(36).substr(2, 9);
    }
    const cleanData = JSON.parse(JSON.stringify(content, (k, v) => v === undefined ? null : v));
    
    const { error } = await supabase
      .from('shitsumon_contents')
      .upsert(cleanData, { onConflict: 'id' });
      
    if (error) throw error;
  } catch (error) {
    console.error("Failed to save content", error);
    throw error;
  }
};

export const deleteContent = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('shitsumon_contents')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  } catch (error) {
    console.error("Failed to delete content", error);
    throw error;
  }
};

export const syncUserPlayHistory = async (userId: string, history: ShitsumonKobo_Content[]): Promise<void> => {
  try {
    const minimalHistory = history.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      creatorName: item.creatorName || "",
      description: item.description ? item.description.substring(0, 100) : "",
      themeColorMode: item.themeColorMode || "auto",
      customColor: item.customColor || "",
    }));
    
    const { error } = await supabase
      .from('shitsumon_user_profiles')
      .upsert({ user_id: userId, play_history: minimalHistory }, { onConflict: 'user_id' });
      
    if (error) throw error;
  } catch (error) {
    console.error("Failed to sync play history", error);
  }
};

export const getUserPlayHistory = async (userId: string): Promise<ShitsumonKobo_Content[]> => {
  try {
    const { data, error } = await supabase
      .from('shitsumon_user_profiles')
      .select('play_history')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return [];
      throw error;
    }
    
    return (data?.play_history || []) as ShitsumonKobo_Content[];
  } catch (error) {
    console.error("Failed to get play history", error);
    return [];
  }
};
