export const paginate = <T>(items: T[], page: number, size: number): T[] => {
  const start = page * size
  const end = start + size - 1
  return items.slice(start, end)
}
