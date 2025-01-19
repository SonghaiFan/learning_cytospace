import { ReactNode } from "react";

interface ExampleSectionProps {
  title?: string;
  children: ReactNode;
}

export function ExampleSection({ title, children }: ExampleSectionProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      {children}
    </div>
  );
}
