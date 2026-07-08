import { supabase } from './supabase';

export const savePlayLog = async (contentId: string, creatorXHandle: string | undefined, data: any) => {
  try {
    const cleanData = JSON.parse(JSON.stringify(data, (k, v) => v === undefined ? null : v));
    
    const { error } = await supabase
      .from('shitsumon_play_logs')
      .insert({
        content_id: contentId,
        creator_x_handle: creatorXHandle || "unknown",
        played_at: new Date().toISOString(),
        user_id: (await supabase.auth.getSession()).data.session?.user?.id || "anonymous",
        data: cleanData
      });
      
    if (error) throw error;
  } catch (error) {
    console.error("Failed to save play log", error);
  }
};

export const getPlayStats = async (contentId: string) => {
  try {
    const { data, error } = await supabase
      .from('shitsumon_play_logs')
      .select('data')
      .eq('content_id', contentId);
      
    if (error) throw error;
    
    return data.map(row => row.data);
  } catch (error) {
    console.error("Failed to get play stats", error);
    return [];
  }
};

export const onSnapshotPlayStats = (contentId: string, callback: (logs: any[]) => void) => {
  // Supabase realtime subscription
  const channel = supabase.channel(`public:shitsumon_play_logs:content_id=eq.${contentId}_${Math.random()}`)
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'shitsumon_play_logs',
      filter: `content_id=eq.${contentId}`
    }, (payload) => {
      // Instead of relying purely on incremental, we could just fetch all or prepend.
      // Since we just want all logs, let's fetch initially and then append.
      getPlayStats(contentId).then(callback);
    })
    .subscribe();
    
  // Initial fetch
  getPlayStats(contentId).then(callback);

  return () => {
    supabase.removeChannel(channel);
  };
};
