export const qk = {
    auth: {
        me: ["auth", "me"] as const,
    },
    home: {
        overview: ["home", "overview"] as const,
        salesChart: (granularity: string) => ["home", "sales-chart", granularity] as const,
        inventory: ["home", "inventory"] as const,
        topProducts: ["home", "top-products"] as const,
        lastTransactions: ["home", "last-transactions"] as const,
    },
    auditLogs: {
        all: ["audit-logs"] as const,
        list: (filter?: object) => ["audit-logs", "list", filter ?? {}] as const,
        detail: (id: string) => ["audit-logs", "detail", id] as const,
    },
    branches: {
        all: ["branches"] as const,
        list: (filter?: object) => ["branches", "list", filter ?? {}] as const,
        detail: (id: string) => ["branches", "detail", id] as const,
    },
    categoryProducts: {
        all: ['category-product'] as const,
        list: (filter?: object) => ["category-product", "list", filter ?? {}] as const,
        detail: (id: string) => ["category-product", "detail", id] as const
    },
    products: {
        all: ["products"] as const,
        list: (filter?: object) => ["products", "list", filter ?? {}] as const,
        detail: (id: string) => ["products", "detail", id] as const,
    },
    shifts: {
        all: ["shifts"] as const,
        list: (filter?: object) => ["shifts", "list", filter ?? {}] as const,
    },
} as const;