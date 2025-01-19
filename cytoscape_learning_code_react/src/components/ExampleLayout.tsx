import { ReactNode } from "react";

interface ExampleLayoutProps {
  title: string;
  children: ReactNode;
  description?: string;
}

export function ExampleLayout({
  title,
  description,
  children,
}: ExampleLayoutProps) {
  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        {description && <p className="text-gray-600 mb-6">{description}</p>}
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}
