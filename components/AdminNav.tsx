import Link from "next/link"

export default function AdminNav ({ pageName }: {
    pageName: string
}) {

    const getBg = (page: string): string => {
        return page === pageName ? 'bg-primary text-white' : 'bg-gray-300/40 hover:bg-gray-400/30';
    }
    
    return (
        <div className="text-sm font-medium">
            <div className="flex items-center gap-2 py-2 mb-2">
                <button className={`rounded-lg transition-colors ${getBg('/')}`}>
                    <Link href={`/i/admin`} className="block px-3 py-1">
                        Reasons
                    </Link>
                </button>
                <button className={`rounded-lg transition-colors ${getBg('locations')}`}>
                    <Link href={`/i/admin/locations`} className="block px-3 py-1">
                        Locations
                    </Link>
                </button>
                <button className={`rounded-lg transition-colors ${getBg('items')}`}>
                    <Link href={`/i/admin/items`} className="block px-3 py-1">
                        Items
                    </Link>
                </button>
                <button className={`rounded-lg transition-colors ${getBg('users')}`}>
                    <Link href={`/i/admin/users`} className="block px-3 py-1">
                        Users
                    </Link>
                </button>
            </div>
        </div>
    )
}