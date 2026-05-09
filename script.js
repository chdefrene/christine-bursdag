const transcript = document.getElementById("transcript");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const typingLabel = document.getElementById("typingLabel");
const nudgeButton = document.getElementById("nudgeButton");
const emojiToggle = document.getElementById("emojiToggle");
const emojiPicker = document.getElementById("emojiPicker");
const chatWindow = document.getElementById("chatWindow");
const messagesEnd = document.getElementById("messagesEnd");

const MESSAGE_DELAY = 2000

const conversation = [
  // { speaker: "Christian", text: "Halla", role: "bot", sendMode: "auto" },
  { speaker: "Christine", text: "Kjenne eg deg? 🤔", role: "user", sendMode: "manual" },
  { speaker: "Christian", text: "Traff deg i skolegården i dag 😛", role: "bot", sendMode: "auto" },
  { speaker: "Christine", text: "Å, d var deg! 😄", role: "user", sendMode: "manual" },
  { speaker: "Christian", text: "Ja, flaks jeg fant deg her på msn! 😅", role: "bot", sendMode: "auto" },
  { speaker: "Christine", text: "D e løye! 🤣 ", role: "user", sendMode: "manual", nudgeAfter: true },
  { speaker: "Christian", text: "Hva driver du med? 😉", role: "bot", sendMode: "auto" },
  { speaker: "Christine", text: "Akkurat feiret bursdag med fammen. Hva med deg? 😎", role: "user", sendMode: "manual" },
  { speaker: "Christian", text: "Å, hadde du bursdag i dag? Gratulerer med dagen! 🥳", role: "bot", sendMode: "auto" },
  { speaker: "Christine", text: "Takk ☺️", role: "user", sendMode: "manual" },
  { speaker: "Christian", text: "Har du fått noe fint i gave da?", role: "bot", sendMode: "auto" },
  { speaker: "Christine", text: "Fikk ny sykkel av pappa", role: "user", sendMode: "manual" },
  { speaker: "Christine", text: "Og så hadde mamma laget asparges suppe!", role: "user", sendMode: "manual" },
  { speaker: "Christian", text: "Det hørtes ikke akkurat ut som tradisjonell bursdagsmat 😄", role: "bot", sendMode: "auto" },
  { speaker: "Christine", text: "Eg elske d! Yummy 😋", role: "user", sendMode: "manual" },
];

let typingTimer;
let conversationIndex = 0;
let waitingForAutoReply = false;

function scrollToBottom() {
  messagesEnd?.scrollIntoView({ behavior: "smooth" });
}

function appendTranscriptLine(name, text, role) {
  const wrapper = document.createElement("div");
  wrapper.className = "mb-2 px-2";

  const label = document.createElement("p");
  label.className = "m-0 fw-bold message-user";
  label.textContent = `${name} says:`;

  const body = document.createElement("div");
  body.className = `m-0 message ${role}`;
  body.textContent = text;

  wrapper.append(label, body);
  transcript.appendChild(wrapper);
  scrollToBottom();
}

function setTyping(text) {
  typingLabel.textContent = text;
}

function clearInputState() {
  messageInput.value = "";
  sendButton.disabled = true;
}

function playAlertSound() {
  const audio = new Audio("assets/sounds/alert.mp3");
  audio.play().catch(() => {});
}

function seedInitialTranscript() {
  waitingForAutoReply = true;
  setTyping("Christian skriver...");
  clearInputState();

  window.setTimeout(() => {
    appendTranscriptLine("Christian", "Halla", "bot");
    playAlertSound();
    waitingForAutoReply = false;
    setTyping("\u00A0");
    applyCurrentMessageToInput();
  }, MESSAGE_DELAY
  );
}

function applyCurrentMessageToInput() {
  const currentMessage = conversation[conversationIndex];

  if (!currentMessage) {
    clearInputState();
    return;
  }

  messageInput.readOnly = true;
  messageInput.value = currentMessage.text;
  sendButton.disabled = false;
}

function continueConversationAfterMessage(message) {
  if (message.nudgeAfter) {
    clearInputState();
    setTyping("\u00A0");
    waitingForAutoReply = true;

    window.setTimeout(() => {
      playNudgeSound();
      waitingForAutoReply = false;
      sendAutomatedReply();
    }, MESSAGE_DELAY);

    return;
  }

  waitingForAutoReply = false;
  setTyping("\u00A0");
  sendAutomatedReply();
}

function sendAutomatedReply() {
  const nextMessage = conversation[conversationIndex];
  if (!nextMessage || nextMessage.sendMode !== "auto") {
    applyCurrentMessageToInput();
    return;
  }

  waitingForAutoReply = true;
  setTyping("Christian skriver...");

  window.setTimeout(() => {
    appendTranscriptLine(nextMessage.speaker, nextMessage.text, nextMessage.role);
    playAlertSound();
    conversationIndex += 1;
    continueConversationAfterMessage(nextMessage);
  }, MESSAGE_DELAY
  );
}

function sendMessage() {
  if (waitingForAutoReply) {
    return;
  }

  const currentMessage = conversation[conversationIndex];
  if (!currentMessage) {
    return;
  }

  appendTranscriptLine(currentMessage.speaker, currentMessage.text, currentMessage.role);
  conversationIndex += 1;
  messageInput.value = "";
  continueConversationAfterMessage(currentMessage);
}

function populateEmojiPicker() {
  for (let i = 1; i <= 32; i += 1) {
    const button = document.createElement("button");
    button.type = "button";

    const image = document.createElement("img");
    image.src = `assets/images/emojis/${i}.png`;
    image.alt = "emoji";

    button.appendChild(image);
    button.addEventListener("click", () => {
      messageInput.focus();
      emojiPicker.hidden = true;
      emojiToggle.setAttribute("aria-expanded", "false");
    });

    emojiPicker.appendChild(button);
  }
}

function playNudgeSound() {
  const audio = new Audio("assets/sounds/nudge.mp3");
  chatWindow.classList.remove("shake");
  void chatWindow.offsetWidth;
  chatWindow.classList.add("shake");
  audio.play().catch(() => {});
}

sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

messageInput.addEventListener("input", () => {
  if (messageInput.readOnly) {
    messageInput.value = conversation[conversationIndex]?.text ?? "";
    return;
  }

  window.clearTimeout(typingTimer);
  setTyping("Christine skriver...");
  typingTimer = window.setTimeout(() => {
    setTyping("\u00A0");
  }, 700);
});

emojiToggle.addEventListener("click", () => {
  const expanded = emojiToggle.getAttribute("aria-expanded") === "true";
  emojiPicker.hidden = expanded;
  emojiToggle.setAttribute("aria-expanded", String(!expanded));
});

nudgeButton.addEventListener("click", playNudgeSound);

document.addEventListener("click", (event) => {
  if (!emojiPicker.contains(event.target) && event.target !== emojiToggle && !emojiToggle.contains(event.target)) {
    emojiPicker.hidden = true;
    emojiToggle.setAttribute("aria-expanded", "false");
  }
});

populateEmojiPicker();
seedInitialTranscript();
