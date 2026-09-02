import { useMemo } from "react";
import type { VaultDocument, VaultStats } from "../types/eduvault.types";
import { calculateVaultStats } from "../services/documentService";

export const useVaultStats = (
  documents: VaultDocument[],
  allDocsWithDeleted: VaultDocument[] = []
): VaultStats => {
  return useMemo(() => {
    return calculateVaultStats(documents, allDocsWithDeleted);
  }, [documents, allDocsWithDeleted]);
};
