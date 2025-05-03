const formatPagination = (data, page, limit, total) => {
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        pagination: {
            currentPage: page,
            itemsPerPage: limit,
            totalItems: total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            previousPage: page > 1 ? page - 1 : null
        }
    };
};

module.exports = formatPagination; 