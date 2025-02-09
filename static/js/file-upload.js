// file-upload.js

function dropHandler(event) {
    event.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const files = event.dataTransfer.files;
    fileInput.files = files;
    updateFileInfo(files[0]);
    document.getElementById('dropZone').classList.remove('dragover');
}

function dragOverHandler(event) {
    event.preventDefault();
    document.getElementById('dropZone').classList.add('dragover');
}

function dragLeaveHandler(event) {
    event.preventDefault();
    document.getElementById('dropZone').classList.remove('dragover');
}

function updateFileInfo(file) {
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const outputFormat = document.getElementById('outputFormat');
    
    // Get file extension
    const extension = file.name.split('.').pop().toLowerCase();
    
    // Define allowed extensions
    const allowedExtensions = [
        'png', 'jpg', 'jpeg', 'gif', 'webp',  // Image formats
        'md', 'txt', 'docx', 'pdf',           // Document formats
        'wav', 'mp3', 'ogg', 'flac', 'aac', 'm4a'  // Audio formats
    ];
    
    if (!allowedExtensions.includes(extension)) {
        alert('Invalid file type. Please upload a supported file format.');
        return;
    }
    
    fileName.textContent = file.name;
    fileSize.textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    fileInfo.classList.remove('d-none');
    
    // Update available output formats based on input file type
    updateOutputFormats(extension);
}

function updateOutputFormats(inputExtension) {
    const outputFormat = document.getElementById('outputFormat');
    const imageFormats = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
    const documentFormats = ['md', 'txt', 'docx', 'pdf', 'html'];
    const audioFormats = ['wav', 'mp3', 'ogg', 'flac', 'aac', 'm4a'];
    
    // Reset options
    outputFormat.innerHTML = '<option value="">Select format...</option>';
    
    // Add appropriate conversion options based on file type
    if (imageFormats.includes(inputExtension)) {
        imageFormats.forEach(format => {
            if (format !== inputExtension) {
                outputFormat.innerHTML += `<option value="${format}">${format.toUpperCase()}</option>`;
            }
        });
    }
    
    if (documentFormats.includes(inputExtension)) {
        const conversions = {
            'docx': ['pdf', 'html', 'md', 'txt'],
            'pdf': ['docx', 'html', 'md', 'txt'],
            'html': ['docx', 'pdf', 'md', 'txt'],
            'md': ['docx', 'pdf', 'html', 'txt'],
            'txt': ['docx', 'pdf', 'html', 'md']
        };
        
        conversions[inputExtension].forEach(format => {
            outputFormat.innerHTML += `<option value="${format}">${format.toUpperCase()}</option>`;
        });
    }

    // Add audio conversion options
    if (audioFormats.includes(inputExtension)) {
        audioFormats.forEach(format => {
            if (format !== inputExtension) {
                outputFormat.innerHTML += `<option value="${format}">${format.toUpperCase()}</option>`;
            }
        });
    }
}

// Ensure the elements are loaded before adding a listener.
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', function(event) {
            if (this.files && this.files[0]) {
                updateFileInfo(this.files[0]);
            }
        });
    }

    // Add form submission handler
    const convertForm = document.getElementById('convertForm');
    if (convertForm) {
        convertForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const loadingOverlay = document.getElementById('loadingOverlay');
            loadingOverlay.classList.add('show');
            
            const formData = new FormData(convertForm);
            
            try {
                const response = await fetch('/convert-file', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && (
                        contentType.startsWith('audio/') || 
                        contentType.startsWith('image/') || 
                        contentType.startsWith('application/') ||
                        contentType.startsWith('text/')
                    )) {
                        // Get the filename from the Content-Disposition header
                        const disposition = response.headers.get('content-disposition');
                        let filename = null;
                        
                        if (disposition && disposition.includes('filename=')) {
                            const filenameMatch = disposition.match(/filename="([^"]+)"/);
                            if (filenameMatch) {
                                filename = filenameMatch[1];
                            }
                        }
                        
                        if (!filename) {
                            // Fallback filename if not found in header
                            const outputFormat = formData.get('output_format');
                            filename = `converted.${outputFormat}`;
                        }
                        
                        // Create blob from response
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        
                        // Create and trigger download
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        
                        // Cleanup
                        window.URL.revokeObjectURL(url);
                        a.remove();
                    } else {
                        const data = await response.json();
                        if (data.error) {
                            alert(data.error);
                        }
                    }
                } else {
                    const data = await response.json();
                    alert(data.error || 'Conversion failed');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during conversion');
            } finally {
                loadingOverlay.classList.remove('show');
            }
        });
    }

    // Enhanced drag and drop functionality
    const dropZone = document.getElementById('dropZone');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            document.getElementById('fileInput').files = files;
            updateFileInfo(files[0]);
        }
    });
});