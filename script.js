let memoryChart;
let storageChart;

// Initialize charts
function initializeCharts() {
    const ctxMemory = document.getElementById('memoryChart').getContext('2d');
    memoryChart = new Chart(ctxMemory, {
        type: 'bar',
        data: {
            labels: ['Used', 'Available'],
            datasets: [{
                label: 'Memory (MB)',
                data: [0, 0], // initial values
                backgroundColor: ['#76c7c0', '#e0e0e0'],
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Memory (MB)',
                    }
                }
            }
        }
    });

    const ctxStorage = document.getElementById('storageChart').getContext('2d');
    storageChart = new Chart(ctxStorage, {
        type: 'bar',
        data: {
            labels: ['Used', 'Available'],
            datasets: [{
                label: 'Storage (GB)',
                data: [0, 0], // initial values
                backgroundColor: ['#ffa500', '#e0e0e0'],
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Storage (GB)',
                    }
                }
            }
        }
    });
}

// Update Device Info and Charts
async function updateDeviceInfo() {
    // Get memory info
    const memoryInfo = navigator.deviceMemory; // in GB
    const totalMemory = memoryInfo * 1024; // convert to MB
    const usedMemory = totalMemory - (performance.memory.jsHeapSizeLimit / 1024 / 1024); // estimate used memory
    const memoryAvailable = totalMemory - usedMemory;

    // Update Memory Info
    memoryChart.data.datasets[0].data = [usedMemory, memoryAvailable];
    memoryChart.update();
    document.getElementById('memory-info').innerText = `Used: ${Math.round(usedMemory)} MB of ${Math.round(totalMemory)} MB`;

    // Get storage info
    try {
        const storageInfo = await navigator.storage.estimate();
        const totalStorage = storageInfo.quota / (1024 * 1024 * 1024); // in GB
        const usedStorage = (storageInfo.usage / (1024 * 1024 * 1024)); // in GB
        const storageAvailable = totalStorage - usedStorage;

        // Update Storage Info
        storageChart.data.datasets[0].data = [usedStorage, storageAvailable];
        storageChart.update();
        document.getElementById('storage-info').innerText = `Used: ${Math.round(usedStorage)} GB of ${Math.round(totalStorage)} GB`;
    } catch (error) {
        console.error("Storage API not accessible:", error);
    }

    // Update System Info
    updateSystemInfo();
}

function updateSystemInfo() {
    // Get ChromeOS Build Version from userAgent
    const userAgent = navigator.userAgent;
    const chromeOSBuildMatch = userAgent.match(/CrOS\s\w+\s([\d\.]+)/);
    const chromeOSBuild = chromeOSBuildMatch ? chromeOSBuildMatch[1] : 'Unknown';

    // Example static data for demonstration
    const motherboardType = 'Octopus'; // Replace with actual method to retrieve
    const processor = navigator.userAgent.includes('Intel') ? 'Intel Processor' : 'ARM Processor'; // Basic detection

    document.getElementById('motherboard-info').innerText = `Motherboard Type: ${motherboardType}`;
    document.getElementById('chromeos-info').innerText = `ChromeOS Build: ${chromeOSBuild}`;
    document.getElementById('processor-info').innerText = `Processor: ${processor}`;
}

// Tab functionality
function openTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(tabName).classList.add('active');
    document.querySelector(`.tab-button[onclick="openTab('${tabName}')"]`).classList.add('active');
}

// Initialize charts and set interval for updates
initializeCharts();
setInterval(updateDeviceInfo, 5000);
updateDeviceInfo(); // Initial call
