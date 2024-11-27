import { Search } from 'lucide-react';
import SearchFilters from './SearchFilters';

export default function SearchLookup() {

    return (
        <div className="p-6">
            <div className="max-w-[2000px] mx-auto">
                <div className="mb-6">
                    <form>
                        <div className="flex items-center space-x-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, location, or case ID..."
                                    className="w-full pl-12 pr-4 py-3 bg-white border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary py-3"
                            >
                                Search Database
                            </button>
                        </div>
                    </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <SearchFilters
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}