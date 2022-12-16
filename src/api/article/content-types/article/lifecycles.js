module.exports = {
    
    async beforeDelete(event) {
        const id = event.params.where.id;
        const article = await strapi.entityService.findOne(event.model.uid, id, {
            populate: { localizations: true },
        });
        if(article?.localizations?.length){
            article.localizations.forEach((localization) => {
                strapi.entityService.delete('api::article.article', localization.id);
            });
        }
    },
  
};