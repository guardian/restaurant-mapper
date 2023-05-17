import { ListResponse } from "./lists_response";
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

async function main() {

    // const ukTownNames = await loadCSVNames("./uk_towns_by_population1.csv");
    let successOSMCount = 0;
    let res = await fetch(restaurantSeriesList[0])
    console.log("URL ", restaurantSeriesList[0]);
    const seriesBody: ListResponse = await res.json();
    const reviewCards = seriesBody.cards.filter((card) => card.cardDesignType == "Review");
    for (let card of reviewCards) {
        let bodyDom = new JSDOM(card.item.body);
        const lastItemText = bodyDom.window.document.body.lastChild?.textContent
            ?.replace("\n", "")
            .replace("•", "")
            .replace("’", "'")
            .trim()
        const probableRestaurantTitle = card.title.split(",")[0];
        let titleRemoved = lastItemText?.toLowerCase().replace(probableRestaurantTitle.toLowerCase(), "")
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
                if (commaSection.startsWith("0") && i > 1) {
                    indexCommaIndex = i;
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

        const priceSentences = lastItemText?.split(". ").filter(s => s.includes("£")).join(". ");

        articleIdToMetadata[card.item.id] = {
            articleId: card.item.id,
            title: card.title,
            unparsedLocationSentence: lastItemText,
            possibleCoordinates: possibleCoordinates,
            possibleRestaurantTitle: probableRestaurantTitle,
            possibleAddress: possibleAddress,
            priceSentences,
            seriesName: seriesBody.title,
            seriesUri: restaurantSeriesList[0]
        };
        console.log(articleIdToMetadata[card.item.id]);
    }
    console.log("Successfully found ", successOSMCount, "restaurants on open street map!")
    fs.writeFileSync(seriesBody.title + ".json", JSON.stringify(articleIdToMetadata, null, 4))
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
