import React from "react";
import type { Movie } from "./Movies";

interface FavoritesProps {
  favorites: Movie[];
}

const Favorites: React.FC<FavoritesProps> = ({ favorites }) => {
  if (favorites.length === 0) return null;

  return (
    <div style={{ marginTop: "2em" }}>
      <h3>⭐ Favorites</h3>
      <ul>
        {favorites.map((fav) => (
          <li key={fav.id}>{fav.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Favorites;
