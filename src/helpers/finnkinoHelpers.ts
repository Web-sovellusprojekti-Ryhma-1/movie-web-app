import dayjs from "dayjs";

export interface FinnkinoShowtime {
    id: string;
    eventId?: string;
    showId?: string;
    title: string;
    originalTitle?: string;
    start: Date;
    startIso: string;
    theatre: string;
    theatreId?: string;
    auditorium?: string;
    presentationMethod?: string;
    rating?: string;
    lengthInMinutes?: number;
    productionYear?: number;
    imagePortrait?: string;
    imageLandscape?: string;
    areaId?: string;
}

type RawShowtime = Record<string, unknown>;

type VisitedSet = Set<unknown>;

const toStringOrUndefined = (value: unknown): string | undefined => {
    if (typeof value === "string" && value.length > 0) {
        return value;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        return value.toString();
    }

    return undefined;
};

const toNumberOrUndefined = (value: unknown): number | undefined => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return undefined;
};

const parseImages = (raw: unknown) => {
    if (!raw || typeof raw !== "object") {
        return {portrait: undefined, landscape: undefined};
    }

    const source = raw as Record<string, unknown>;

    const portrait =
        toStringOrUndefined(source.EventLargeImagePortrait) ??
        toStringOrUndefined(source.EventSmallImagePortrait) ??
        toStringOrUndefined(source.PortraitImage) ??
        toStringOrUndefined(source.Portrait) ??
        toStringOrUndefined(source.Poster) ??
        toStringOrUndefined(source.poster) ??
        toStringOrUndefined(source.image) ??
        toStringOrUndefined(source.ImagePortrait);

    const landscape =
        toStringOrUndefined(source.EventLargeImageLandscape) ??
        toStringOrUndefined(source.LandscapeImage) ??
        toStringOrUndefined(source.Landscape) ??
        toStringOrUndefined(source.imageLandscape);

    return {portrait, landscape};
};

const extractShowArray = (payload: unknown, visited: VisitedSet = new Set()): RawShowtime[] => {
    if (!payload || visited.has(payload)) {
        return [];
    }

    if (Array.isArray(payload)) {
        return payload as RawShowtime[];
    }

    if (typeof payload !== "object") {
        return [];
    }

    visited.add(payload);

    const record = payload as Record<string, unknown>;

    const directKeys = ["shows", "Shows", "Show", "Showtime", "Items", "Events"];
    for (const key of directKeys) {
        const value = record[key];
        if (Array.isArray(value)) {
            return value as RawShowtime[];
        }
        if (value && typeof value === "object") {
            const nested = extractShowArray(value, visited);
            if (nested.length > 0) {
                return nested;
            }
        }
    }

    const nestedKeys = [
        "Showtimes",
        "showtimes",
        "Shows",
        "shows",
        "Show",
        "show",
        "Schedule",
        "schedule",
        "Result",
        "result",
        "Data",
        "data",
        "Payload",
        "payload",
    ];

    for (const key of nestedKeys) {
        const nested = record[key];
        if (!nested) {
            continue;
        }

        const extracted = extractShowArray(nested, visited);
        if (extracted.length > 0) {
            return extracted;
        }
    }

    return [];
};

const normalizeSingleShowtime = (raw: RawShowtime): FinnkinoShowtime | null => {
    const title = toStringOrUndefined(raw.Title ?? raw.title);
    const originalTitle = toStringOrUndefined(raw.OriginalTitle ?? raw.originalTitle ?? raw.Original_title);

    const startString =
        toStringOrUndefined(raw.dttmShowStart ?? raw.showtime ?? raw.StartTime ?? raw.startTime);
    if (!title || !startString) {
        return null;
    }

    const start = dayjs(startString);
    if (!start.isValid()) {
        return null;
    }

    const eventId = toStringOrUndefined(raw.EventID ?? raw.eventId ?? raw.ID ?? raw.event_id);
    const showId = toStringOrUndefined(raw.ShowID ?? raw.showId ?? raw.ID ?? raw.id);
    const theatre = toStringOrUndefined(raw.Theatre ?? raw.theatre ?? raw.Location ?? raw.location) ?? "Unknown theatre";
    const theatreId = toStringOrUndefined(raw.TheatreID ?? raw.theatreId ?? raw.LocationID ?? raw.locationId);
    const auditorium = toStringOrUndefined(raw.TheatreAuditorium ?? raw.auditorium ?? raw.Auditorium);
    const presentationMethod =
        toStringOrUndefined(raw.PresentationMethodAndLanguage ?? raw.PresentationMethod ?? raw.presentationMethod);
    const rating =
        toStringOrUndefined(raw.Rating ?? raw.rating ?? raw.RatingSymbol) ??
        toStringOrUndefined(raw.RatingImage ?? raw.RatingImageUrl ?? raw.ratingImageUrl);
    const lengthInMinutes = toNumberOrUndefined(raw.LengthInMinutes ?? raw.length ?? raw.Duration ?? raw.runtime);
    const productionYear = toNumberOrUndefined(raw.ProductionYear ?? raw.productionYear ?? raw.Year ?? raw.year);
    const areaId = toStringOrUndefined(raw.AreaID ?? raw.areaId ?? raw.TheatreAreaID ?? raw.theatreAreaId);

    const images = parseImages(raw.Images ?? raw.images ?? raw.Image ?? raw.image);

    const idBase = eventId ?? showId ?? `${title}-${startString}`;

    return {
        id: `${idBase}-${start.valueOf()}`,
        eventId: eventId ?? undefined,
        showId: showId ?? undefined,
        title,
        originalTitle,
        start: start.toDate(),
        startIso: start.toISOString(),
        theatre,
        theatreId,
        auditorium,
        presentationMethod,
        rating,
        lengthInMinutes,
        productionYear,
        imagePortrait: images.portrait,
        imageLandscape: images.landscape,
        areaId,
    };
};

export const normalizeFinnkinoShowtimes = (payload: unknown): FinnkinoShowtime[] => {
    const rawShowtimes = extractShowArray(payload);

    const normalized = rawShowtimes
        .map((item) => normalizeSingleShowtime(item))
        .filter((item): item is FinnkinoShowtime => Boolean(item));

    return normalized.sort((a, b) => a.start.getTime() - b.start.getTime());
};

export const normalizeTitleForComparison = (value: string | undefined | null) => {
    if (!value) {
        return "";
    }

    return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]+/g, "")
        .trim();
};

export const formatFinnkinoDuration = (minutes?: number): string | undefined => {
    if (typeof minutes !== "number" || !Number.isFinite(minutes) || minutes <= 0) {
        return undefined;
    }

    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hrs > 0) {
        return `${hrs}h ${mins.toString().padStart(2, "0")}min`;
    }

    return `${minutes}min`;
};
