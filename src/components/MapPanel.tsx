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
      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 ">
        {state.locations.map(
          ({ name, explorationPercentage, isExplored }, index) => {
            const locationData = locations[name];
            const Icon = locationData.icon as React.ElementType;

            return (
              <div
                key={name}
                onClick={() => {
                  if (isBusy) return;
                  if (isExplored) {
                    changeLocation(name);
                  } else {
                    exploreLocation(index);
                  }
                }}
                className="cursor-pointer"
              >
                <div
                  className={`flex justify-center border border-gray-400 p-2 m-1 ${
                    isExplored ? "bg-gray-200" : "bg-gray-400"
                  }
                ${
                  state.currentLocation === name
                    ? "bg-green-200"
                    : "bg-gray-200"
                }`}
                >
                  {isExplored ? (
                    <div className="flex items-center">
                      <Icon className="mr-2" />
                      <span>{locationData.label}</span>
                    </div>
                  ) : (
                    <span>
                      {state.locationExplorationIndex === index ? "..." : `?`}
                      {explorationPercentage > 0
                        ? ` : ${explorationPercentage}%`
                        : ``}
                    </span>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>
    </Section>
  );
}

export default MapPanel;
