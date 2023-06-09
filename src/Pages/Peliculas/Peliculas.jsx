import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Popup from "./Popup";
import {
  setFilterYear,
  setResultsPerPage,
  setCurrentPage,
} from "../../redux/actions/peliculasActions";
import "./Peliculas.scss";

const Peliculas = () => {
  const [selectedPelicula, setSelectedPelicula] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  const filterYear = useSelector((state) => state.peliculas.filterYear);
  const resultsPerPage = useSelector((state) => state.peliculas.resultsPerPage);
  const currentPage = useSelector((state) => state.peliculas.currentPage);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const currentPageParam = queryParams.get("page");
  const currentPageFromUrl = currentPageParam ? parseInt(currentPageParam) : 1;

  useEffect(() => {
    dispatch(setCurrentPage(currentPageFromUrl));
  }, [dispatch, currentPageFromUrl]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("data/sample.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error fetching data");
        }
        return response.json();
      })
      .then((jsonData) => {
        setData(jsonData.entries);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const setCurrentPageWithUrlUpdate = (page) => {
    dispatch(setCurrentPage(page));

    const searchParams = new URLSearchParams(location.search);
    searchParams.set("page", page.toString());
    navigate({ search: searchParams.toString() });
  };

  const filteredAndSortedData = data
    .filter(
      (item) =>
        item.programType === "movie" &&
        (filterYear ? item.releaseYear === Number(filterYear) : true)
    )
    .sort((a, b) => a.title.localeCompare(b.title));

  const handleFilterYearChange = (e) => {
    dispatch(setFilterYear(e.target.value));
    setCurrentPageWithUrlUpdate(1);
  };

  const handleResultsPerPageChange = (e) => {
    dispatch(setResultsPerPage(parseInt(e.target.value)));
    setCurrentPageWithUrlUpdate(1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPageWithUrlUpdate(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const maxPage = Math.ceil(filteredAndSortedData.length / resultsPerPage);
    if (currentPage < maxPage) {
      setCurrentPageWithUrlUpdate(currentPage + 1);
    }
  };

  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex);

  const handleClick = (pelicula) => {
    setSelectedPelicula(pelicula);
  };

  const handleClose = () => {
    setSelectedPelicula(null);
  };

  const totalPages = Math.ceil(filteredAndSortedData.length / resultsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Oops! Something went wrong...</p>;
  }

  return (
    <div className="container">
      <div className="header-bar">
        <h1>Películas</h1>
      </div>
      <div className="filter">
        <div>
          <input
            type="text"
            value={filterYear}
            onChange={handleFilterYearChange}
            placeholder="Filtro por año"
          />
        </div>
        <div className="results-per-page">
          <label htmlFor="resultsPerPage">Resultados por página:</label>
          <select
            id="resultsPerPage"
            value={resultsPerPage}
            onChange={handleResultsPerPageChange}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>
      </div>
      <div className="card-list">
        {paginatedData.length > 0 ? (
          paginatedData.map((pelicula) => (
            <div
              key={pelicula.title}
              onClick={() => handleClick(pelicula)}
              className="card"
            >
              <div className="card-image">
                <img
                  src={pelicula.images["Poster Art"].url}
                  alt={pelicula.title}
                />
              </div>
              <h2>{pelicula.title}</h2>
            </div>
          ))
        ) : (
          <p>
            No se han encontrado películas con el año introducido en nuestra
            base de datos
          </p>
        )}
      </div>
      {selectedPelicula && (
        <Popup pelicula={selectedPelicula} onClose={handleClose} />
      )}
      <div className="pagination">
        <button disabled={currentPage === 1} onClick={handlePreviousPage}>
          {"<"} Prev
        </button>
        <div className="page-numbers">
          {pageNumbers.map((page) => (
            <button
              key={page}
              className={currentPage === page ? "active" : ""}
              onClick={() => setCurrentPageWithUrlUpdate(page)}
            >
              {page}
            </button>
          ))}
        </div>
        <button disabled={currentPage === totalPages} onClick={handleNextPage}>
          Next {">"}
        </button>
      </div>
    </div>
  );
};

export default Peliculas;
