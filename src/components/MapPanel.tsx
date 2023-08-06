// fill out this component

import { Button } from "@chakra-ui/react";
import React, { useState } from "react";
import { Section } from ".";
import { locations } from "../data";
import { useGameState } from "../GameStateContext";

function MapPanel() {
  const { state, dispatch } = useGameState();

  const [isExploring, setIsExploring] = useState(false);

  const updateMessages = (newMessage: string) => {
    dispatch({ type: "ADD_MESSAGE", payload: newMessage });
  };
  const setCurrentAction = (actionName: string) => {
    dispatch({ type: "SET_CURRENT_ACTION", payload: actionName });
  };
  const addLocation = (name: string) => {
    dispatch({ type: "ADD_LOCATION", payload: name });
  };

  const changeLocation = (newLocation: string) => {
    setCurrentAction("none");
    dispatch({ type: "SET_LOCATION", payload: newLocation });
    updateMessages(
      `You travel from the ${
        state.currentLocation as string
      } to ${newLocation}.`
    );
  };

  const handleExploration = () => {
    setCurrentAction("exploring");
    setIsExploring(true);

    setTimeout(() => {
      setCurrentAction("none");
      setIsExploring(false);

      // Randomly discover a new location
      const unexploredLocations = Object.keys(locations).filter(
        (loc) => !state.exploredLocations.includes(loc)
      );

      if (unexploredLocations.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * unexploredLocations.length
        );
        const newLocation = unexploredLocations[randomIndex];
        addLocation(newLocation);

        // Display a message about the new location
        updateMessages(
          `success#You have discovered a new location: ${locations[newLocation].label}!`
        );
      } else {
        // Display a message if all locations are explored
        updateMessages(`success#You have explored all available locations!`);
      }
    }, 2000);
  };

  // New function to handle exploration when clicking on a location
  const exploreNewLocation = (locationLabel: string) => {
    setCurrentAction("exploring");
    setIsExploring(true);

    setTimeout(() => {
      setCurrentAction("none");
      setIsExploring(false);

      const locationKey = Object.keys(locations).find(
        (key) => locations[key].label === locationLabel
      );

      if (locationKey) {
        addLocation(locationKey);

        // Display a message about the new location
        updateMessages(
          `success#You have discovered a new location: ${locationLabel}!`
        );
      }
    }, 2000);
  };

  return (
    <Section title="Map">
      <h3 className="text-xl uppercase font-bold">{state.currentLocation}</h3>
      Current location
      <table>
        <tbody>
          {Object.values(locations).map((locationData, index) => {
            const locationKey = Object.keys(locations)[index];
            const Icon = locationData.icon as React.ElementType;

            // Check if the location is already explored
            const isExplored = state.exploredLocations.includes(locationKey);

            // Show only explored locations
            if (isExplored) {
              return (
                <tr
                  key={locationData.label}
                  onClick={() => changeLocation(locationKey)}
                  className="cursor-pointer"
                >
                  <td className="flex items-center">
                    <Icon className="mr-2" />
                    {locationData.label}
                  </td>
                </tr>
              );
            }
            return null;
          })}
        </tbody>
      </table>
      {/* Exploration Button */}
      <div className="m-4">
        {isExploring ? (
          <Button colorScheme="gray" disabled>
            Exploring...
          </Button>
        ) : (
          <Button colorScheme="blue" onClick={handleExploration}>
            Explore New Location
          </Button>
        )}
      </div>
    </Section>
  );
}

export default MapPanel;
