module.exports = {
    
    async afterUpdate(event) {

        const { result } = event;
        const companyId = result.id;
        const company = await strapi.db.query('api::aanbieder.aanbieder').findOne({
            where: { id: companyId },
            populate: ['coordinates', 'bbox']
        });

        const {id, flexible_location, bbox, coordinates, location_radius} = company;

        if (flexible_location == true && coordinates.latitude && coordinates.longitude && location_radius){
            const distanceOffset = location_radius * 0.01;
            const new_bbox = {
                lat_min : coordinates.latitude - distanceOffset,
                lat_max : coordinates.latitude + distanceOffset,
                long_min : coordinates.longitude - distanceOffset,
                long_max : coordinates.longitude + distanceOffset,
            };

            if( !bbox || 
                new_bbox.lat_min != bbox?.lat_min ||
                new_bbox.lat_max != bbox?.lat_max ||
                new_bbox.long_min != bbox?.long_min ||
                new_bbox.long_max != bbox?.long_max 
            ){
                await strapi.entityService.update('api::aanbieder.aanbieder', id, { 
                    data: { bbox: new_bbox } 
                });
            }
        } 

    },
};