import { Progress, Button } from "@chakra-ui/react";
import dayjs from "dayjs";
import { useGameState } from "../GameStateContext";
import Section from "./Section";

function CharacterPanel() {
  const { state, dispatch } = useGameState();

  // TODO: Add a log out button that returns the user to the login screen
  const logOut = () => {
    // dispatch({ type: "LOG_OUT" });
  };

  return (
    <Section title="Character Stats">
      <div className="flex flex-row justify-center space-x-10 p-10">
        <img width={100} src={"/person.png"} alt="logo" />
      </div>

      <div>
        <div>Level {1}</div>
        <div>1xaj - Farmer</div>
      </div>

      <div>XP {state.xp}</div>
      <Progress value={state.xp} colorScheme="blue" size="sm" mt={2} />

      <hr />
      <div className="my-4">
        <div>Last active - {dayjs(state.lastActive).fromNow()}</div>
        <div>last login: {dayjs(state.lastLogin).fromNow()}</div>

        <Button className="my-4" colorScheme="gray" onClick={logOut}>
          Log Out
        </Button>
      </div>
    </Section>
  );
}

export default CharacterPanel;
