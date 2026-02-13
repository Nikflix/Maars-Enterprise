
interface Match {
    matched_text: string;
    similarity_score?: number;
}

/**
 * Highlights matched text segments within the content.
 * 
 * @param content The full text content.
 * @param matches Array of Match objects containing matched_text.
 * @returns HTML string with <span> tags wrapping matched segments.
 */
export const highlightText = (content: string, matches: Match[]): string => {
    if (!matches || matches.length === 0) return content;

    let highlightedContent = content;

    // Simple replacement strategy. 
    // In a real production app, this would need more robust offset-based handling 
    // to avoid replacing text inside existing HTML tags or overlapping matches.
    matches.forEach(match => {
        const text = match.matched_text;
        // Escape regex special characters in the text to match
        const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Create a regex to find the text case-insensitively
        const regex = new RegExp(`(${escapedText})`, 'gi');

        // Wrap in a span with a highlight class
        // distinct classes for different severity could be added here
        highlightedContent = highlightedContent.replace(regex, '<span class="bg-red-500/30 text-red-200 border-b border-red-500/50 cursor-help" title="Potential Plagiarism Match">$1</span>');
    });

    return highlightedContent;
};
