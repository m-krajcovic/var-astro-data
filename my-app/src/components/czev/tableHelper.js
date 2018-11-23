
export const sortOrder = {
    "ascend": "asc",
    "descend": "desc"
};

export const sorterToParam = (sorter) => {
    return `${sorter.field},${sortOrder[sorter.order]}`
};
