import { ChannelStore, MessageStore, SelectedChannelStore, UserStore } from "@webpack/common";

export interface ConversationMessage {
    author: string;
    displayName: string;
    content: string;
    timestamp: string;
    isOwn: boolean;
}

const formatTimestamp = (timestamp: string): string => {
    try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    } catch {
        return "";
    }
};

export const getRecentMessages = (limit: number = 20): ConversationMessage[] => {
    try {
        const channelId = SelectedChannelStore.getChannelId();
        if (!channelId) return [];

        const messages = MessageStore.getMessages(channelId);
        if (!messages) return [];

        const messageArray = messages.toArray?.() || [];
        const recentMessages = messageArray.slice(-limit);
        const currentUser = UserStore.getCurrentUser();
        
        return recentMessages.map((msg: any) => ({
            author: msg.author?.username || "Unknown",
            displayName: msg.author?.globalName || msg.author?.username || "Unknown",
            content: msg.content || "",
            timestamp: formatTimestamp(msg.timestamp),
            isOwn: msg.author?.id === currentUser?.id
        })).filter((msg: ConversationMessage) => msg.content.length > 0);
    } catch {
        return [];
    }
};

export const formatConversationContext = (messages: ConversationMessage[]): string => {
    if (messages.length === 0) return "";
    
    return messages.map(msg => {
        const name = msg.isOwn ? "Yo" : msg.displayName;
        const time = msg.timestamp ? `[${msg.timestamp}]` : "";
        return `${time} ${name}: ${msg.content}`;
    }).join("\n");
};
