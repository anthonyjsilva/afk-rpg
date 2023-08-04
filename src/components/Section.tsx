interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export default function Section({
  title,
  children,
}: SectionProps): JSX.Element {
  return (
    <div className="m-4 p-4 border-2 border-black rounded-sm shadow text-center">
      <h2 className="text-xl uppercase font-bold border-b pb-2 mb-4 w-2/3 mx-auto">
        {title}
      </h2>
      <p>{children}</p>
    </div>
  );
}
