"use client";

import { useEffect, useState } from "react";
import type { ClassSelection } from "@/types/academic";

const CLASS_KEY = "unify_class";
const CLASS_CHANGED = "unify:class-changed";

export function hasSelectedClass(selection: ClassSelection | null): boolean {
  return Boolean(selection?.departmentId && selection.batchId);
}

function getClassSelection(): ClassSelection | null {
  try {
    const saved = localStorage.getItem(CLASS_KEY);
    return saved ? (JSON.parse(saved) as ClassSelection) : null;
  } catch {
    return null;
  }
}

export function setClassSelection(selection: ClassSelection) {
  localStorage.setItem(CLASS_KEY, JSON.stringify(selection));
  window.dispatchEvent(new Event(CLASS_CHANGED));
}

export function useClassSelection() {
  const [selection, setSelection] = useState<ClassSelection | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    function loadSelection() {
      setSelection(getClassSelection());
      setLoaded(true);
    }

    loadSelection();
    window.addEventListener(CLASS_CHANGED, loadSelection);
    window.addEventListener("storage", loadSelection);
    return () => {
      window.removeEventListener(CLASS_CHANGED, loadSelection);
      window.removeEventListener("storage", loadSelection);
    };
  }, []);

  return { cls: selection, loaded, needsSelection: loaded && !hasSelectedClass(selection) };
}
