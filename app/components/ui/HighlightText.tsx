"use client";

import React from "react";

interface HighlightTextProps {
    text: string;
    query: string;
    className?: string;
}

/**
 * Renders text with matching portions highlighted in yellow.
 * Used to visually indicate search matches in list items.
 */
export default function HighlightText({ text, query, className }: HighlightTextProps) {
    if (!query || query.length < 2 || !text) {
        return <span className={className}>{text}</span>;
    }

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    let idx = lowerText.indexOf(lowerQuery, lastIndex);
    while (idx !== -1) {
        // Text before match
        if (idx > lastIndex) {
            parts.push(<span key={`t-${lastIndex}`}>{text.substring(lastIndex, idx)}</span>);
        }
        // Highlighted match
        parts.push(
            <mark
                key={`h-${idx}`}
                className="bg-yellow-300 text-foreground px-0.5 rounded-sm"
            >
                {text.substring(idx, idx + query.length)}
            </mark>
        );
        lastIndex = idx + query.length;
        idx = lowerText.indexOf(lowerQuery, lastIndex);
    }

    // Remaining text
    if (lastIndex < text.length) {
        parts.push(<span key={`t-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }

    return <span className={className}>{parts}</span>;
}
