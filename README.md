# AI-First CRM HCP Module (Assignment Round 1)

This project is an AI-first Customer Relationship Management (CRM) system conceptualized for life science field representatives. It features a modern, split-screen interface where users can seamlessly log interactions with Healthcare Professionals (HCPs) entirely through a conversational AI assistant, completely eliminating the need for manual data entry.

## 🌟 Key Features

* **AI-Driven Data Entry:** The left-hand form is strictly read-only. All data population is driven by natural language processing via the AI chat assistant on the right.
* **Intelligent Entity Extraction:** The AI parses conversational inputs (e.g., "Met with Dr. Smith, sentiment was positive...") and maps them to structured form fields (HCP Name, Sentiment, Attendees, Materials Shared, etc.).
* **Dynamic Editing:** Users can correct specific fields conversationally (e.g., "Actually, the sentiment was negative") without rewriting the entire log.
* **Multi-Model Support:** Includes a dynamic dropdown to switch between 5 different Groq LLM models on the fly.
* **Modern UI/UX:** Built with React, Redux Toolkit, and Tailwind CSS v4, utilizing the Google Inter font for a clean, clinical, enterprise-grade aesthetic.

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Redux Toolkit (State Management)
* Tailwind CSS v4
* JavaScript (ES6+)

**Backend:**
* Python 3.x
* FastAPI (REST API framework)
* LangGraph (Agentic Workflow & State Management)
* Langchain
* Groq Cloud API (LLM inference)

---

## ⚙️ LangGraph Agent & Tools Architecture

The backend utilizes LangGraph to create an intelligent agent capable of routing conversational intent to specific executable tools. 

**The 5 Implemented Tools:**
1. `log_interaction` *(Mandatory)*: Extracts core meeting details (HCP name, type, sentiment, topics, attendees, materials, samples) from natural language and outputs a structured JSON payload to update the frontend form.
2. `edit_interaction` *(Mandatory)*: Identifies specific fields that require modification based on user corrections, leaving the rest of the previously extracted data intact.
3. `fetch_hcp_history`: Retrieves historical context for a specific HCP to inform the AI's conversational memory.
4. `schedule_follow_up`: Detects intent for future actions and structures calendar event parameters.
5. `log_sample_distribution`: Specialized tool to track physical product inventory and compliance logic when samples are distributed.

---

## 🚀 Installation & Setup

### Prerequisites
* Node.js (v18+)
* Python (3.9+)
* Git
* A Groq API Key ([Get one here](https://console.groq.com/keys))

### 1. Clone the Repository
```bash
git clone [https://github.com/YourUsername/crm-hcp-module.git](https://github.com/YourUsername/crm-hcp-module.git)
cd crm-hcp-module
