import React from "react";
import { Section } from ".";
import { locations } from "../data/data";
import { useGameState } from "../GameStateContext";

function MapPanel() {
  const { state, dispatch } = useGameState();
  const isBusy = state.currentAction !== "none";

  const addMessage = (newMessage: string) => {
    dispatch({ type: "ADD_MESSAGE", payload: newMessage });
  };
  const setCurrentAction = (actionName: string) => {
    dispatch({ type: "SET_CURRENT_ACTION", payload: actionName });
  };

  const changeLocation = (newLocation: string) => {
    setCurrentAction("none");
    dispatch({ type: "SET_ENERGY", payload: -10 });
    dispatch({ type: "SET_LOCATION", payload: newLocation });
    addMessage(
      `You travel from the ${
        state.currentLocation as string
      } to ${newLocation}. (-10 energy)`
    );
  };

  const exploreLocation = (locationIndex: number) => {
    state.locationExplorationIndex = locationIndex;
    setCurrentAction("exploring");
  };

  return (
    <Section title="Map">
      Current location
      <h3 className="text-xl uppercase font-bold">{state.currentLocation}</h3>
    </Section>
  );
}

export default MapPanel;
