import prisma from "../../config/prisma.js";


// helper function: exclude soft-deleted records and apply optional date range
const baseWhere = (filters = {}) => {
    const where = { isDeleted: false };

    if (filters.startDate || filters.endDate) {
        where.date = {}
        if (filters.startDate) where.date.gte = filters.startDate;
        if (filters.endDate) where.date.lte = filters.endDate;
    }

    return where;
}

/*
    summary metrics for dashboard cards
    returns: { totalIncome, totalExpense, netBalance, recordCount }
*/
export const getSummary = async (query) => {
    const where = baseWhere(query);

    const [incomeResult, expenseResult, recordCount] = await Promise.all([      // fetch results parallelly 
        prisma.financialRecord.aggregate({
            where: { ...where, type: "INCOME" },
            _sum: { amount: true }
        }),
        prisma.financialRecord.aggregate({
            where: { ...where, type: "EXPENSE" },
            _sum: { amount: true }
        }),
        prisma.financialRecord.count({ where })
    ]);

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpense = expenseResult._sum.amount || 0;

    return {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        recordCount
    }
}


/*
    category-wise aggregation for pie-charts or breakdown 
*/
export const getCategoryBreakdown = async (query) => {
    const where = baseWhere(query);
    if (query.type) where.type = query.type;

    const category = await prisma.financialRecord.groupBy({
        by: ["category"],
        where,
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: "desc" } }  // highest spending first
    });

    const total = category.reduce((sum, cat) => sum + (cat._sum.amount || 0), 0)

    return category.map((c) => ({
        category: c.category,
        total: c._sum.amount || 0,
        count: c._count.id,
        percentage: total > 0 ?
            parseFloat(((c._sum.amount || 0) / total) * 100).toFixed(2) :
            0
    }))
}

/*
    monthly trends for line charts (over time charts)
*/
export const getTrends = async (query) => {
    const { months } = query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);

    const where = { isDeleted: false, date: { gte: startDate } };

    const records = await prisma.financialRecord.findMany({
        where,
        select: { amount: true, type: true, date: true }
    })

    const monthMap = {};

    records.forEach((record) => {
        const date = new Date(record.date);

        // format: YYYY-MM
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!monthMap[key]) {
            monthMap[key] = { month: key, income: 0, expense: 0 }
        }

        // aggregate by type
        if (record.type === "INCOME") {
            monthMap[key].income += record.amount;
        } else {
            monthMap[key].expense += record.amount;
        }
    });

    return Object.values(monthMap)
        .sort(
            (a, b) => a.month.localeCompare(b.month)
        )
        .map(m => ({
            ...m,
            net: m.income - m.expense,
        }));
}

// latest records
export const getRecent = async (query) => {
    const { limit } = query;
    // const where = baseWhere(query);

    const records = await prisma.financialRecord.findMany({
        where: { isDeleted: false },
        include: {
            creator: {
                select: { id: true, name: true }    // include who created record
            }
        },
        orderBy: { createdAt: "desc" },     // newest first
        take: limit,
    })

    return records;
}