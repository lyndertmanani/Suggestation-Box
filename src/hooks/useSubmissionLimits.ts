import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionId } from './useSessionId';

export const useSubmissionLimits = () => {
  const sessionId = useSessionId();
  const [userId, setUserId] = useState<string | null>(null);
  const [suggestionCount, setSuggestionCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const initializeUser = async () => {
      try {
        // Check if user exists with this session_id
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        let currentUserId: string;

        if (existingUser) {
          currentUserId = existingUser.id;
        } else {
          // Create new user
          const { data: newUser } = await supabase
            .from('users')
            .insert({
              session_id: sessionId
            })
            .select()
            .single();

          if (!newUser) throw new Error('Failed to create user');
          currentUserId = newUser.id;
        }

        setUserId(currentUserId);

        // Get submission counts
        const [suggestionsResult, feedbackResult] = await Promise.all([
          supabase
            .from('suggestions')
            .select('id')
            .eq('user_id', currentUserId),
          supabase
            .from('feedback')
            .select('id')
            .eq('user_id', currentUserId)
        ]);

        setSuggestionCount(suggestionsResult.data?.length || 0);
        setFeedbackCount(feedbackResult.data?.length || 0);
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [sessionId]);

  const canSubmitSuggestion = suggestionCount < 2;
  const canSubmitFeedback = feedbackCount < 1;

  return {
    userId,
    suggestionCount,
    feedbackCount,
    canSubmitSuggestion,
    canSubmitFeedback,
    loading,
    refreshCounts: async () => {
      if (!userId) return;
      
      const [suggestionsResult, feedbackResult] = await Promise.all([
        supabase
          .from('suggestions')
          .select('id')
          .eq('user_id', userId),
        supabase
          .from('feedback')
          .select('id')
          .eq('user_id', userId)
      ]);

      setSuggestionCount(suggestionsResult.data?.length || 0);
      setFeedbackCount(feedbackResult.data?.length || 0);
    }
  };
};