document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const faqBox = document.getElementById("faq-box");
    const faqLink = document.getElementById("faq-link");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-btn");

    // Load FAQs on click
    faqLink.addEventListener("click", function (event) {
        event.preventDefault();
        if (faqBox.style.display === "none") {
            fetch("/api/faqs")
                .then(response => response.json())
                .then(data => {
                    if (data.faqs && data.faqs.length > 0) {
                        faqBox.innerHTML = "<h3>Frequently Asked Questions:</h3>";
                        data.faqs.forEach((faq, index) => {
                            faqBox.innerHTML += `<p><a href="#" class="faq-question" data-answer="${faq.answer}">${faq.question}</a></p>`;
                        });

                        document.querySelectorAll(".faq-question").forEach(item => {
                            item.addEventListener("click", function (event) {
                                event.preventDefault();
                                appendMessage("Bot", this.dataset.answer);
                            });
                        });
                    } else {
                        faqBox.innerHTML = "<p>No FAQs available.</p>";
                    }
                    faqBox.style.display = "block";
                })
                .catch(error => console.error("Error fetching FAQs:", error));
        } else {
            faqBox.style.display = "none";
        }
    });

    sendButton.addEventListener("click", function () {
        let query = userInput.value.trim();
        if (!query) return;

        appendMessage("You", query);

        fetch("/api/confluence", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: query }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.documents && data.documents.length > 0) {
                data.documents.forEach(doc => {
                    appendMessage("Bot", `<strong>${doc.title}</strong><br>${doc.summary}<br><a href="${doc.link}" target="_blank">View More</a>`);
                });
            } else {
                appendMessage("Bot", "No relevant documents found.");
            }
        })
        .catch(error => {
            console.error("Error fetching Confluence data:", error);
            appendMessage("Bot", "Error fetching data. Please try again.");
        });

        userInput.value = "";
    });

    function appendMessage(sender, message) {
        let messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
