import { List, ListItem, ListIcon } from "@chakra-ui/react";
import { EditIcon, WarningIcon } from "@chakra-ui/icons";
import { MdCheckCircle, MdSettings } from "react-icons/md";
import { Section } from "./";

function QuestPanel() {
  return (
    <Section title="Quests">
      <List spacing={3}>
        <ListItem>
          <EditIcon />
          Craft a pickaxe
        </ListItem>
        <ListItem>
          <ListIcon as={MdCheckCircle} color="green.500" />
          Assumenda, quia temporibus eveniet a libero incidunt suscipit
        </ListItem>
        <ListItem>
          <ListIcon as={MdCheckCircle} color="green.500" />
          Quidem, ipsam illum quis sed voluptatum quae eum fugit earum
        </ListItem>
        {/* You can also use custom icons from react-icons */}
        <ListItem>
          <ListIcon as={MdSettings} color="green.500" />
          Quidem, ipsam illum quis sed voluptatum quae eum fugit earum
        </ListItem>
      </List>
    </Section>
  );
}

export default QuestPanel;
