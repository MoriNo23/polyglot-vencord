#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SOURCE_DIR="/home/fullmetal/Descargas/polyglot-vencord"
TARGET_DIR="/home/fullmetal/Vencord/src/userplugins/polyglot"

echo -e "${YELLOW}=== Polyglot Plugin Update ===${NC}"
echo ""

echo -e "${YELLOW}[1/4] Verifying directories...${NC}"
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}Error: Source directory not found: $SOURCE_DIR${NC}"
    exit 1
fi

if [ ! -d "$(dirname "$TARGET_DIR")" ]; then
    echo -e "${RED}Error: Vencord userplugins directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Directories verified${NC}"
echo ""

echo -e "${YELLOW}[2/4] Cleaning target...${NC}"
rm -rf "$TARGET_DIR/src" 2>/dev/null
rm -f "$TARGET_DIR/index.tsx" "$TARGET_DIR/native.ts" "$TARGET_DIR/styles.css" 2>/dev/null
echo -e "${GREEN}✓ Old files removed (preserving .git, README, LICENSE, screenshots)${NC}"
echo ""

echo -e "${YELLOW}[3/4] Copying new files...${NC}"
mkdir -p "$TARGET_DIR"

cp "$SOURCE_DIR/index.tsx" "$TARGET_DIR/"
cp "$SOURCE_DIR/native.ts" "$TARGET_DIR/"
cp "$SOURCE_DIR/styles.css" "$TARGET_DIR/"
cp -r "$SOURCE_DIR/src" "$TARGET_DIR/"

echo -e "${GREEN}✓ Files copied${NC}"
echo ""

echo -e "${YELLOW}[4/4] Verifying...${NC}"
PASS=true

for f in index.tsx native.ts styles.css src/settings.tsx src/services/gemini/client.ts src/services/gemini/translation.ts src/services/gemini/synonyms.ts src/services/gemini/definition.ts src/services/gemini/index.ts src/services/gemini/types.ts src/utils/selection.ts src/utils/cache.ts src/components/PopupCard.tsx src/components/TranslationTab.tsx src/components/SynonymsTab.tsx src/components/DefinitionsTab.tsx; do
    if [ -f "$TARGET_DIR/$f" ]; then
        echo -e "${GREEN}  ✓ $f${NC}"
    else
        echo -e "${RED}  ✗ $f MISSING${NC}"
        PASS=false
    fi
done

echo ""
if $PASS; then
    echo -e "${GREEN}=== Update complete ===${NC}"
    echo -e "Build: ${GREEN}cd /home/fullmetal/Vencord && pnpm build${NC}"
else
    echo -e "${RED}=== Update incomplete — missing files ===${NC}"
    exit 1
fi
