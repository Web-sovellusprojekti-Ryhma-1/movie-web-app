import React, { useState } from "react";
import { Box, Image, Title, Text, Badge, Group, Button, Modal, Textarea, NumberInput } from "@mantine/core";
import { DateInput } from "@mantine/dates"; 
import { Select } from "@mantine/core"; 
import type { MovieDetails as MovieDetailsType } from "../helpers/movieHelpers";

interface MovieDetailsProps {
  movie: MovieDetailsType
  onClose: () => void
  addToFavorites: (movie: MovieDetailsType) => void
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie, onClose, addToFavorites }) => {
  const [reviews, setReviews] = useState(["Sample review 1", "Sample review 2", "Sample review 3"]) // arvostelut
  const [isModalOpen, setIsModalOpen] = useState(false) // modaalin näkyvyys jotta voidaan triggeröidä napista
  const [newReview, setNewReview] = useState("") // uusi arvostelu
  const [newRating, setNewRating] = useState<number>(0) // arvostelun arvosanan parametri
  const [selectedDate, setSelectedDate] = useState<string | null>(null) // kalenterin päivä valinta
  const [selectedTheatreArea, setSelectedTheatreArea] = useState<string | null>(null) // finnkino api myöhemmin tähän mukaan
  // riviewille funktio parametrit
  const addReview = () => {
    if (newReview.trim()) {
      setReviews([...reviews, `${newReview} (Rating: ${newRating}/5)`])
      setNewReview("")
      setNewRating(0)
      setIsModalOpen(false)
    }
  };

  return (
    <Box>
      <Button onClick={onClose} mb="md">
        Go Back
      </Button>
      <Box
        style={{ // periaatteessa sen koko elokuva info osion sijainti sivulla
          display: "flex", 
          flexDirection: "row", 
          alignItems: "flex-start", 
          gap: "2rem", 
          marginRight: "5px", 
          width: "150%", 
          maxWidth: "125%", 
        }}
      >
        {/* kuva toki koko skaalautuu aiemman boxin mukaan joten width on hieman turha */}
        {movie.posterUrl && (
          <Box style={{ flexShrink: 0 }}>
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              width={150}
            />
          </Box>
        )}

        {/* elokuvien tiedot ja niiden stylet */}
        <Box style={{ flex: 1, maxWidth: "80%", lineHeight: "1.8" }}> 
          <Title style={{ fontSize: "2rem" }}>{movie.title}</Title> 
          <Group>
            {movie.genres.map((genre, index) => (
              <Badge key={index}>{genre}</Badge>
            ))}
          </Group> 
          <Text>{movie.overview}</Text>
          <Text>
            <strong>Duration:</strong> {movie.duration || "N/A"}
          </Text> 
          <Text>
            <strong>Director:</strong> {movie.director || "N/A"}
          </Text> 
          <Text>
            <strong>Release Date:</strong> {movie.releaseDate}
          </Text> 
          <Text style={{ marginBottom: "1.5rem" }}> 
            <strong>IMDB Rating:</strong> {movie.rating ? movie.rating.toFixed(1) : "N/A"} / 10
          </Text>
          <Title order={3}>Top Cast</Title>
          <ul>
            {movie.cast.slice(0, 5).map((actor, index) => (
              <li key={index}>
                {actor.name} as <em>{actor.character}</em>
              </li>
            ))}
          </ul>
        </Box>
      </Box>
      {/* Add to Favorites napin positio sivulla */}
      <Button
        onClick={() => addToFavorites(movie)}
        style={{
          position: "fixed", 
          top: "6.58rem", 
          right: "1rem", 
          zIndex: 1, 
        }}
      >
        Add to Favorites
      </Button>
      {/* movie app arvostelu kenttä */}
      <Box>
        <Title order={3} style={{ marginTop: "2rem" }}>Movie App User Reviews</Title> 
        <Box style={{ display: "flex", overflowX: "auto", gap: "1rem", padding: "1rem", whiteSpace: "nowrap" }}> {/* vieritys palkki jotta voi scrollailla arvosteluja */}
          {reviews.map((review, index) => (
            <Box key={index} style={{ display: "inline-block", minWidth: "300px", border: "1px solid #ccc", padding: "1rem", wordWrap: "break-word", whiteSpace: "normal" }}>{review}</Box>
          ))}
        </Box>
        <Button style={{ marginTop: "1rem" }} onClick={() => setIsModalOpen(true)}>Add Review</Button> {/* modaalin triggeröivä nappi */}

        <Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add a Review"> {/* Modaali eli popup ikkuna arvostelun luontiin */}
          <Textarea
            placeholder="Write your review here..."
            value={newReview}
            onChange={(event) => setNewReview(event.currentTarget.value)}
            label="Review"
            required
          />
          <NumberInput
            placeholder="Rating"  // arvosanan valinta kenttä
            value={newRating}
            onChange={(value) => setNewRating(typeof value === "number" ? value : 0)} 
            label="Rating (out of 5)" 
            min={0}
            max={5}
            required
          />
          <Group mt="md"> 
            <Button variant="default" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={addReview}>Post Review</Button>
          </Group>
        </Modal>
      </Box>
      {/* Showtimes Section */}
      <Title order={3} style={{ marginTop: "2rem" }}>Showtimes</Title>
      <Box style={{ marginTop: "1rem" }}>
        <DateInput
          placeholder="Pick a date"
          value={selectedDate}
          onChange={(value) => setSelectedDate(value)} // kalenteriin varmaan löytyy joku parempikin vaihtoehto
          label="Select Date"
          required
        />
        <Select
          placeholder="Select Theatre Area"
          value={selectedTheatreArea}
          onChange={setSelectedTheatreArea}
          data={["Sample Area 1", "Sample Area 2", "Sample Area 3"]} // korvaa finnkinoapilla kunhan selvität apien väliset kommunikaatiot
          label="Select Theatre Area"
          required
        />
        <Box style={{ marginTop: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
          <Text>Sample Cinema</Text>
          <Text>Sample DateTime</Text>
        </Box>
      </Box>
    </Box>
  );
};

export default MovieDetails;
