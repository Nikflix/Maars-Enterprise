
import { useState, useCallback, useRef } from 'react';

interface PlagiarismResult {
    similarity_score: number;
    checked_sentences: number;
    matches_found: number;
    matched_sources: Array<{
        url: string;
        title: string;
        matched_text: string;
    }>;
    status: 'low' | 'medium' | 'high';
}

interface UsePlagiarismReturn {
    isScanning: boolean;
    progress: number;
    result: PlagiarismResult | null;
    error: string | null;
    startScan: (paperId: string, content: string) => Promise<void>;
    resetScan: () => void;
}

const BACKEND_URL = 'http://localhost:8001';

export const usePlagiarism = (): UsePlagiarismReturn => {
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<PlagiarismResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // To clear interval on component unmount or reset
    const pollInterval = useRef<NodeJS.Timeout | null>(null);

    const resetScan = useCallback(() => {
        setIsScanning(false);
        setProgress(0);
        setResult(null);
        setError(null);
        if (pollInterval.current) clearInterval(pollInterval.current);
    }, []);

    const startScan = useCallback(async (paperId: string, content: string) => {
        resetScan();
        setIsScanning(true);
        setError(null);

        try {
            // 1. Start Job
            const startRes = await fetch(`${BACKEND_URL}/api/plagiarism/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paperId, content }),
            });

            if (!startRes.ok) throw new Error('Failed to start scan');
            const { jobId } = await startRes.json();

            // 2. Poll Status
            pollInterval.current = setInterval(async () => {
                try {
                    const statusRes = await fetch(`${BACKEND_URL}/api/plagiarism/status/${jobId}`);
                    if (!statusRes.ok) {
                        // If 404/500, stop polling
                        throw new Error('Failed to fetch status');
                    }

                    const statusData = await statusRes.json();

                    if (statusData.status === 'processing' || statusData.status === 'pending') {
                        setProgress(statusData.progress || 0);
                    } else if (statusData.status === 'completed') {
                        // 3. Fetch Result
                        if (pollInterval.current) clearInterval(pollInterval.current);

                        const resultRes = await fetch(`${BACKEND_URL}/api/plagiarism/result/${jobId}`);
                        if (!resultRes.ok) throw new Error('Failed to fetch result');

                        const resultData = await resultRes.json();
                        setResult(resultData);
                        setIsScanning(false);
                        setProgress(100);
                    } else if (statusData.status === 'error') {
                        throw new Error(statusData.error || 'Unknown error occurred');
                    }
                } catch (err: any) {
                    if (pollInterval.current) clearInterval(pollInterval.current);
                    setError(err.message);
                    setIsScanning(false);
                }
            }, 2000); // Poll every 2 seconds

        } catch (err: any) {
            setError(err.message);
            setIsScanning(false);
        }
    }, [resetScan]);

    return {
        isScanning,
        progress,
        result,
        error,
        startScan,
        resetScan
    };
};
