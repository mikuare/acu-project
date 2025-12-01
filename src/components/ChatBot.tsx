import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
    id: string;
    text: string;
    sender: 'bot' | 'user';
    timestamp: Date;
}

interface ChatBotProps {
    projects: any[];
}

const ChatBot = ({ projects }: ChatBotProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm the QMAZ Project Map Bot. How can I help you today? You can ask me about project stats, how to use the map, or specific features.",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const calculateStats = () => {
        const total = projects.length;
        const ongoing = projects.filter(p => p.status === 'ongoing').length;
        const implemented = projects.filter(p => p.status === 'implemented').length;
        const totalCost = projects.reduce((sum, p) => sum + (p.contract_cost || 0), 0);

        return { total, ongoing, implemented, totalCost };
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const processMessage = (text: string) => {
        const lowerText = text.toLowerCase();
        const stats = calculateStats();

        // Restricted Topics
        if (
            lowerText.includes("admin") ||
            lowerText.includes("credential") ||
            lowerText.includes("login") ||
            lowerText.includes("password") ||
            lowerText.includes("account") ||
            lowerText.includes("create account") ||
            lowerText.includes("sign up")
        ) {
            return "Please contact admin.";
        }

        // General Features / "What can you do?"
        if (
            lowerText.includes("feature") ||
            lowerText.includes("function") ||
            lowerText.includes("what can you do") ||
            lowerText.includes("help") ||
            lowerText.includes("guide")
        ) {
            return "I can help you with:\n• Project Statistics (Total, Cost, Ongoing)\n• Map Navigation (Pinning, Location)\n• Searching & Filtering Projects\n• Viewing Project Details\n• Reporting Issues\n• Branch Information\n\nJust ask me a question like 'How many ongoing projects?' or 'How do I filter by year?'";
        }

        // Location
        if (lowerText.includes("location") || lowerText.includes("gps") || lowerText.includes("where am i")) {
            return "To enable location services, please check your browser settings. Usually, you can click the lock icon in the address bar and allow 'Location' access for this site. This will center the map on your current position.";
        }

        // Map Interaction
        if (lowerText.includes("pin") || lowerText.includes("marker") || lowerText.includes("map")) {
            return "Projects are automatically pinned on the map based on their registered region and province. You can:\n• Zoom in/out to see clusters separate.\n• Click on any marker to view a quick summary.\n• Click 'View Details' on the popup for full info.";
        }

        // Search & Filter
        if (
            lowerText.includes("search") ||
            lowerText.includes("find") ||
            lowerText.includes("filter") ||
            lowerText.includes("sort")
        ) {
            return "You can use the search bar at the top to find projects by ID, description, province, or region. Use the dropdown filters to narrow down by:\n• Year\n• Category\n• Region/Province\n• Status (Ongoing, Implemented, etc.)";
        }

        // Project Details & Table
        if (
            lowerText.includes("detail") ||
            lowerText.includes("info") ||
            lowerText.includes("table") ||
            lowerText.includes("list")
        ) {
            return "You can view projects in two modes: Map or Table. Toggle between them using the buttons at the top right. Click on any project in the list or map to open the full details modal, which shows the timeline, team members, and contact info.";
        }

        // Report Feature
        if (lowerText.includes("report") || lowerText.includes("issue") || lowerText.includes("problem")) {
            return "The Report feature allows you to flag issues or updates for a specific project. Open the project details and click the 'Report' button to submit a new report entry. This alerts the admin team.";
        }

        // Branches
        if (lowerText.includes("branch") || lowerText.includes("office")) {
            return "We have three main branches managing projects:\n• ADC (Teal Color)\n• QGDC (Black Color)\n• QMB (Red Color)\n\nThe color coding on the map markers helps identify which branch manages a specific project.";
        }

        // Installation / Mobile
        if (lowerText.includes("install") || lowerText.includes("app") || lowerText.includes("mobile") || lowerText.includes("phone")) {
            return "You can install this system as an app on your device! Look for the 'Install' button in the header (if available) or use your browser's 'Add to Home Screen' option for a better mobile experience.";
        }

        // Statistics
        if (lowerText.includes("ongoing") || lowerText.includes("active")) {
            return `Currently, there are ${stats.ongoing} ongoing projects.`;
        }

        if (lowerText.includes("implemented") || lowerText.includes("completed") || lowerText.includes("finish") || lowerText.includes("done")) {
            return `There are ${stats.implemented} implemented projects so far.`;
        }

        if (lowerText.includes("total project") || lowerText.includes("how many project") || lowerText.includes("count")) {
            return `We have a total of ${stats.total} projects in the database.`;
        }

        if (lowerText.includes("cost") || lowerText.includes("budget") || lowerText.includes("money") || lowerText.includes("price") || lowerText.includes("value")) {
            return `The total cost for all projects is ${formatCurrency(stats.totalCost)}.`;
        }

        // Contact / Team
        if (lowerText.includes("contact") || lowerText.includes("team") || lowerText.includes("personnel")) {
            return "Project specific contact details and team members are listed in the 'Project Information' tab within the Project Details modal.";
        }

        // Default
        return "I'm not sure about that specific query. I can help with:\n• Project Stats & Costs\n• How to Search/Filter\n• Map Features\n• Reporting Issues\n\nTry asking 'What features do you have?' or 'How do I search?'";
    };

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const newUserMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue("");

        // Simulate bot thinking delay
        setTimeout(() => {
            const botResponseText = processMessage(newUserMessage.text);
            const newBotMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponseText,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, newBotMessage]);
        }, 600);
    };

    return (
        <>
            {/* Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl z-[2000] bg-[#FF5722] hover:bg-[#F4511E] transition-all duration-300"
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>

            {/* Chat Window */}
            {isOpen && (
                <Card className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] shadow-2xl z-[2000] flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 border-t-4 border-t-[#FF5722]">
                    <CardHeader className="p-4 border-b bg-slate-50 dark:bg-slate-900">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Bot className="h-5 w-5 text-[#FF5722]" />
                            QMAZ Project Map Bot
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'user'
                                                ? 'bg-[#FF5722] text-white rounded-br-none'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t bg-white dark:bg-slate-950">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon" className="bg-[#FF5722] hover:bg-[#F4511E]">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
};

export default ChatBot;
