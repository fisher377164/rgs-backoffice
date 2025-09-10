export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function filterPlugins<T extends { name: string }>(items: T[], query: string) {
  const q = query.toLowerCase();
  return items.filter((item) => item.name.toLowerCase().includes(q));
}
