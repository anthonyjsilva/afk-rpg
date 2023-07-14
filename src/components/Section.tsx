import { Badge, Button, Card, CardBody, Text } from "@chakra-ui/react";

export default function Section({ title, children }: any): JSX.Element {
  return (
    <div className="m-4 p-4 border-2 border-black rounded-sm shadow text-center">
      <h2 className="text-xl uppercase font-bold border-b pb-2 mb-4 w-2/3 mx-auto">
        {title}
      </h2>
      <p>{children}</p>
    </div>
  );
}

// <Card>
// <CardBody>
//   <Text>View a summary of all your customers over the last month.</Text>
// </CardBody>
// </Card>
