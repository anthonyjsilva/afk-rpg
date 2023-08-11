import { Button, Progress } from "@chakra-ui/react";
import { useState, useEffect } from "react";

import { useGameState } from "../GameStateContext";
import Section from "./Section";
import { actionData, itemData } from "../data/data";
import { mapActionData } from "../data/data";
import { calculatePercentage, hasChance } from "../helpers";
import { GiMining } from "react-icons/gi";
import { GAME_INTERVAL, GAME_INTERVAL_MS } from "../data/constants";

function ActionPanel(): JSX.Element {
  const { state, dispatch } = useGameState();
  const [actionAttempts, setActionAttempts] = useState<number>(0);
  const [actionResults, setActionResults] = useState<number[]>([]);

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

    setIsActionInProgress(state.currentAction !== "none");

    if (isActionInProgress) {
      actionInterval = setInterval(() => {
        setActionAttempts((actionAttempts) => actionAttempts + 1);

        const thisActionData = actionData[state.currentAction];

        // only subtract energy if the action costs energy
        if (thisActionData.energyCost !== null) {
          const energyChange =
            thisActionData.energyCost === undefined
              ? -1
              : thisActionData.energyCost;
          // Dispatch an action to update the game state with the new energy
          dispatch({ type: "SET_ENERGY", payload: energyChange });
        }

        const hasRelevantPassive =
          state.currentAction === "chopping" && state.path === "Lumberjack";
        const chanceMultiplier = hasRelevantPassive ? 2 : 1;
        const xpMultiplier = hasRelevantPassive ? 2 : 1;

        // should come from action data?
        const xpAmt = thisActionData.xp * xpMultiplier;

        const isSuccess = hasChance(thisActionData.chance * chanceMultiplier);

        if (isSuccess) {
          // keep track of how many times the action has succeeded
          setActionResults((actionResults) => [...actionResults, 1]);

          // Dispatch an action to update the game state with the new XP
          dispatch({ type: "ADD_XP", payload: xpAmt });

          // if this action type yield an item, add it to the inventory
          if (thisActionData.item !== null) {
            // quest progress
            if (thisActionData.item === "wood") {
              state.quests[0].step++;
            }

            // Dispatch an action to update the game state with the new inventory
            state.inv.add(thisActionData.item);
            dispatch({ type: "UPDATE_INVENTORY", payload: state.inv.items });
            addMessage(
              `success#You got some ${
                itemData[thisActionData.item].name
              } (+${xpAmt} XP) (-${1} Energy)`
            );
          }

          // if there is a success function, call it
          if (thisActionData.successFn) {
            thisActionData.successFn({ state, dispatch });
          }
        } else {
          setActionResults((actionResults) => [...actionResults, 0]);
          if (thisActionData.item !== null) {
            addMessage(
              `error#You failed to get some ${
                itemData[thisActionData.item].name
              }. (-${1} Energy)`
            );
          }
        }
      }, GAME_INTERVAL_MS);
    }

    return () => {
      if (actionInterval) {
        clearInterval(actionInterval);
      }
    };
  }, [isActionInProgress, state.currentAction]);

  const startAction = (action: string) => {
    if (state.stats.energy > 0 || action === "sleeping") {
      setCurrentAction(action);
      setIsActionInProgress(true);
      addMessage(`You begin ${actionData[action].label}...`);
    } else {
      addMessage(`error#You don't have enough energy to do that!`);
    }
  };

  const endAction = () => {
    setActionAttempts(0);
    setActionResults([]);
    if (state.locationExplorationIndex !== null) {
      state.locationExplorationIndex = null;
    }
    setCurrentAction("none");
    setIsActionInProgress(false);
    addMessage(`You stop ${actionData[state.currentAction].label}.`);
  };

  const actionSuccessTimes = actionResults.filter(Boolean).length;

  return (
    <Section title="Actions">
      <div className="mb-4">
        <h3 className="text-xl">Current action</h3>
        <p className="mb-2">{state.currentAction} </p>
        <p>
          {actionAttempts
            ? `(${actionAttempts} attempts ${calculatePercentage(
                actionSuccessTimes,
                actionAttempts
              )}% success rate)`
            : ""}
        </p>
        {isActionInProgress && <Progress size="lg" isIndeterminate />}
      </div>

      <div className="">
        {mapActionData(actionData, (key, value) => {
          const isShown =
            key !== "change" &&
            (value.location.includes(state.currentLocation) ||
              value.location.includes("all"));

          if (!isShown) {
            return null;
          } else {
            let isDisabled = false;
            if (value.tool !== null && !state.inv.hasItem(value.tool)) {
              isDisabled = true;
            }

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
