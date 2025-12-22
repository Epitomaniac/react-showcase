"use client";
import { useState, useEffect, useRef, useMemo, memo } from "react";
import Image from "next/image";
import ShikiHighlighter from "react-shiki";

interface Movie {
  imdbId: string;
  title: string;
  year: string;
  poster: string;
}

interface RawMovie {
  "#IMDB_ID": string;
  "#TITLE": string;
  "#YEAR": string;
  "#IMG_POSTER": string;
}

type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;

type Tab = "all" | "favorites";

function useFetchMovieData(query: string): [Movie[], boolean] {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [movieList, setMovieList] = useState<Movie[]>([]);

  useEffect(() => {
    if (query.length < 3) return;

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(
          `https://imdb.iamidiotareyoutoo.com/search?q=${query}`,
          {
            signal: controller.signal,
          }
        );
        const data = await res.json();
        const movies = data.description;
        const formattedMovieList: Movie[] = movies
          .filter((movie: any): movie is RawMovie =>
            Boolean(
              movie["#TITLE"] &&
                movie["#YEAR"] &&
                movie["#IMDB_ID"] &&
                movie["#IMG_POSTER"]
            )
          )
          .map((movie: any) => ({
            imdbId: movie["#IMDB_ID"],
            title: movie["#TITLE"],
            year: movie["#YEAR"],
            poster: movie["#IMG_POSTER"],
          }));

        setMovieList(formattedMovieList);
        setIsLoading(false);
      } catch (error: any) {
        setIsLoading(false);
        if (error.name !== "AbortError") console.log(error);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [query]);

  return [movieList, isLoading] as const;
}

function usePersistFavorites(): [
  Movie[],
  React.Dispatch<React.SetStateAction<Movie[]>>
] {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }

    isFirstLoad.current = false;
  }, []);

  useEffect(() => {
    if (isFirstLoad.current) return;

    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  return [favorites, setFavorites] as const;
}

type MovieItemProps = {
  movie: Movie;
  isFavorite: boolean;
  setFavorites: React.Dispatch<React.SetStateAction<Movie[]>>;
};

const MovieItem = memo(function MovieItem({
  movie,
  isFavorite,
  setFavorites,
}: MovieItemProps) {
  function handleFavorite() {
    if (isFavorite) {
      setFavorites(prev => prev.filter(item => item.imdbId !== movie.imdbId));
    } else {
      setFavorites(prev => [movie, ...prev]);
    }
  }

  return (
    <div className="group rounded-lg bg-white shadow ">
      <div className="relative aspect-2/3 overflow-hidden rounded-t-lg">
        {/* Star icon */}
        <button
          onClick={handleFavorite}
          className={`z-10 cursor-pointer absolute top-2 left-2 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg ${
            isFavorite ? "text-yellow-400" : "text-gray-400"
          } group-hover:scale-125`}
        >
          {/* You can use any star icon, e.g., from Heroicons */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill={isFavorite ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            />
          </svg>
        </button>

        {/* Poster image */}
        <Image
          src={movie.poster}
          alt={movie.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-3">
        <a
          href={`https://imdb.com/title/${movie.imdbId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <p className="truncate text-sm font-semibold text-gray-800">
            {movie.title}{" "}
            <span className="text-gray-500 font-normal">({movie.year})</span>
          </p>
        </a>
      </div>
    </div>
  );
});

const LoadingItem = memo(function LoadingItem() {
  return (
    <div className="p-3 aspect-2/3 space-y-2 animate-pulse">
      <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
      <div className="h-3 w-1/4 rounded bg-gray-200 animate-pulse" />
    </div>
  );
});

export default function MovieList() {
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [favorites, setFavorites] = usePersistFavorites();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [movieList, isLoading] = useFetchMovieData(debouncedSearch);
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        // fetch works in the browser only
        const response = await fetch("/MovieExplorer.tsx");
        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
        const code = await response.text();
        setHtml(code);
      } catch (err) {
        console.error("Failed to fetch or highlight code:", err);
      }
    };

    load();
  }, []);

  // Intentionally exclude `favorites` from the dependency array so items don't
  // disappear immediately when unfavorited from the Favorites tab (UX safeguard)
  const currentList = useMemo(() => {
    return activeTab === "favorites" ? favorites : movieList;
  }, [activeTab, movieList]);

  function handleSearch(e: InputChangeEvent) {
    const input = e.target.value.trim();
    setSearch(input);
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search]);

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-10">
        <div className="flex max-w-full mx-auto mb-8 gap-2">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search movies..."
            className="flex-1 rounded-md border border-gray-300 p-3 text-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            onClick={() => setActiveTab("all")}
            className={`border cursor-pointer rounded-md w-24 py-3 text-md font-medium ${
              activeTab === "all"
                ? "bg-amber-50 border-amber-300"
                : "bg-gray-200 border-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`border cursor-pointer rounded-md w-24 py-3 text-md font-medium ${
              activeTab === "favorites"
                ? "bg-amber-50 border-amber-300"
                : "bg-gray-200 border-gray-300"
            }`}
          >
            Favorites
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {isLoading
            ? Array.from({ length: 10 }).map((_, index) => (
                <LoadingItem key={index} />
              ))
            : currentList.map(movie => (
                <MovieItem
                  key={movie.imdbId}
                  movie={movie}
                  isFavorite={favorites.some(
                    (item: Movie) => item.imdbId === movie.imdbId
                  )}
                  setFavorites={setFavorites}
                />
              ))}
        </div>
      </div>

      {html && (
        <ShikiHighlighter language="tsx" theme="github-dark">
          {html}
        </ShikiHighlighter>
      )}
    </>
  );
}
