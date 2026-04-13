#!/bin/bash
# PreToolUse hook — bloque les commandes qui ouvrent des fenêtres navigateur.
# Règles : Playwright sans --headless, Vite avec --open, Vitest avec browser.ui.

input=$(cat)
command=$(node -e "const i=JSON.parse(process.argv[1]);console.log((i.tool_input&&i.tool_input.command)||'')" "$input" 2>/dev/null)

if [ -z "$command" ]; then
  exit 0
fi

# Playwright : doit toujours avoir --headless
if echo "$command" | grep -qE 'playwright'; then
  if echo "$command" | grep -qE '(screenshot|test|codegen)' && ! echo "$command" | grep -q '\-\-headless'; then
    echo '{"decision":"block","reason":"Playwright doit toujours utiliser --headless. Ajoute --headless à la commande."}'
    exit 0
  fi
fi

# Vite : interdire --open
if echo "$command" | grep -qE 'vite|npm run (dev|start|start-demo)'; then
  if echo "$command" | grep -q '\-\-open'; then
    echo '{"decision":"block","reason":"Vite ne doit pas utiliser --open (ouvre une fenêtre navigateur). Retire le flag --open."}'
    exit 0
  fi
fi

exit 0
