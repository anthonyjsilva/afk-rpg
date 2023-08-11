import { Progress, Button, Stack } from "@chakra-ui/react";
import dayjs from "dayjs";
import { useGameState } from "../GameStateContext";
import Section from "./Section";
import { calculateXPRequired } from "../helpers";

function CharacterPanel() {
  const { state, dispatch } = useGameState();

  // TODO: Add a log out button that returns the user to the login screen
  const logOut = () => {
    // dispatch({ type: "LOG_OUT" });
  };

  const healthPercent = (state.stats.health / state.stats.maxHealth) * 100;
  const energyPercent = (state.stats.energy / state.stats.maxEnergy) * 100;

  const xpRequiredForNextLevel = calculateXPRequired(state.level);
  const xpPercent = (state.xp / xpRequiredForNextLevel) * 100;

  return (
    <Section title="Character Stats">
      <div className="flex flex-row justify-center space-x-10 p-4">
        <img width={100} src={"/person.png"} alt="logo" />
      </div>

      <Stack spacing={3}>
        <div>
          <div className="text-2xl font-bold">John the {state.path}</div>

          <div className="text-lg">Passives</div>
          <ul className="border">
            <li>2x success chance when chopping</li>
            <li>2x xp gain from chopping</li>
          </ul>
        </div>

        <div>
          HP {state.stats.hp} / {state.stats.maxHp}
        </div>
        <Progress colorScheme="green" size="lg" value={healthPercent} />
        <div>
          Energy {state.stats.energy} / {state.stats.maxEnergy}
        </div>
        <Progress colorScheme="yellow" size="md" value={energyPercent} />

        <div>Level {state.level}</div>
        <div>
          XP {state.xp} / {xpRequiredForNextLevel}
        </div>
        <Progress value={xpPercent} colorScheme="blue" size="sm" mt={2} />

        <hr />
        <div className="my-4">
          <div>Last active - {dayjs(state.lastActive).fromNow()}</div>
          <div>last login: {dayjs(state.lastLogin).fromNow()}</div>

          <Button className="my-4" colorScheme="gray" onClick={logOut}>
            Log Out
          </Button>
        </div>
      </Stack>
    </Section>
  );
}

export default CharacterPanel;
