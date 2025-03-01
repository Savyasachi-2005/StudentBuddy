document.addEventListener('DOMContentLoaded', () => {
    // Chat elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Notes elements
    const notesContent = document.getElementById('notes-content');
    const notesInput = document.getElementById('notes-input');
    const saveNotesButton = document.getElementById('save-notes');

    // Load saved notes from localStorage
    loadNotes();

    // Function to add a message to the chat
    function addMessage(message, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = message;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to the bottom of the chat
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add a "Save as note" option for bot messages
        if (!isUser) {
            const saveToNoteButton = document.createElement('button');
            saveToNoteButton.textContent = '📝 Save as note';
            saveToNoteButton.className = 'save-to-note';
            saveToNoteButton.style.marginTop = '5px';
            saveToNoteButton.style.padding = '5px 10px';
            saveToNoteButton.style.backgroundColor = '#f0f0f0';
            saveToNoteButton.style.border = 'none';
            saveToNoteButton.style.borderRadius = '5px';
            saveToNoteButton.style.cursor = 'pointer';
            
            saveToNoteButton.addEventListener('click', () => {
                saveNote(message);
            });
            
            messageContent.appendChild(document.createElement('br'));
            messageContent.appendChild(saveToNoteButton);
        }
    }

    // Function to add loading indicator
    function addLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot-message loading';
        loadingDiv.id = 'loading-indicator';
        
        const loadingContent = document.createElement('div');
        loadingContent.className = 'message-content loading-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            loadingContent.appendChild(dot);
        }
        
        loadingDiv.appendChild(loadingContent);
        chatMessages.appendChild(loadingDiv);
        
        // Scroll to the bottom of the chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to remove loading indicator
    function removeLoadingIndicator() {
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }

    // Function to send message to the server
    async function sendMessage(message) {
        try {
            addLoadingIndicator();
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });
            
            removeLoadingIndicator();
            
            if (!response.ok) {
                throw new Error('Failed to get response');
            }
            
            const data = await response.json();
            addMessage(data.reply, false);
        } catch (error) {
            removeLoadingIndicator();
            console.error('Error:', error);
            addMessage('Sorry, I encountered an error. Please try again.', false);
        }
    }

    // Function to save a note
    function saveNote(text) {
        const notes = getNotes();
        const id = Date.now();
        notes.push({ id, text, timestamp: new Date().toLocaleString() });
        localStorage.setItem('studentNotes', JSON.stringify(notes));
        renderNotes();
    }

    // Function to get notes from localStorage
    function getNotes() {
        const notes = localStorage.getItem('studentNotes');
        return notes ? JSON.parse(notes) : [];
    }

    // Function to load notes from localStorage
    function loadNotes() {
        renderNotes();
    }

    // Function to delete a note
    function deleteNote(id) {
        const notes = getNotes().filter(note => note.id !== id);
        localStorage.setItem('studentNotes', JSON.stringify(notes));
        renderNotes();
    }

    // Function to render notes to the notes container
    function renderNotes() {
        const notes = getNotes();
        notesContent.innerHTML = '';
        
        // Add export buttons if there are notes
        if (notes.length > 0) {
            const exportContainer = document.createElement('div');
            exportContainer.className = 'export-container';
            exportContainer.style.display = 'flex';
            exportContainer.style.justifyContent = 'flex-end';
            exportContainer.style.marginBottom = '15px';
            
            const exportPdfButton = document.createElement('button');
            exportPdfButton.textContent = '📄 Export to PDF';
            exportPdfButton.className = 'export-button';
            exportPdfButton.style.marginRight = '10px';
            exportPdfButton.style.padding = '8px 12px';
            exportPdfButton.style.backgroundColor = '#4CAF50';
            exportPdfButton.style.color = 'white';
            exportPdfButton.style.border = 'none';
            exportPdfButton.style.borderRadius = '5px';
            exportPdfButton.style.cursor = 'pointer';
            exportPdfButton.addEventListener('click', exportToPdf);
            
            const exportTextButton = document.createElement('button');
            exportTextButton.textContent = '📝 Export to Text';
            exportTextButton.className = 'export-button';
            exportTextButton.style.padding = '8px 12px';
            exportTextButton.style.backgroundColor = '#4CAF50';
            exportTextButton.style.color = 'white';
            exportTextButton.style.border = 'none';
            exportTextButton.style.borderRadius = '5px';
            exportTextButton.style.cursor = 'pointer';
            exportTextButton.addEventListener('click', exportToText);
            
            exportContainer.appendChild(exportPdfButton);
            exportContainer.appendChild(exportTextButton);
            notesContent.appendChild(exportContainer);
        }
        
        if (notes.length === 0) {
            const emptyNoteMsg = document.createElement('div');
            emptyNoteMsg.textContent = 'No notes yet. Add some notes!';
            emptyNoteMsg.style.textAlign = 'center';
            emptyNoteMsg.style.color = '#888';
            emptyNoteMsg.style.marginTop = '20px';
            notesContent.appendChild(emptyNoteMsg);
            return;
        }

        notes.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            
            const noteText = document.createElement('div');
            noteText.className = 'note-text';
            noteText.textContent = note.text;
            
            const noteTimestamp = document.createElement('div');
            noteTimestamp.className = 'note-timestamp';
            noteTimestamp.textContent = note.timestamp || 'No date';
            noteTimestamp.style.fontSize = '0.8rem';
            noteTimestamp.style.color = '#888';
            noteTimestamp.style.marginTop = '5px';
            
            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-note';
            deleteButton.innerHTML = '&times;';
            deleteButton.addEventListener('click', () => deleteNote(note.id));
            
            noteItem.appendChild(noteText);
            noteItem.appendChild(noteTimestamp);
            noteItem.appendChild(deleteButton);
            notesContent.appendChild(noteItem);
        });
    }
    
    // Function to export notes to PDF
    function exportToPdf() {
        const notes = getNotes();
        if (notes.length === 0) return;
        
        // We'll use a hidden form to post to a PDF generation service
        // In production, you'd want to generate the PDF on the server
        // For this example, we'll create a basic PDF using client-side libraries
        
        // Add library for PDF generation if not already added
        if (!window.jspdf) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            document.head.appendChild(script);
            
            script.onload = function() {
                generatePdf(notes);
            };
        } else {
            generatePdf(notes);
        }
    }
    
    // Generate PDF using jsPDF
    function generatePdf(notes) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.text('Study Notes', 15, 15);
        
        // Add date
        doc.setFontSize(10);
        doc.text(`Generated on ${new Date().toLocaleString()}`, 15, 22);
        
        // Add notes
        doc.setFontSize(12);
        let yPos = 30;
        
        notes.forEach((note, index) => {
            // Check if we need a new page
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            
            // Note number
            doc.setFont(undefined, 'bold');
            doc.text(`Note ${index + 1}:`, 15, yPos);
            yPos += 7;
            
            // Timestamp if available
            if (note.timestamp) {
                doc.setFont(undefined, 'italic');
                doc.setFontSize(10);
                doc.text(`Date: ${note.timestamp}`, 15, yPos);
                yPos += 5;
                doc.setFontSize(12);
                doc.setFont(undefined, 'normal');
            }
            
            // Note content with word wrap
            const textLines = doc.splitTextToSize(note.text, 180);
            doc.text(textLines, 15, yPos);
            
            // Move down based on number of lines
            yPos += 7 * textLines.length + 10;
        });
        
        // Save the PDF
        doc.save('StudyNotes.pdf');
    }
    
    // Function to export notes to plain text
    function exportToText() {
        const notes = getNotes();
        if (notes.length === 0) return;
        
        let textContent = "STUDY NOTES\n";
        textContent += "=============\n\n";
        textContent += `Generated on ${new Date().toLocaleString()}\n\n`;
        
        notes.forEach((note, index) => {
            textContent += `Note ${index + 1}:\n`;
            if (note.timestamp) {
                textContent += `Date: ${note.timestamp}\n`;
            }
            textContent += `${note.text}\n\n`;
            textContent += "-------------------\n\n";
        });
        
        // Create blob and download
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'StudyNotes.txt';
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Event listener for send button
    sendButton.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, true);
            userInput.value = '';
            sendMessage(message);
        }
    });

    // Event listener for Enter key in chat input
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const message = userInput.value.trim();
            if (message) {
                addMessage(message, true);
                userInput.value = '';
                sendMessage(message);
            }
        }
    });

    // Event listener for save notes button
    saveNotesButton.addEventListener('click', () => {
        const note = notesInput.value.trim();
        if (note) {
            saveNote(note);
            notesInput.value = '';
        }
    });

    // Event listener for Enter key in notes input
    notesInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const note = notesInput.value.trim();
            if (note) {
                saveNote(note);
                notesInput.value = '';
            }
        }
    });

    // Focus on input when page loads
    userInput.focus();
});