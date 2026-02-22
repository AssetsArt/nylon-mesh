# --- Output Configuration ---
Output demo.gif

# --- Terminal Settings ---
Set FontSize 18
Set Width 1900
Set Height 800
Set Padding 40
Set Theme "Dracula"
Set Framerate 30
Set WindowBar Colorful
Set TypingSpeed 0.05s

Show

Type "cd test-nylon-mesh"
Enter
Sleep 1s
Type "clear"
Enter

Type "tmux"
Enter
Sleep 1s

Type "tmux split-window -h"
Enter
Sleep 1s

Sleep 500ms
Type "bunx --bun next start -p 3001"
Enter
Sleep 1s

Ctrl+B
Sleep 500ms
Left

Type "nylon-mesh init"
Enter
Sleep 2s
Type "nylon-mesh start"
Enter
Sleep 4s

Hide
Type "exit"
Enter