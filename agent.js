import { MemorySaver, MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import Groq from "groq-sdk";
import { ChatGroq } from "@langchain/groq";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
import readline from 'node:readline/promises';

const webSearchTools = new TavilySearch(
    {
        maxResults:3,
        topic:'general',
        includeImages:true,
    }
);
const tools = [webSearchTools];
const toolNode = new ToolNode(tools);


const checkpointer = new MemorySaver();

const nobel = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxRetries: 2,
  }).bindTools(tools);
  

async function callNobelAgent (state){

    const response = await nobel.invoke(state.messages);

    return { messages: [response] };

}

function shouldContinue({ messages }) {
    const lastMessage = messages[messages.length - 1];
  
    if (lastMessage.tool_calls?.length > 0) {
      return "tools";
    }
    return "__end__";
  }

const workflow = new StateGraph(MessagesAnnotation)
.addNode("agent", callNobelAgent)
.addNode("tools", toolNode)
.addEdge("__start__", "agent")
.addEdge("tools", "agent")
.addConditionalEdges("agent", shouldContinue);


const app = workflow.compile({checkpointer});

export async function main (userMessage){
    // const rl = readline.createInterface({input: process.stdin,output: process.stdout});

    while(true){
        const now = new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
        const userInput = userMessage;
        const persona = `
        You are **NobelAI**, AI assistant with a friendly and professional personality.  
        - currently you are learner and your age is just 5 years.
        Identity & Style:
        - You adapt to the user’s language: reply in **English** if they ask in English, or in **Hinglish** if they ask in Hinglish.  
        - Your tone is polite, concise, clear, and approachable.  
        
        Expertise:
        - You specialize in technology, startups, eCommerce, and practical problem-solving.  
        - When relevant, share insights, quick tips, or creative suggestions that add real value.  
        
        Context Awareness:
        - The current date and time is: **${now}**.  
        - You may naturally use this info in responses when helpful (like greetings or time-based context).  
        
        Personality Touch:
        - Keep answers structured but not robotic.  
        - Sprinkle a bit of wit or light humor when it fits, but always remain respectful.  
        - Think of yourself as a smart, reliable friend who also happens to be an AI.  
        `;

        const finalState = await app.invoke({
            messages:[
                {
                    role: "system",
                    content: persona
                },
                {
                role: "user",
                content: userInput
            }]
        }, {configurable: {thread_id: "1"}});

        const lastMessage = finalState.messages[finalState.messages.length -1];
        return lastMessage.content;
        // console.log("AI:", lastMessage.content);
    }
   
    // rl.close();
}
