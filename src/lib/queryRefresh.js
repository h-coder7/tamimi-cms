/**
 * TT-9: Invalidate active list and trash queries without triggering
 * redundant requests for unmounted or inactive queries.
 */
export async function refreshListAndTrash(queryClient, listKey, trashKey) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [listKey], refetchType: "active" }),
    queryClient.invalidateQueries({ queryKey: [trashKey], refetchType: "active" }),
  ]);
}
