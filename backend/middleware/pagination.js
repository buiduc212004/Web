const pagination = (model) => {
    return async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        try {
            const results = {};
            const total = await model.countDocuments();

            if (endIndex < total) {
                results.next = {
                    page: page + 1,
                    limit: limit
                };
            }

            if (startIndex > 0) {
                results.previous = {
                    page: page - 1,
                    limit: limit
                };
            }

            results.total = total;
            results.pages = Math.ceil(total / limit);
            results.currentPage = page;

            req.pagination = {
                startIndex,
                limit,
                results
            };

            next();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
};

module.exports = pagination; 