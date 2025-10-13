import { cn } from '@/lib/utils'

const MESCHAC_AVATAR = 'https://avatars.githubusercontent.com/u/47919550?v=4'
const BERNARD_AVATAR = 'https://avatars.githubusercontent.com/u/31113941?v=4'
const THEO_AVATAR = 'https://avatars.githubusercontent.com/u/68236786?v=4'
const GLODIE_AVATAR = 'https://avatars.githubusercontent.com/u/99137927?v=4'

export const Table = ({ className }: { className?: string }) => {
    const customers = [
        {
            id: 1,
            date: '10/31/2023',
            status: 'Paid',
            statusVariant: 'success',
            name: 'Bernard Ng',
            avatar: BERNARD_AVATAR,
            revenue: '$43.99',
        },
        {
            id: 2,
            date: '10/21/2023',
            status: 'Ref',
            statusVariant: 'warning',
            name: 'Méschac Irung',
            avatar: MESCHAC_AVATAR,
            revenue: '$19.99',
        },
        {
            id: 3,
            date: '10/15/2023',
            status: 'Paid',
            statusVariant: 'success',
            name: 'Glodie Ng',
            avatar: GLODIE_AVATAR,
            revenue: '$99.99',
        },
        {
            id: 4,
            date: '10/12/2023',
            status: 'Cancelled',
            statusVariant: 'danger',
            name: 'Theo Ng',
            avatar: THEO_AVATAR,
            revenue: '$19.99',
        },
        {
            id: 5,
            date: '10/12/2024',
            status: 'Paid',
            statusVariant: 'success',
            name: 'Shadcn',
            avatar: '/avatars/shadcn.jpg',
            revenue: '$49.99',
        },
    ]

    return (
        <div className={cn('border-border-illustration bg-illustration relative w-full overflow-hidden rounded-xl border p-6 shadow-md', className)}>
            <div className="mb-6">
                <div className="mb-3 flex gap-1">
                    <span className="bg-foreground/10 border-foreground/5 size-2.5 rounded-full border"></span>
                    <span className="bg-foreground/10 border-foreground/5 size-2.5 rounded-full border"></span>
                    <span className="bg-foreground/10 border-foreground/5 size-2.5 rounded-full border"></span>
                </div>
                <div className="text-lg font-medium">Customers</div>
                <p className="text-muted-foreground mt-1 text-sm">New users by First user primary channel group...</p>
            </div>
            <table
                className="w-full table-auto border-collapse md:max-w-2xl"
                data-rounded="medium">
                <thead className="bg-background">
                    <tr className="*:p-3 *:text-left *:text-sm *:font-medium">
                        <th className="rounded-l-(--radius)">#</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Customer</th>
                        <th className="rounded-r-(--radius)">Revenue</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {customers.map((customer, index) => (
                        <tr
                            key={customer.id}
                            className="*:border-b *:border-dashed *:px-2 *:py-3">
                            <td>{customer.id}</td>
                            <td>{customer.date}</td>
                            <td>
                                <span className={cn('rounded-full px-2 py-1 text-xs', customer.statusVariant == 'success' && 'bg-lime-500/15 text-lime-200', customer.statusVariant == 'danger' && 'bg-red-500/15 text-red-200', customer.statusVariant == 'warning' && 'bg-yellow-500/15 text-yellow-200')}>{customer.status}</span>
                            </td>
                            <td>
                                <div className="text-title flex items-center gap-2">
                                    <div className="size-5 overflow-hidden rounded-full">
                                        <img
                                            src={customer.avatar}
                                            alt={customer.name}
                                            width="120"
                                            height="120"
                                            loading="lazy"
                                        />
                                    </div>
                                    <span className="text-foreground text-nowrap">{customer.name}</span>
                                </div>
                            </td>
                            <td>{customer.revenue}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}