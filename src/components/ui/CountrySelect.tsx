import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { countries } from "../../data/countries";

export const CountrySelect = ({
    value,
    onChange
}: {
    value: string,
    onChange: (code: string) => void
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    const selectedCountry = countries.find(c => c.code === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-bold text-gray-700 mb-2">Country</label>
            <div
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer flex items-center justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={selectedCountry ? "text-gray-900" : "text-gray-400"}>
                    {selectedCountry ? selectedCountry.name : "Select Country"}
                </span>
                <ChevronDown className="w-5 h-5 text-gray-500" />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-80 overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-gray-100">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6A3E1D]/20"
                                placeholder="Search country..."
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                        {filteredCountries.map((country) => (
                            <div
                                key={country.code}
                                className={`p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${value === country.code ? 'bg-[#6A3E1D]/5 text-[#6A3E1D]' : 'text-gray-700'}`}
                                onClick={() => {
                                    onChange(country.code);
                                    setIsOpen(false);
                                    setSearch("");
                                }}
                            >
                                <span>{country.name}</span>
                                {value === country.code && <Check className="w-4 h-4 text-[#6A3E1D]" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};