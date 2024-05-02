from llama_index.core.tools import FunctionTool
import os


def save_note(note: str, email: str):
    note_file = os.path.join("/data", email.replace('@','_at_'), "notes.md")
    if not os.path.exists(note_file):
        open(note_file, "w")

    with open(note_file, "a") as f:
        f.writelines([note + "\n\n"])

    return "note saved"


note_engine = FunctionTool.from_defaults(
    fn=save_note,
    name="note_saver",
    description="this tool can save a text based note to a notes.md file for the user",
)
