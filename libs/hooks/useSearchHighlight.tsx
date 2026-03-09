"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Hook that highlights matching text on the page based on the `q` URL param.
 * Uses DOM TreeWalker + MutationObserver for robust dynamic content support.
 */
export function useSearchHighlight(containerRef?: React.RefObject<HTMLElement | null>) {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const observerRef = useRef<MutationObserver | null>(null);

    const clearHighlights = useCallback((root: HTMLElement) => {
        const marks = root.querySelectorAll('mark[data-search-highlight]');
        marks.forEach((mark) => {
            const parent = mark.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
                parent.normalize();
            }
        });
    }, []);

    const applyHighlights = useCallback((root: HTMLElement, searchText: string) => {
        if (!searchText || searchText.length < 2) return;

        const lowerSearch = searchText.toLowerCase();
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => {
                const parent = node.parentElement;
                if (!parent) return NodeFilter.FILTER_REJECT;
                const tag = parent.tagName.toLowerCase();
                if (tag === 'script' || tag === 'style' || tag === 'mark' || tag === 'input' || tag === 'textarea' || tag === 'svg') {
                    return NodeFilter.FILTER_REJECT;
                }
                if ((node.textContent || '').toLowerCase().includes(lowerSearch)) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_REJECT;
            }
        });

        const matchingNodes: Text[] = [];
        let currentNode: Node | null;
        while ((currentNode = walker.nextNode())) {
            matchingNodes.push(currentNode as Text);
        }

        matchingNodes.forEach((textNode) => {
            const text = textNode.textContent || '';
            const lowerText = text.toLowerCase();
            const parts: (string | HTMLElement)[] = [];
            let lastIdx = 0;
            let idx = lowerText.indexOf(lowerSearch, lastIdx);

            while (idx !== -1) {
                if (idx > lastIdx) parts.push(text.substring(lastIdx, idx));
                const mark = document.createElement('mark');
                mark.setAttribute('data-search-highlight', 'true');
                mark.style.backgroundColor = '#fbbf24';
                mark.style.color = '#1a1a1a';
                mark.style.padding = '1px 3px';
                mark.style.borderRadius = '3px';
                mark.style.fontWeight = '600';
                mark.textContent = text.substring(idx, idx + searchText.length);
                parts.push(mark);
                lastIdx = idx + searchText.length;
                idx = lowerText.indexOf(lowerSearch, lastIdx);
            }

            if (lastIdx < text.length) parts.push(text.substring(lastIdx));
            if (parts.length <= 1) return;

            const fragment = document.createDocumentFragment();
            parts.forEach(part => {
                if (typeof part === 'string') {
                    fragment.appendChild(document.createTextNode(part));
                } else {
                    fragment.appendChild(part);
                }
            });
            textNode.parentNode?.replaceChild(fragment, textNode);
        });
    }, []);

    useEffect(() => {
        const root = containerRef?.current || document.querySelector('[data-search-highlight-root]') as HTMLElement;
        if (!root) return;

        // Clean up existing observer
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }

        clearHighlights(root);

        if (!query || query.length < 2) return;

        // Apply with delay to let React render
        const applyWithDelay = () => {
            clearHighlights(root);
            applyHighlights(root, query);
        };

        // Initial apply after content loads
        const timer = setTimeout(applyWithDelay, 500);

        // Re-apply when DOM changes (dynamic content loading)
        observerRef.current = new MutationObserver(() => {
            // Debounce observer callbacks
            clearTimeout(reapplyTimer);
            reapplyTimer = setTimeout(applyWithDelay, 400);
        });

        let reapplyTimer: NodeJS.Timeout;

        observerRef.current.observe(root, {
            childList: true,
            subtree: true,
        });

        return () => {
            clearTimeout(timer);
            clearTimeout(reapplyTimer);
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
            clearHighlights(root);
        };
    }, [query, clearHighlights, applyHighlights, containerRef]);

    return { query, clearHighlights };
}
