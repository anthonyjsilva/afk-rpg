import Section from "./Section";

interface MessagePanelProps {
  messages: string[];
}

const messageColors = {
  success: "text-green-500",
  info: "text-slate-500",
  warning: "text-orange-500",
  error: "text-red-500",
};

const MessagePanel: React.FC<MessagePanelProps> = ({ messages }) => {
  return (
    <Section title="Messages">
      <ul>
        {messages.map((message, index) => {
          const messageType: string =
            message.split("#").length > 1 ? message.split("#")[0] : "info";
          const messageText: string =
            message.split("#").length > 1 ? message.split("#")[1] : message;
          const colorClass: string = messageColors[messageType] as string;

          return (
            <li key={index} className={colorClass}>
              {messageText}
            </li>
          );
        })}
      </ul>
    </Section>
  );
};

export default MessagePanel;
