/** Invalidate + refetch so header trash counts update immediately. */
export async function refreshListAndTrash(queryClient, listKey, trashKey) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [listKey] }),
    queryClient.invalidateQueries({ queryKey: [trashKey] }),
  ]);
  await Promise.all([
    queryClient.refetchQueries({ queryKey: [listKey], type: "all" }),
    queryClient.refetchQueries({ queryKey: [trashKey], type: "all" }),
  ]);
}
