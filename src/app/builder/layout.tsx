import BuilderTabs from "@/components/nav/BuilderTabs";

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <BuilderTabs />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
