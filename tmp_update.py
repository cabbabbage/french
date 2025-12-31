from pathlib import Path
path = Path("src/ui/components/tests/common/MCVariant.tsx")
data = path.read_text()
old = "      title={`${word.french_word} ƒ?" ${test.phase.replace(/_/g, ' ')}`"
