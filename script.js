document.getElementById('fileInput').addEventListener('change', handleFileSelect);
document.getElementById('newFolderBtn').addEventListener('click', createNewFolder);
document.getElementById('newFileBtn').addEventListener('click', createNewFile);

let currentFilePath = '';
let currentFolder = null;

function handleFileSelect(event) {
    const fileList = event.target.files;
    const ul = document.getElementById('fileList');
    ul.innerHTML = ''; // Clear existing list

    const files = {};
    
    Array.from(fileList).forEach(file => {
        const pathParts = file.webkitRelativePath.split('/');
        const fileName = pathParts.pop();
        let currentLevel = files;

        pathParts.forEach(part => {
            currentLevel[part] = currentLevel[part] || {};
            currentLevel = currentLevel[part];
        });

        currentLevel[fileName] = file;
    });

    renderFileList(files, ul);
}

function renderFileList(files, parentUl) {
    for (const [key, value] of Object.entries(files)) {
        const li = document.createElement('li');

        if (typeof value === 'object' && Object.keys(value).length > 0) {
            li.classList.add('folder');
            li.textContent = key;
            const ul = document.createElement('ul');
            renderFileList(value, ul);
            li.appendChild(ul);
            parentUl.appendChild(li);

            li.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                currentFolder = li; // Set current folder for context menu
                showContextMenu(event);
            });
        } else {
            li.classList.add('file');
            li.textContent = key;
            li.addEventListener('click', (event) => {
                event.stopPropagation();
                loadFile(value);
                highlightSelectedFile(li);
            });
            parentUl.appendChild(li);
        }
    }
}

async function loadFile(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        document.getElementById('codeEditor').value = event.target.result;
        currentFilePath = file.name; // Store the current file name
    };
    reader.readAsText(file);
}

function highlightSelectedFile(selectedLi) {
    const allFiles = document.querySelectorAll('#fileList .file');
    allFiles.forEach(file => file.classList.remove('selected'));
    selectedLi.classList.add('selected');
}

async function createNewFile() {
    if (currentFolder) {
        const fileName = prompt("Enter file name:");
        if (fileName) {
            const newFile = document.createElement('li');
            newFile.classList.add('file');
            newFile.textContent = fileName;

            newFile.addEventListener('click', (event) => {
                event.stopPropagation();
                loadNewFile(fileName);
                highlightSelectedFile(newFile);
            });

            const fileHandle = await window.showFilePicker({
                suggestedName: fileName,
                types: [{ description: 'Text Files', accept: { 'text/plain': ['.txt'] } }],
            });

            const writable = await fileHandle.createWritable();
            await writable.write("Initial content..."); // Change this to initial content you want
            await writable.close();

            currentFolder.querySelector('ul').appendChild(newFile);
        }
    }
}

function createNewFolder() {
    if (currentFolder) {
        const folderName = prompt("Enter folder name:");
        if (folderName) {
            const newFolder = document.createElement('li');
            newFolder.classList.add('folder');
            newFolder.textContent = folderName;
            const ul = document.createElement('ul');
            newFolder.appendChild(ul);
            currentFolder.querySelector('ul').appendChild(newFolder);

            newFolder.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                currentFolder = newFolder; // Set current folder for context menu
                showContextMenu(event);
            });
        }
    }
}

// Context Menu
const contextMenu = document.createElement('div');
contextMenu.classList.add('context-menu');
document.body.appendChild(contextMenu);

const newFileButton = document.createElement('button');
newFileButton.textContent = 'New File';
newFileButton.onclick = createNewFile;
contextMenu.appendChild(newFileButton);

const newFolderButton = document.createElement('button');
newFolderButton.textContent = 'New Folder';
newFolderButton.onclick = createNewFolder;
contextMenu.appendChild(newFolderButton);

document.addEventListener('click', () => {
    contextMenu.style.display = 'none'; // Hide context menu on click
});

function showContextMenu(event) {
    event.preventDefault();
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.top = `${event.pageY}px`;
}

// Prevent the context menu from closing immediately
contextMenu.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});
