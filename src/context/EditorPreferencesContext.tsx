"use client"

import { createContext, useContext, useState } from "react"
import { EditorPreferences, DEFAULT_EDITOR_PREFERENCES } from "@/types/editor"

interface EditorPreferencesContextValue {
  preferences: EditorPreferences
  setPreferences: (p: EditorPreferences) => void
}

const EditorPreferencesContext = createContext<EditorPreferencesContextValue>({
  preferences: DEFAULT_EDITOR_PREFERENCES,
  setPreferences: () => {},
})

export function EditorPreferencesProvider({
  preferences: initial,
  children,
}: {
  preferences: EditorPreferences
  children: React.ReactNode
}) {
  const [preferences, setPreferences] = useState(initial)

  return (
    <EditorPreferencesContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </EditorPreferencesContext.Provider>
  )
}

export function useEditorPreferences(): EditorPreferences {
  return useContext(EditorPreferencesContext).preferences
}

export function useEditorPreferencesContext(): EditorPreferencesContextValue {
  return useContext(EditorPreferencesContext)
}
