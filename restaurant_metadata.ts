export interface RestaurantArticleMetadata {
    articleId: string;
    title: string;
    seriesUri?: string; // The series this article comes from. e.g https://mobile.guardianapis.com/lists/tag/food/series/grace-dent-on-restaurants
    seriesName?: string; // The series this article comes from. e.g Grace Dent on Restaurants

    /* The sentence that usually contains the location / other metadata */
    unparsedLocationSentence?: string;

    // Infered metadata
    possibleRestaurantTitle?: string;
    possibleAddress?: string;
    priceSentences?: string;

    nomatimCoordinates?: {
        lat: string;
        lon: string;
    }
}