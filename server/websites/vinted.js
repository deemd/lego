



const scrapeWithCookies = async searchText => {
    try {
        const response = await fetch(`https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1739192767&search_text=42182&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids=`, {
            "headers": {
                "accept": "",
                "accept-language": "",
                "cache-control": ""
            }
        });


        if(response.ok){
            const body = await response.json();
            return parse(body);
        }

        console.error(response);
        return null;
    }
    catch (error){
        console.error(error);
        return null;
    }
};


const scrape = async searchText => {
    try {
        const response = await fetch(`https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&time=1739192767&search_text=42182&catalog_ids=&size_ids=&brand_ids=89162&status_ids=6,1&material_ids=`);

        if(response.ok){
            const body = await response.json();
            return parse(body);
        }

        console.error(response);
        return null;
    }
    catch (error){
        console.error(error);
        return null;
    }
};

export {scrape}