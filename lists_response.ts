export interface ListResponse {
    id: string
    title: string
    style: Style
    pagination: Pagination
    series: Series
    cards: Card[]
    lastModified: string
    adverts: Advert[]
    topics: Topic3[]
    personalization: Personalization
    adTargetingPath: string
    tracking: Tracking2
    webUri: string
    commercial: Commercial2
    permutiveTracking: PermutiveTracking2
  }
  
  export interface Style {
    primaryColour: string
    secondaryColour: string
    overlayColour: string
    backgroundColour: string
    lightModeBackgroundColour: string
    darkModeBackgroundColour: string
    lightModeTitleColour: string
    darkModeTitleColour: string
    lightModeLineColour: string
    darkModeLineColour: string
  }
  
  export interface Pagination {
    currentPage: number
    totalPages: number
    uris: Uris
  }
  
  export interface Uris {
    next: string
    last: string
  }
  
  export interface Series {
    name: string
    uri: string
  }
  
  export interface Card {
    title: string
    rawTitle: string
    item: Item
    trailText: string
    showQuotedHeadline: boolean
    showLiveIndicator: boolean
    boostCard: boolean
    sublinks: any[]
    mainImage: MainImage
    cardDesignType: string
    type: string
    importance: number
  }
  
  export interface Item {
    id: string
    title: string
    trailText: string
    standFirst: string
    byline: string
    body: string
    section: string
    displayImages: DisplayImage[]
    bodyImages: BodyImage[]
    webPublicationDate: string
    lastModified: string
    metadata: Metadata
    style: Style2
    palette: Palette
    paletteDark: PaletteDark
    pillar: Pillar
    designType: string
    links: Links
    discussionId: string
    shouldHideAdverts: boolean
    shouldHideReaderRevenue: boolean
    headerImage: HeaderImage
    campaigns: any[]
    atoms: any[]
    atomsCSS: any[]
    atomsJS: any[]
    permutiveTracking: PermutiveTracking
    type: string
  }
  
  export interface DisplayImage {
    urlTemplate: string
    height: number
    width: number
    orientation: string
    caption: string
    credit: string
    altText: string
    cleanCaption: string
    cleanCredit: string
  }
  
  export interface BodyImage {
    urlTemplate: string
    height: number
    width: number
    orientation: string
    caption: string
    altText: string
    cleanCaption: string
    credit?: string
    cleanCredit?: string
  }
  
  export interface Metadata {
    commentable: boolean
    commentCount: number
    contributors: Contributor[]
    feature: boolean
    keywords: string[]
    tags: Tag[]
    tracking: Tracking[]
    section: Section
    topics: Topic[]
    series: Series2
    embeddedVideos: any[]
    adTargetingPath: string
    adServerParams: AdServerParams
    trackingVariables: TrackingVariables
    interactive: boolean
    commercial: Commercial
    journalism: Journalism
  }
  
  export interface Contributor {
    id: string
    name: string
    image: Image
    smallImage: SmallImage
    uri: string
  }
  
  export interface Image {
    urlTemplate: string
  }
  
  export interface SmallImage {
    urlTemplate: string
  }
  
  export interface Tag {
    id: string
    webTitle: string
  }
  
  export interface Tracking {
    id: string
    webTitle: string
  }
  
  export interface Section {
    id: string
  }
  
  export interface Topic {
    displayName: string
    topic: Topic2
  }
  
  export interface Topic2 {
    type: string
    name: string
  }
  
  export interface Series2 {
    title: string
    uri: string
    id: string
  }
  
  export interface AdServerParams {
    se: string
    ct: string
    co: string
    url: string
    su: string
    edition: string
    tn: string
    p: string
    k: string
    sh: string
  }
  
  export interface TrackingVariables {
    commissioningDesks: CommissioningDesk[]
  }
  
  export interface CommissioningDesk {
    id: string
    webTitle: string
  }
  
  export interface Commercial {
    adUnit: string
    adTargeting: AdTargeting
  }
  
  export interface AdTargeting {
    se: string
    ct: string
    co: string
    url: string
    su: string
    edition: string
    tn: string
    p: string
    k: string
    sh: string
  }
  
  export interface Journalism {
    campaignsUrl: string
  }
  
  export interface Style2 {
    ruleColour: string
    headlineAccentColour?: string
    backgroundColour: string
    metaColour: string
    navigationButtonColour: string
    standfirstColour: string
    colourPalette: string
    navigationDownColour: string
    starColour?: string
    savedForLaterFalseColour: string
    navigationColour: string
    starEmptyColour?: string
    savedForLaterTrueColour: string
    quoteColour: string
    dividerColour: string
    headlineColour: string
    kickerColour: string
  }
  
  export interface Palette {
    background: string
    mediaIcon: string
    pillar: string
    main: string
    secondary: string
    headline: string
    commentCount: string
    metaText: string
    elementBackground: string
    shadow: string
    immersiveKicker: string
    topBorder: string
    mediaBackground: string
    pill: string
    accentColour: string
  }
  
  export interface PaletteDark {
    background: string
    mediaIcon: string
    pillar: string
    main: string
    secondary: string
    headline: string
    commentCount: string
    metaText: string
    elementBackground: string
    shadow: string
    immersiveKicker: string
    topBorder: string
    mediaBackground: string
    pill: string
    accentColour: string
  }
  
  export interface Pillar {
    id: string
    name: string
  }
  
  export interface Links {
    uri: string
    shortUrl: string
    relatedUri: string
    webUri: string
  }
  
  export interface HeaderImage {
    urlTemplate: string
    height: number
    width: number
    orientation: string
    caption: string
    credit: string
    altText: string
    cleanCaption: string
    cleanCredit: string
  }
  
  export interface PermutiveTracking {
    id: string
    title: string
    type: string
    section: string
    authors: string[]
    keywords: string[]
    publishedAt: string
    series: string
    premium: boolean
  }
  
  export interface MainImage {
    urlTemplate: string
    height: number
    width: number
    orientation: string
    credit: string
    altText: string
    cleanCredit: string
  }
  
  export interface Advert {
    type: string
    location: number
    frequency: number
  }
  
  export interface Topic3 {
    displayName: string
    topic: Topic4
  }
  
  export interface Topic4 {
    type: string
    name: string
  }
  
  export interface Personalization {
    id: string
    uri: string
  }
  
  export interface Tracking2 {}
  
  export interface Commercial2 {
    adUnit: string
    adTargeting: AdTargeting2
  }
  
  export interface AdTargeting2 {
    se: string
    ct: string
    url: string
    edition: string
    p: string
  }
  
  export interface PermutiveTracking2 {
    id: string
    type: string
    keywords: string[]
    premium: boolean
  }
  