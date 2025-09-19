const input = document.querySelector('#input');
const chatContainer = document.querySelector('#chat-container');
const askBtn = document.querySelector('#ask');

input?.addEventListener('keyup',handleEnter);
askBtn?.addEventListener('click',handleAsk);

const loading = document.createElement('div')
loading.className = 'my-6'
loading.textContent = 'Thinking...'


async function generate(text){
    const msg= document.createElement('div');
    msg.className = 'my-6 bg-neutral-200 p-3  rounded-xl ml-auto max-w-fit';
    msg.textContent = text;
    chatContainer?.appendChild(msg);
    input.value = '';

    chatContainer?.appendChild(loading);

    const assistentMsg = await callServer(text);

    const assistentMsgElem= document.createElement('div');
    // assistentMsgElem.className = 'max-w-fit';
    assistentMsgElem.className = 'my-6 p-3 rounded-xl max-w-prose prose prose-invert';
    // assistentMsgElem.textContent = assistentMsg;
    assistentMsgElem.innerHTML = marked.parse(assistentMsg);

    loading.remove();

    chatContainer?.appendChild(assistentMsgElem);
    assistentMsgElem.scrollIntoView({ behavior: "smooth", block: "end" })

}

async function callServer(text){
    const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message:text }) // send {message:"..."}
    });
    if(!res.ok){
        console.log('error');
    }
    const data = await res.json();
    return data.message
}

async function handleAsk(e){
    const text = input?.value.trim();
    if(!text){
        return;
    }
    await generate(text);
}

async function handleEnter(e) {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault(); // optional: stops newline in textareas
      const text = input?.value.trim();
      if (!text) return;
      await generate(text);
    }
  }
  