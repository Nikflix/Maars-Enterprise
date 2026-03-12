
import { useState, useCallback, useRef } from 'react';

interface HumanizeResult {
    humanized_content: string;
    sections_processed: number;
    original_length: number;
    humanized_length: number;
}

interface UseHumanizerReturn {
    isHumanizing: boolean;
    progress: number;
    humanizedContent: string | null;
    error: string | null;
    startHumanize: (content: string) => Promise<void>;
    reset: () => void;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const useHumanizer = (): UseHumanizerReturn => {
    const [isHumanizing, setIsHumanizing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [humanizedContent, setHumanizedContent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const pollInterval = useRef<NodeJS.Timeout | null>(null);

    const reset = useCallback(() => {
        setIsHumanizing(false);
        setProgress(0);
        setHumanizedContent(null);
        setError(null);
        if (pollInterval.current) clearInterval(pollInterval.current);
    }, []);

    const startHumanize = useCallback(async (content: string) => {
        reset();
        setIsHumanizing(true);
        setError(null);

        try {
            // 1. Start Job
            const startRes = await fetch(`${BACKEND_URL}/api/humanize/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });

            if (!startRes.ok) throw new Error('Failed to start humanization');
            const { jobId } = await startRes.json();

            // 2. Poll Status
            pollInterval.current = setInterval(async () => {
                try {
                    const statusRes = await fetch(`${BACKEND_URL}/api/humanize/status/${jobId}`);
                    if (!statusRes.ok) {
                        throw new Error('Failed to fetch status');
                    }

                    const statusData = await statusRes.json();

                    if (statusData.status === 'processing' || statusData.status === 'pending') {
                        setProgress(statusData.progress || 0);
                    } else if (statusData.status === 'completed') {
                        if (pollInterval.current) clearInterval(pollInterval.current);

                        const resultRes = await fetch(`${BACKEND_URL}/api/humanize/result/${jobId}`);
                        if (!resultRes.ok) throw new Error('Failed to fetch result');

                        const resultData: HumanizeResult = await resultRes.json();
                        setHumanizedContent(resultData.humanized_content);
                        setIsHumanizing(false);
                        setProgress(100);
                    } else if (statusData.status === 'error') {
                        throw new Error(statusData.error || 'Humanization failed');
                    }
                } catch (err: any) {
                    if (pollInterval.current) clearInterval(pollInterval.current);
                    setError(err.message);
                    setIsHumanizing(false);
                }
            }, 2000);

        } catch (err: any) {
            setError(err.message);
            setIsHumanizing(false);
        }
    }, [reset]);

    return {
        isHumanizing,
        progress,
        humanizedContent,
        error,
        startHumanize,
        reset
    };
};
