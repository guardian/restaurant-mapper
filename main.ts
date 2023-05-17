import { ListResponse, MainImage } from "./lists_response";
import { JSDOM } from "jsdom";
import * as fs from "fs";
import { RestaurantArticleMetadata } from "./restaurant_metadata";

console.log("Hello!")

const restaurantSeriesList = [
    "https://mobile.guardianapis.com/uk/lists/tag/food/series/grace-dent-on-restaurants",
    "https://mobile.guardianapis.com/uk/lists/tag/food/series/jay-rayner-on-restaurants",
    "https://mobile.guardianapis.com/uk/lists/tag/lifeandstyle/series/marina-o-loughlin-on-restaurants"
];

let articleIdToMetadata: { [articleId: string]: RestaurantArticleMetadata } = {};

// bodyDom.window.document.body.lastChild?.textContent

async function fetchReviewCards(seriesUri: string, extractorFn: (bodyDom: JSDOM) => string | null): Promise<RestaurantArticleMetadata[]> {
    let res = await fetch(seriesUri)
    console.log("URL ", seriesUri);
    const seriesBody: ListResponse = await res.json();
    const reviewCards = seriesBody.cards.filter((card) => card.cardDesignType == "Review");
    return reviewCards.map((card) => {
        let bodyDom = new JSDOM(card.item.body);
        const lastItemText = extractorFn(bodyDom)
            ?.replace("\n", "")
            .replace("•", "")
            .replace("’", "'")
            .trim();
        return {
            articleId: card.item.id,
            title: card.title,
            card: card,
            unparsedLocationSentence: lastItemText,
            seriesUri: seriesUri,
            seriesName: seriesBody.title,
            mainImageUrl: imageToUrl(card.mainImage),
        }
    });
}

function imageToUrl(image: MainImage): string {
    return image.urlTemplate
        .replace("#{width}", `300`)
        .replace("&h=#{height}", "")
        .replace("#{quality}", `100`);
}

async function main() {

    // const ukTownNames = await loadCSVNames("./uk_towns_by_population1.csv");
    let successOSMCount = 0;
    const graceDentMetadatas = await fetchReviewCards(
        "https://mobile.guardianapis.com/uk/lists/tag/food/series/grace-dent-on-restaurants",
        (bodyDom) => bodyDom.window.document.body.lastChild?.textContent || null
    )
    const jayRaynerMetadatas = await fetchReviewCards(
        "https://mobile.guardianapis.com/uk/lists/tag/food/series/jay-rayner-on-restaurants",
        (bodyDom) => bodyDom.window.document.body.firstChild?.textContent || null
    )
    const metadatas = graceDentMetadatas.concat(jayRaynerMetadatas);
    for (let metadata of metadatas) {
        let card = metadata.card;
        const probableRestaurantTitle = card?.title.split(",")[0] || "";
        let titleRemoved = metadata.unparsedLocationSentence?.toLowerCase().replace(probableRestaurantTitle?.toLowerCase(), "")
        if (titleRemoved && titleRemoved?.indexOf(".") > -1) {
            titleRemoved = titleRemoved.slice(0, titleRemoved?.indexOf("."));
        }
        const commaSections = titleRemoved?.toLowerCase().split(",").map((section) => section.trim());
        let possibleCoordinates: any = null;
        let possibleAddress = titleRemoved;
        if (commaSections) {
            let indexCommaIndex = 0;
            let commaLimit = commaSections.length < 6 ? commaSections.length : 5;
            for (let i = 0; i < commaLimit; i++) {
                let commaSection = commaSections[i];
                if (i > 1) {
                    if (commaSection.startsWith("0")) {
                        indexCommaIndex = i;
                    }
                    if (commaSection.indexOf("(0")) {
                        indexCommaIndex = i + 1;
                    }
                    break;
                }
            }
            possibleAddress = commaSections?.slice(0, indexCommaIndex).join(", ");
            console.log("errrmm.. ", possibleAddress);
            possibleCoordinates = await queryNomatim(possibleAddress);
        }
        
        if (possibleCoordinates) {
            successOSMCount++;
        }

        const priceSentences = metadata.unparsedLocationSentence?.split(". ").filter(s => s.includes("£")).join(". ");

        articleIdToMetadata[metadata.articleId] = {
            ...metadata,
            possibleCoordinates: possibleCoordinates,
            possibleRestaurantTitle: probableRestaurantTitle,
            possibleAddress: possibleAddress,
            priceSentences,
        };

        delete articleIdToMetadata[metadata.articleId].card;
        
        console.log(articleIdToMetadata[metadata.articleId]);
    }
    console.log("Successfully found ", successOSMCount, "restaurants on open street map!")
    fs.writeFileSync("restaurant_reviews" + ".json", JSON.stringify(articleIdToMetadata, null, 4))
}
main();


async function queryNomatim(query) {
    // Get the coordinates from Nominatim.
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`;
    const response = await fetch(url);

    // If the request was successful, parse the response and add the coordinates to the array.
    if (response.ok) {
      const data = await response.json();
      if (data.length > 0) {
        console.log(url);
        return {
            lat: data[0].lat,
            lon: data[0].lon
        }
      }
    }
    return null;
}
