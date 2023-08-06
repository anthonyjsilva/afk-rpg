import { Button, Progress } from "@chakra-ui/react";
import { useState, useEffect } from "react";

import { useGameState } from "../GameStateContext";
import Section from "./Section";
import { actionData, itemData } from "../data";
import { mapActionData } from "../data";
import { hasChance } from "../helpers";
import { GiMining } from "react-icons/gi";

function ActionPanel(): JSX.Element {
  const { state, dispatch } = useGameState();

  // Updating the state
  const setCurrentAction = (actionName: string) => {
    dispatch({ type: "SET_CURRENT_ACTION", payload: actionName });
  };
  const addMessage = (message: string) => {
    dispatch({ type: "ADD_MESSAGE", payload: message });
  };

  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(
    state.currentAction !== "none"
  );

  useEffect(() => {
    let actionInterval: number | undefined;

    if (isActionInProgress) {
      actionInterval = setInterval(() => {
        const thisActionData = actionData[state.currentAction];
        const isSuccess = hasChance(thisActionData.chance);

        if (isSuccess) {
          // Dispatch an action to update the game state with the new XP
          dispatch({ type: "UPDATE_XP", payload: 1 });
          addMessage(`success#You got +1 XP`);

          state.inv.add(thisActionData.item);
          // Dispatch an action to update the game state with the new inventory
          dispatch({ type: "UPDATE_INVENTORY", payload: state.inv.items });
          addMessage(
            `success#You got some ${itemData[thisActionData.item].name}`
          );
        }
      }, 2000);
    }

    return () => {
      if (actionInterval) {
        clearInterval(actionInterval);
      }
    };
  }, [isActionInProgress, state.currentAction]);

  const startAction = (action: string) => {
    setCurrentAction(action);
    setIsActionInProgress(true);
    addMessage(`You begin ${actionData[action].label}...`);
  };

  const endAction = () => {
    setCurrentAction("none");
    setIsActionInProgress(false);
    addMessage(`You stop ${actionData[state.currentAction].label}.`);
  };

  return (
    <Section title="Actions">
      <div className="mb-4">
        <h3 className="text-xl">Current action</h3>
        <p className="mb-2">{state.currentAction}</p>
        {isActionInProgress && <Progress size="lg" isIndeterminate />}
      </div>

      <div className="">
        {mapActionData(actionData, (key, value) => {
          const isShown = value.location.includes(state.currentLocation);

          if (!isShown) {
            return null;
          } else {
            const isDisabled = !state.inv.hasItem(value.tool);

            let colorScheme = isDisabled ? "gray" : "blue";
            colorScheme =
              isActionInProgress && state.currentAction === key
                ? "red"
                : "blue";
            const text =
              isActionInProgress && state.currentAction === key
                ? `Stop ${value.label}`
                : `${value.label}`;

            return (
              <div key={key} className="mb-4">
                <Button
                  leftIcon={<GiMining />}
                  isDisabled={isDisabled}
                  colorScheme={colorScheme}
                  onClick={() => {
                    isActionInProgress ? endAction() : startAction(key);
                  }}
                >
                  {text}
                </Button>

                {isDisabled && (
                  <p className="text-red-400">requires {value.tool}</p>
                )}
              </div>
            );
          }
        })}
      </div>
    </Section>
  );
}

export default ActionPanel;
