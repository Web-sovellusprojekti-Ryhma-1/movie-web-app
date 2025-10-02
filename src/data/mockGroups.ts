import type { GroupSummary } from "../types/group"

export const mockGroups: GroupSummary[] = [
  {
    id: 1,
    name: "Midnight Premiere Squad",
    description:
      "Obsessed with catching the very first screenings of genre gems and blockbusters across Finland.",
    ownerId: 101,
    tags: ["Premiere", "Sci-Fi", "Action"],
    coverImage: "https://picsum.photos/1280/720",
    members: [
      {
        id: 101,
        name: "Ella Rantanen",
        role: "owner",
        avatarUrl: "https://i.pravatar.cc/100?img=32",
        joinedAt: "2024-02-12T10:30:00+02:00",
      },
      {
        id: 102,
        name: "Lukas Virtanen",
        role: "member",
        avatarUrl: "https://i.pravatar.cc/100?img=45",
        joinedAt: "2024-04-01T18:05:00+03:00",
      },
      {
        id: 103,
        name: "Noora Miettinen",
        role: "member",
        avatarUrl: "https://i.pravatar.cc/100?img=12",
        joinedAt: "2024-05-20T21:10:00+03:00",
      },
    ],
    showtimes: [
      {
        id: "show-1",
        movieTitle: "Dune: Part Two",
        theatre: "Finnkino Tennispalatsi, Helsinki",
        startsAt: "2025-10-07T23:30:00+03:00",
        addedBy: 101,
        notes: "Meet 30 minutes earlier for merch swap",
      },
      {
        id: "show-2",
        movieTitle: "Blade Runner 2099",
        theatre: "Finnkino Itis, Helsinki",
        startsAt: "2025-11-12T21:45:00+02:00",
        addedBy: 102,
      },
    ],
    pendingRequests: [
      {
        id: "req-1",
        userId: 201,
        name: "Jesse Salmi",
        requestedAt: "2025-09-25T14:20:00+03:00",
        message: "Huge sci-fi nerd, always up for midnight releases!",
      },
    ],
    createdAt: "2024-01-15T08:00:00+02:00",
  },
  {
    id: 2,
    name: "Saturday Classics",
    description:
      "Weekly matinees dedicated to the greatest hits from IMDB Top 250 and European cinema treasures.",
    ownerId: 102,
    tags: ["Classics", "Matinee", "Discussion"],
    coverImage: "https://picsum.photos/1280/720",
    members: [
      {
        id: 102,
        name: "Lukas Virtanen",
        role: "owner",
        avatarUrl: "https://i.pravatar.cc/100?img=45",
        joinedAt: "2023-10-01T11:00:00+03:00",
      },
      {
        id: 104,
        name: "Venla Lehtinen",
        role: "admin",
        avatarUrl: "https://i.pravatar.cc/100?img=55",
        joinedAt: "2023-10-01T11:00:00+03:00",
      },
      {
        id: 105,
        name: "Matias Oja",
        role: "member",
        avatarUrl: "https://i.pravatar.cc/100?img=24",
        joinedAt: "2024-03-10T16:00:00+02:00",
      },
      {
        id: 106,
        name: "Sara Laine",
        role: "member",
        avatarUrl: "https://i.pravatar.cc/100?img=48",
        joinedAt: "2024-06-05T14:00:00+03:00",
      },
    ],
    showtimes: [
      {
        id: "show-3",
        movieTitle: "Casablanca",
        theatre: "Finnkino Plevna, Tampere",
        startsAt: "2025-10-18T16:00:00+03:00",
        addedBy: 104,
        notes: "Post-screening coffee at the lobby",
      },
      {
        id: "show-4",
        movieTitle: "Cinema Paradiso",
        theatre: "Finnkino Fantasia, Jyväskylä",
        startsAt: "2025-10-25T15:30:00+03:00",
        addedBy: 102,
      },
    ],
    pendingRequests: [
      {
        id: "req-2",
        userId: 202,
        name: "Hanna Koski",
        requestedAt: "2025-09-30T09:45:00+03:00",
      },
      {
        id: "req-3",
        userId: 203,
        name: "Aleksi Saarinen",
        requestedAt: "2025-09-29T19:12:00+03:00",
        message: "I host a weekly podcast about film history.",
      },
    ],
    createdAt: "2023-09-20T10:00:00+03:00",
  },
  {
    id: 3,
    name: "Finnkino Family Circle",
    description:
      "Family-friendly sessions aligned with Finnkino's best new releases for all ages.",
    ownerId: 107,
    tags: ["Family", "Finnkino", "Animation"],
    coverImage: "https://picsum.photos/1280/720",
    members: [
      {
        id: 107,
        name: "Petra Korhonen",
        role: "owner",
        avatarUrl: "https://i.pravatar.cc/100?img=5",
        joinedAt: "2024-05-12T08:30:00+03:00",
      },
      {
        id: 108,
        name: "Jari Lappalainen",
        role: "member",
        avatarUrl: "https://i.pravatar.cc/100?img=36",
        joinedAt: "2024-07-01T09:00:00+03:00",
      },
      {
        id: 109,
        name: "Mila Lappalainen",
        role: "member",
        avatarUrl: "https://i.pravatar.cc/100?img=68",
        joinedAt: "2024-07-01T09:00:00+03:00",
      },
    ],
    showtimes: [
      {
        id: "show-5",
        movieTitle: "Inside Out 3",
        theatre: "Finnkino Odeon, Espoo",
        startsAt: "2025-10-19T13:00:00+03:00",
        addedBy: 108,
      },
    ],
    pendingRequests: [],
    createdAt: "2024-05-01T10:00:00+03:00",
  },
]
