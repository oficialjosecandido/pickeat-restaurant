import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const dataContext = createContext();
export const useData = () => useContext(dataContext);

const currencies = {
  usd: "$",
  eur: "€",
  gbp: "£",
};

const DataContext = ({ children }) => {
  // stadi
  const getStadium = async (userLocation) => {
    try {
      const { longitude, latitude } = userLocation;
      const { data } = await api.get("/stadiums", {
        params: {
          longitude,
          latitude,
        },
      });
      return data;
    } catch (error) {
      console.error(`Errore nel recuperare gli stadi: ${error.message}`);
      return [];
    }
  };

  const getMenuItems = async (id) => {
    try {
      const { data } = await api.get(`/stadiums/${id}/menu`);
      return data;
    } catch (error) {
      console.error(
        `Errore nel recuperare gli articoli del menu: ${error.message}`
      );
      return [];
    }
  };

  const getStadiumPickupPoints = async (id) => {
    try {
      const { data } = await api.get(`/stadiums/${id}/pickup-points`);
      return data;
    } catch (error) {
      console.error(
        `Errore nel recuperare i punti di ritiro: ${error.message}`
      );
      return [];
    }
  };

  // ristoranti
  const getAvailableSlots = async (restaurantIDs) => {
    try {
      const { data } = await api.post("/stadiums/slots", { restaurantIDs });
      return data;
    } catch (error) {
      console.error("Errore nel recuperare gli slot disponibili", error);
    }
  };

  const provided = {
    // stadi
    getMenuItems,
    getStadium,
    getStadiumPickupPoints,
    // ristoranti
    getAvailableSlots,
    // valute
    currencies,
  };
  return (
    <dataContext.Provider value={provided}>{children}</dataContext.Provider>
  );
};

export default DataContext;
