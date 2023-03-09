module.exports = {
    
    async afterUpdate(event) {

        const { result } = event;
        const reviewId = result.id;

        const company = await strapi.db.query('api::aanbieder.aanbieder').findOne({
            where: { reviews: reviewId },
            populate: ['reviews']
        });

        if(company && Array.isArray(company?.reviews) && company?.reviews?.length > 0){
            let rates = 0;
            company.reviews.forEach(review => {
                rates += review.score;
            });
            const average = rates / company.reviews.length;
            let newCompanyRate = Math.round(average * 10) / 10;
            if(isNaN(newCompanyRate)) newCompanyRate = 0;
            await strapi.entityService.update('api::aanbieder.aanbieder', company.id, { 
                data: { rating: newCompanyRate } 
            });
        }

    },

    async beforeDelete(event) {

        const { params } = event;
        const reviewId = params.where.id;

        const company = await strapi.db.query('api::aanbieder.aanbieder').findOne({
            where: { reviews: reviewId },
            populate: ['reviews']
        });

        if(company && Array.isArray(company?.reviews) && company?.reviews?.length > 0){
            let rates = 0;
            company.reviews.forEach(review => {
                if(review.id != reviewId) rates += review?.score;
            });
            const average = rates / (company.reviews.length - 1 );
            let newCompanyRate = Math.round(average * 10) / 10;
            if(isNaN(newCompanyRate)) newCompanyRate = 0;
            await strapi.entityService.update('api::aanbieder.aanbieder', company.id, { 
                data: { rating: newCompanyRate } 
            });
        }

    },
};