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

// bodyDom.window.document.body.lastChild?.textContent

async function fetchReviewCards(seriesUri: string, extractorFn: (bodyDom: JSDOM) => string | null, allPages: boolean = true): Promise<RestaurantArticleMetadata[]> {
    let res = await fetch(seriesUri)
    console.log("URL ", seriesUri);
    const seriesBody: ListResponse = await res.json();
    const reviewCards = seriesBody.cards.filter((card) => card.cardDesignType == "Review");
    const parsedCards: RestaurantArticleMetadata[] = reviewCards.map((card) => {
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
            headerImageUrl: imageToUrl(card.item.headerImage),
            displayImageUrls: card.item.displayImages.map(imageToUrl),
            bodyImageUrls: card.item.bodyImages.map((x) => imageToUrl(x as MainImage)),
            webPublicationDate: card.item.webPublicationDate,
        }
    });
    if (seriesBody.pagination.uris.next && allPages) {
        const rest = await fetchReviewCards(seriesBody.pagination.uris.next, extractorFn, allPages);
        return parsedCards.concat(rest);
    } else {
        return parsedCards;
    }
}

function imageToUrl(image: MainImage): string | undefined {
    if (image?.urlTemplate.match(/#{width}/)) {
        return image?.urlTemplate
            .replace("#{width}", `600`)
            .replace("&h=#{height}", "")
            .replace("#{quality}", `100`);
    } else {
        return image?.urlTemplate.concat("?width=600&quality=85&dpr=1&s=none");
    }
}

async function main() {

    // const ukTownNames = await loadCSVNames("./uk_towns_by_population1.csv");
    const graceDentMetadatas = fetchReviewCards(
        "https://mobile.guardianapis.com/uk/lists/tag/food/series/grace-dent-on-restaurants",
        (bodyDom) => {
            for (let i = bodyDom.window.document.body.children.length - 1; i > 0; i--) {
                const child = bodyDom.window.document.body.children[i].textContent;
                if (child.match(/[Ff]ood [0-9]\/[0-9]{2}/)
                    || child.match(/article was amended/)
                    || child.match(/^[Tt]he next episode/)
                    || child.match(/^[Tt]he guardian at 200/)
                   ) {
                    continue;
                } else {
                    return child;
                }
            }
            return null;
        }
    );
    const jayRaynerMetadatas = fetchReviewCards(
        "https://mobile.guardianapis.com/uk/lists/tag/food/series/jay-rayner-on-restaurants",
        (bodyDom) => bodyDom.window.document.body.firstChild?.textContent || null
    );
    const marinaOLoughlinMetadatas = fetchReviewCards(
        "https://mobile.guardianapis.com/uk/lists/tag/lifeandstyle/series/marina-o-loughlin-on-restaurants",
        (bodyDom) => {
            for (let i = bodyDom.window.document.body.children.length - 1; i > 0; i--) {
                let text = bodyDom.window.document.body.children.item(i)?.textContent?.toLowerCase() || "";
                if (text.indexOf("open") > -1) {
                    return text;
                }
            }
            return null;
        }
    );
    let articleIdToMetadata: { [articleId: string]: RestaurantArticleMetadata } =
        JSON.parse(fs.readFileSync('restaurant_reviews.json', { encoding: 'utf8' }));
    const metadatas = await Promise.all([graceDentMetadatas, jayRaynerMetadatas, marinaOLoughlinMetadatas]);
    const processedMetadata = await batchPromises(metadatas.flat(), processMetadata, 2);
    processedMetadata.map(x => {
        const oldMetadata = articleIdToMetadata[x.articleId];
        articleIdToMetadata[x.articleId] = {
            ...x,
            possibleCoordinates: oldMetadata.possibleCoordinates,
        }
    });
    const successOSMCount = processedMetadata.filter((x => x.possibleCoordinates)).length;
    console.log("Successfully found ", successOSMCount, "restaurants on open street map!")
    fs.writeFileSync("restaurant_reviews" + ".json", JSON.stringify(articleIdToMetadata, null, 4))
}
main();

async function batchPromises<T, V>(items: V[], f: (x: V) => Promise<T>, batchSize: number): Promise<T[]> {
    const batch: T[] = await Promise.all(items.slice(0, batchSize).map(f));
    const rest = items.slice(batchSize);
    if (rest.length === 0) {
        return batch;
    } else {
        return batch.concat(await batchPromises(rest, f, batchSize));
    }
}

const processMetadata = async (metadata: RestaurantArticleMetadata): Promise<RestaurantArticleMetadata> => {
    let card = metadata.card;
    const probableRestaurantTitle = card?.title.split(",")[0]
        .replace("Restaurant review: ", "")
        .replace("Jay Rayner reviews ", "")
        .replace("Restaurant: ", "")
        .replace("Restaurants: ", "")
        || "";
    let titleRemoved = metadata.unparsedLocationSentence?.toLowerCase().replace(probableRestaurantTitle?.toLowerCase(), "")
    const clauses = titleRemoved?.split(/(, )|\(|\. /);
    const isTitle = (clause: string) => clause.trim().toLowerCase() === probableRestaurantTitle?.toLowerCase();
    const isUrl = (clause: string) => clause.includes("http") || clause.includes("www.") || clause.includes(".com");
    const isPhoneNumber = (clause: string) => clause.trim().match(
        /^([0-9]{3}[ -][0-9]{4}[ -][0-9]{4})|([0-9]{5}[ -][0-9]{6})|([0-9]{4}[ -][0-9]{3}[ -][0-9]{4})|([0-9]{5}[ -][0-9]{3}[ -][0-9]{3})/
    );
    const isPrice = (clause: string) => clause.includes("£");
    const isCity = (clause: string) => clause.includes("london") || clause.includes("salford");
    const containsPostcode = (clause: string) => clause.match(/[a-z]{1,2}[0-9][a-z0-9]? ?([0-9][a-z]{2})?/)
    let address: string[] = [];
    for (let x of clauses ?? []) {
        if (!x?.trim() || x === ", ") {
            continue;
        } else if (isTitle(x)) {
            continue;
        } else if (isUrl(x) || isPhoneNumber(x) || isPrice(x)) {
            break;
        } else if (isCity(x) || containsPostcode(x)) {
            address.push(x);
            break;
        } else {
            address.push(x);
        }
    }

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
        // possibleAddress = commaSections?.slice(0, indexCommaIndex).join(", ");
        possibleAddress = address.join(", ");
        // nominatim have blocked us :(
        // possibleCoordinates = await queryNomatim(possibleAddress);
    }

    const priceSentences = metadata.unparsedLocationSentence?.split(". ").filter(s => s.includes("£")).join(". ");

    const result = {
        ...metadata,
        possibleCoordinates: possibleCoordinates,
        possibleRestaurantTitle: probableRestaurantTitle,
        possibleAddress: possibleAddress,
        priceSentences,
    };

    delete result.card;

    console.log(result);

    return result;
}

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
