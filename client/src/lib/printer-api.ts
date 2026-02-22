import { apiRequest } from "./queryClient";

// Declare global interface for window.electronAPI
declare global {
    interface Window {
        electronAPI?: {
            printReceipt: (data: any) => Promise<{ success: boolean; error?: string }>;
        };
    }
}

/**
 * Sends a receipt to be printed.
 * Supports "Server" mode (printer attached to backend) and "Agent" mode (local machine printer).
 */
export async function printReceipt(receiptData: any): Promise<void> {
    const USE_LOCAL_AGENT = localStorage.getItem('PRINTER_MODE') === 'LOCAL';

    // 1. ELECTRON MODE (Native App) - Highest Priority
    if (window.electronAPI) {
        console.log('Sending print job to Native Electron App...');
        const result = await window.electronAPI.printReceipt(receiptData);
        if (!result.success) {
            throw new Error(`Native Print Failed: ${result.error}`);
        }
        return;
    }

    // 2. LOCAL AGENT MODE (Web Browser + Printer Agent)
    if (USE_LOCAL_AGENT) {
        try {
            console.log('Sending print job to Local Agent (localhost:4000)...');
            const res = await fetch('http://localhost:4000/print', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(receiptData)
            });

            if (!res.ok) {
                // Try to extract the specific error message from the agent (e.g., "Printer disconnected.")
                try {
                    const errorData = await res.json();
                    if (errorData && errorData.error) {
                        throw new Error(`Local Printer Error: ${errorData.error}`);
                    }
                } catch (parseError) {
                    // Ignore parse error, fallback to generic error below
                }
                throw new Error('Local Agent failed to print');
            }
        } catch (e: any) {
            console.error('Local Print Error:', e);

            // If the error was thrown by our own block above (it has "Local Printer Error:"), re-throw it as is
            if (e.message && e.message.startsWith('Local Printer Error:')) {
                throw new Error(e.message.replace('Local Printer Error: ', '')); // Clean up prefix for UI
            }

            // Otherwise, it was a network failure connecting to localhost:4000
            throw new Error('Could not connect to Local Printer Agent. Is it running?');
        }
        return;
    }

    // 3. SERVER MODE (Default - Printer on Server)
    console.log('Sending print job to Server...');
    await apiRequest('POST', '/api/print/receipt', receiptData);
}

/**
 * Sends a test print command
 */
export async function testPrinter(): Promise<void> {
    // Simulate dummy data for test
    const testData = {
        storeName: "TEST PRINT",
        orderId: "TEST-001",
        items: [{ name: "Test Item", quantity: 1, total: 1.00 }],
        subtotal: 1.00,
        total: 1.00,
        paymentMethod: "CASH",
        timestamp: new Date().toISOString()
    };

    return printReceipt(testData);
}
