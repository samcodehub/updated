import pyscreenshot
from tkinter import Tk, Button, Label

def capture_screenshot():
    # Get the coordinates of the target window (e.g., using a tool like xdotool)
    # For demonstration, let's assume the target window's top-left corner is at (100, 100)
    x, y, width, height = 100, 100, 800, 600  # Adjust these values accordingly
    
    # Capture the specified region
    image = pyscreenshot.grab(bbox=(x, y, x + width, y + height))
    
    # Display the screenshot
    image.show()
    
    # Save the screenshot
    image.save("screenshot.jpg")

# Create a simple GUI window
window = Tk()
window.title("Screenshot Tool")

# Create capture button
capture_button = Button(window, text="Capture Screenshot", command=capture_screenshot)
capture_button.pack()

# Create label
label = Label(window, text="Press the button to capture a screenshot.")
label.pack()

# Start the GUI event loop
window.mainloop()
