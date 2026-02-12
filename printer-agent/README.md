# Local Printer Agent for H-ERP Cafe

This standalone agent allows the browser-based POS to print to a local USB printer (specifically XPrinter POS-80) on the cashier's machine, by bypassing browser security restrictions and communicating directly with the USB device.

## Prerequisites
- Node.js (v18+)
- Linux (Ubuntu/Lubuntu) with USB printer support
- User must be in `lp` group: `sudo usermod -aG lp $USER`

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start the Agent:**
    ```bash
    ./start-agent.sh
    ```
    This script runs the agent in a loop, restarting it automatically if it crashes.

3.  **Auto-Start on Login:**
    Copy `printer-agent.desktop` to `~/.config/autostart/`.

    OR use the Systemd User Service:
    ```bash
    mkdir -p ~/.config/systemd/user
    cp printer-agent.service ~/.config/systemd/user/
    systemctl --user daemon-reload
    systemctl --user enable --now printer-agent
    ```

## Usage
The agent runs on `http://localhost:4000`.
The POS frontend sends POST requests to `/print` with the receipt JSON data.
