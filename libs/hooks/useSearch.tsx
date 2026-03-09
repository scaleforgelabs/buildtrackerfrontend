"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchService, SearchResult, SearchCategories } from '@/app/services/search';
import { useWorkspace } from '@/libs/hooks/useWorkspace';

interface UseSearchReturn {
    query: string;
    setQuery: (q: string) => void;
    results: SearchResult[];
    categories: SearchCategories | null;
    suggestions: string[];
    loading: boolean;
    error: string | null;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    clearSearch: () => void;
}

export function useSearch(): UseSearchReturn {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [categories, setCategories] = useState<SearchCategories | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const { currentWorkspace } = useWorkspace();
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery || searchQuery.length < 2) {
            setResults([]);
            setCategories(null);
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (currentWorkspace) {
                // Workspace-scoped search
                const data = await SearchService.workspaceSearch(currentWorkspace.id, searchQuery);
                setResults(data.results);
                setSuggestions(data.suggestions || []);
                setCategories(null);
            } else {
                // Global search
                const data = await SearchService.globalSearch(searchQuery);
                setResults(data.results);
                setCategories(data.categories);
                setSuggestions([]);
            }
            setIsOpen(true);
        } catch (err: any) {
            console.error('Search error:', err);
            setError(err.response?.data?.error || 'Search failed');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [currentWorkspace]);

    // Debounced search effect
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!query || query.length < 2) {
            setResults([]);
            setCategories(null);
            setSuggestions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        debounceRef.current = setTimeout(() => {
            performSearch(query);
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, performSearch]);

    const clearSearch = useCallback(() => {
        setQuery('');
        setResults([]);
        setCategories(null);
        setSuggestions([]);
        setIsOpen(false);
        setError(null);
    }, []);

    return {
        query,
        setQuery,
        results,
        categories,
        suggestions,
        loading,
        error,
        isOpen,
        setIsOpen,
        clearSearch,
    };
}
