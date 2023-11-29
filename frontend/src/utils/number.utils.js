export const formatAmount = (num) => Number(num).toLocaleString(undefined,
    {maximumFractionDigits: 2, minimumFractionDigits: 2})

export const formatRate = (num) => Number(num).toFixed(4)