
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ReleaseNote } from "@/components/ReleaseCard";
import { useToast } from "@/components/ui/use-toast";

export function useReleases() {
  const [releases, setReleases] = useState<ReleaseNote[]>([]);
  const { toast } = useToast();

  const fetchReleases = async () => {
    try {
      const { data: releasesData, error: releasesError } = await supabase
        .from('releases')
        .select(`
          *,
          media (*),
          release_tags (
            tag_id,
            tags (*)
          )
        `);

      if (releasesError) throw releasesError;

      const transformedReleases: ReleaseNote[] = releasesData.map(release => ({
        id: release.id,
        title: release.title,
        description: release.description,
        datetime: release.datetime,
        category: release.category as "feature" | "bugfix" | "enhancement",
        tags: release.release_tags.map(rt => rt.tags),
        media: release.media ? release.media.map(m => ({
          type: m.type as "image" | "video",
          url: m.url
        })) : undefined
      }));

      console.log('Fetched releases:', transformedReleases);
      setReleases(transformedReleases);
    } catch (error) {
      console.error('Error fetching releases:', error);
      toast({
        title: "Error",
        description: "Failed to fetch releases. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveRelease = async (updatedRelease: Partial<ReleaseNote>) => {
    try {
      // Insert or update the release
      const releaseData = {
        title: updatedRelease.title,
        description: updatedRelease.description,
        category: updatedRelease.category,
        datetime: updatedRelease.datetime
      };

      let releaseId: string;
      
      if (updatedRelease.id && !updatedRelease.id.startsWith('new-')) {
        // Update existing release
        const { error: updateError } = await supabase
          .from('releases')
          .update(releaseData)
          .eq('id', updatedRelease.id);

        if (updateError) throw updateError;
        releaseId = updatedRelease.id;
      } else {
        // Insert new release
        const { data: newRelease, error: insertError } = await supabase
          .from('releases')
          .insert(releaseData)
          .select()
          .single();

        if (insertError) throw insertError;
        if (!newRelease) throw new Error('No release was created');
        releaseId = newRelease.id;
      }

      // Handle tags
      if (updatedRelease.tags) {
        // Delete existing release tags
        await supabase
          .from('release_tags')
          .delete()
          .eq('release_id', releaseId);

        // Insert new tags and release_tags
        for (const tag of updatedRelease.tags) {
          // Insert or update tag
          const { data: tagData, error: tagError } = await supabase
            .from('tags')
            .upsert({ 
              id: tag.id && !tag.id.startsWith('new-') ? tag.id : undefined,
              name: tag.name, 
              color: tag.color 
            })
            .select()
            .single();

          if (tagError) throw tagError;
          if (!tagData) throw new Error('No tag was created');

          // Create release-tag relationship
          const { error: releaseTagError } = await supabase
            .from('release_tags')
            .insert({
              release_id: releaseId,
              tag_id: tagData.id
            });

          if (releaseTagError) throw releaseTagError;
        }
      }

      // Handle media
      if (updatedRelease.media) {
        // Delete existing media
        await supabase
          .from('media')
          .delete()
          .eq('release_id', releaseId);

        // Insert new media
        const mediaInserts = updatedRelease.media.map(media => ({
          release_id: releaseId,
          type: media.type,
          url: media.url
        }));

        const { error: mediaError } = await supabase
          .from('media')
          .insert(mediaInserts);

        if (mediaError) throw mediaError;
      }

      await fetchReleases();
      
      toast({
        title: updatedRelease.id ? "Release updated" : "Release created",
        description: `Successfully ${updatedRelease.id ? "updated" : "created"} the release note.`,
      });

      return Promise.resolve();
    } catch (error) {
      console.error('Error saving release:', error);
      toast({
        title: "Error",
        description: "Failed to save the release note. Please try again.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  return {
    releases,
    fetchReleases,
    handleSaveRelease
  };
}
