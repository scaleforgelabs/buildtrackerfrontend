"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

interface Country {
    name: {
        common: string;
    };
    idd: {
        root?: string;
        suffixes?: string[];
    };
    flags: {
        png: string;
        svg: string;
    };
}

interface CountrySelectProps {
    value: string;
    onChange: (code: string) => void;
    disabled?: boolean;
}

export function CountrySelect({ value, onChange, disabled = false }: CountrySelectProps) {
    const [countries, setCountries] = useState<Country[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetch(
            "https://restcountries.com/v3.1/all?fields=name,idd,flags"
        )
            .then(res => res.json())
            .then(data => {
                const filtered = data.filter(
                    (c: Country) => c.idd?.root && c.idd?.suffixes?.length
                );
                setCountries(filtered);
            });
    }, []);

    const selected =
        countries.find(c =>
            `${c.idd.root}${c.idd.suffixes?.[0]}` === value
        ) || null;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                className="flex h-11 items-center gap-2 rounded-l-lg border border-r-0 border-border bg-background px-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {selected && (
                    <Image
                        src={selected.flags.png}
                        alt={selected.name.common}
                        width={20}
                        height={14}
                    />
                )}
                <span className="text-sm font-medium text-gray-700">
                    {value}
                </span>
                <ChevronDown className="h-10 w-10 text-gray-500" />
            </button>

            {open && (
                <div className="absolute left-0 top-12 z-50 max-h-64 w-72 overflow-auto rounded-lg border bg-background shadow-lg">
                    {countries.map(country => {
                        const dialCode = `${country.idd.root}${country.idd.suffixes?.[0]}`;

                        return (
                            <button
                                key={country.name.common}
                                type="button"
                                onClick={() => {
                                    onChange(dialCode);
                                    setOpen(false);
                                }}
                                className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-card"
                            >
                                <Image
                                    src={country.flags.png}
                                    alt={country.name.common}
                                    width={20}
                                    height={14}
                                />
                                <span className="flex-1 text-left">
                                    {country.name.common}
                                </span>
                                <span className="text-gray-500">{dialCode}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
