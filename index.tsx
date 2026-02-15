
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- Configuration & Helpers ---
const AI_MODEL_CHAT = "gemini-3-flash-preview";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Mock Data for Trails
const TRAIL_DATA = [
    { id: 1, name: "1號步道", level: "Challenge", levelZh: "挑戰級", time: "90分鐘", len: "1.6km", desc: "以圓木棧道為主，穿梭在森林之間，體能需求較高。", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=800" },
    { id: 2, name: "2號步道", level: "Challenge", levelZh: "挑戰級", time: "80分鐘", len: "1.2km", desc: "坡度最陡，有著名的60-80度好漢坡，適合喜愛挑戰的登山客。", image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=800" },
    { id: 3, name: "3號步道", level: "Challenge", levelZh: "挑戰級", time: "100分鐘", len: "1.3km", desc: "沿著山脊稜線而行，視野開闊，可欣賞多樣的鳥類生態。", image: "https://images.unsplash.com/photo-1506103099413-58eb0de57e65?auto=format&fit=crop&q=80&w=800" },
    { id: "3-1", name: "3-1號步道", level: "Challenge", levelZh: "挑戰級", time: "40分鐘", len: "0.6km", desc: "連接3號與4號步道，沿途生態豐富，適合生態觀察。", image: "https://images.unsplash.com/photo-1519331379826-fda8feba31d3?auto=format&fit=crop&q=80&w=800" },
    { id: 4, name: "4號步道", level: "Challenge", levelZh: "挑戰級", time: "120分鐘", len: "1.9km", desc: "地勢最險峻，風景也最美，終點可達頭嵙亭。", image: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=800" },
    { id: 5, name: "5號步道", level: "Leisure", levelZh: "休閒級", time: "90分鐘", len: "1.4km", desc: "串聯1-4號步道的稜線步道，沿途展望極佳。", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800" },
    { id: 6, name: "6號步道", level: "Family", levelZh: "親子級", time: "50分鐘", len: "1.5km", desc: "坡度平緩，適合全家大小，終點有觀音亭可休息。", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800" },
    { id: 7, name: "7號步道", level: "Family", levelZh: "親子級", time: "60分鐘", len: "1.3km", desc: "平緩好走，沿途植被豐富，是認識生態的好去處。", image: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&q=80&w=800" },
    { id: 8, name: "8號步道", level: "Family", levelZh: "親子級", time: "40分鐘", len: "0.9km", desc: "路程短，多為產業道路，適合輕健行。", image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800" },
    { id: 9, name: "9號步道", level: "Family", levelZh: "親子級", time: "40分鐘", len: "1.6km", desc: "大坑最熱門的步道，入口處有農夫市集。", image: "https://images.unsplash.com/photo-1501854140884-074cf2b21d25?auto=format&fit=crop&q=80&w=800" },
    { id: "9-1", name: "9-1號步道", level: "Family", levelZh: "親子級", time: "30分鐘", len: "0.6km", desc: "與9號步道平行，路程較短，適合初學者。", image: "https://images.unsplash.com/photo-1501854140884-074cf2b21d25?auto=format&fit=crop&q=80&w=800" },
    { id: 10, name: "10號步道", level: "Leisure", levelZh: "休閒級", time: "50分鐘", len: "1.2km", desc: "與9號步道形成環狀路線，階梯較多，具挑戰性。", image: "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&q=80&w=800" },
    { id: "ky", name: "南觀音山步道", level: "Leisure", levelZh: "休閒級", time: "60分鐘", len: "1.5km", desc: "位於中臺科大後山，通往觀音亭，展望良好。", image: "https://images.unsplash.com/photo-1519331379826-fda8feba31d3?auto=format&fit=crop&q=80&w=800" },
];

// Mock Data for Trail Status (simulating government announcements)
// Initial State
const INITIAL_TRAIL_STATUS_DATA = [
    { id: 1, name: '1號', status: 'open', msg: '全線開放' },
    { id: 2, name: '2號', status: 'open', msg: '全線開放' },
    { id: 3, name: '3號', status: 'caution', msg: '部分木棧道濕滑，請小心' },
    { id: "3-1", name: '3-1號', status: 'open', msg: '全線開放' },
    { id: 4, name: '4號', status: 'closed', msg: '設施老舊維護中，暫停開放' },
    { id: 5, name: '5號', status: 'open', msg: '全線開放' },
    { id: 6, name: '6號', status: 'open', msg: '全線開放' },
    { id: 7, name: '7號', status: 'open', msg: '全線開放' },
    { id: 8, name: '8號', status: 'caution', msg: '步道邊坡施工，請快速通過' },
    { id: 9, name: '9號', status: 'open', msg: '全線開放' },
    { id: "9-1", name: '9-1號', status: 'open', msg: '全線開放' },
    { id: 10, name: '10號', status: 'closed', msg: '步道維修整建中，暫停開放' },
    { id: "ky", name: '南觀音山', status: 'open', msg: '全線開放' },
];

// --- Components ---

const Navbar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
    const navItems = [
        { id: 'trails', label: '步道', icon: 'fa-hiking' },
        { id: 'guide', label: 'AI嚮導', icon: 'fa-robot' },
        { id: 'calculator', label: '熱量', icon: 'fa-calculator' },
        { id: 'weather', label: '氣象', icon: 'fa-cloud-sun' },
        { id: 'map', label: '地圖', icon: 'fa-map' },
        { id: 'transport', label: '交通', icon: 'fa-bus' },
        { id: 'safety', label: '安全', icon: 'fa-first-aid' },
        { id: 'gallery', label: '相簿', icon: 'fa-images' },
    ];

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('home')}>
                        <i className="fas fa-mountain text-2xl mr-2"></i>
                        <span className="font-bold text-xl tracking-wider hidden sm:block">Dakeng Trails Pro</span>
                         <span className="font-bold text-xl tracking-wider sm:hidden">Dakeng</span>
                    </div>
                    
                    {/* Desktop Nav */}
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-baseline space-x-2">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === item.id ? 'bg-green-800 text-white shadow-inner' : 'hover:bg-green-700 text-green-100'}`}
                                >
                                    <i className={`fas ${item.icon} mr-1`}></i>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="-mr-2 flex md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-green-200 hover:text-white hover:bg-green-700 focus:outline-none">
                            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary shadow-inner">
                        <button
                                onClick={() => { setActiveTab('home'); setIsMenuOpen(false); }}
                                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium text-green-100 hover:bg-green-700`}
                        >
                            <i className="fas fa-home mr-2 w-5"></i> 首頁
                        </button>
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }}
                                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${activeTab === item.id ? 'bg-green-900 text-white' : 'text-green-100 hover:bg-green-700'}`}
                            >
                                <i className={`fas ${item.icon} mr-2 w-5`}></i>
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

const TrailStatusBoard = ({ statuses }: { statuses: typeof INITIAL_TRAIL_STATUS_DATA }) => {
    return (
        <div className="w-full glass-panel border-t border-white/20 py-4 px-2 md:px-0 absolute bottom-0 z-20">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center">
                    <div className="flex items-center mb-3 md:mb-0 md:mr-6 shrink-0">
                         <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2"></div>
                         <h3 className="text-gray-800 font-bold text-sm md:text-base whitespace-nowrap">
                             <i className="fas fa-traffic-light mr-2 text-primary"></i>
                             步道即時燈號
                         </h3>
                    </div>
                    
                    <div className="flex-1 w-full overflow-x-auto hide-scrollbar">
                        <div className="flex space-x-3 md:space-x-6 min-w-max px-2 pb-1">
                            {statuses.map(trail => (
                                <div key={trail.id} className="flex items-center group relative cursor-help">
                                    <div className={`w-3 h-3 rounded-full mr-2 shadow-sm ${
                                        trail.status === 'open' ? 'bg-green-500' : 
                                        trail.status === 'closed' ? 'bg-red-500' : 'bg-yellow-500'
                                    }`}></div>
                                    <span className="text-sm font-medium text-gray-700">{trail.name}</span>
                                    
                                    {/* Tooltip for non-open trails */}
                                    {trail.status !== 'open' && (
                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                            {trail.msg}
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="hidden md:flex text-xs text-gray-500 ml-4 shrink-0 space-x-3 border-l pl-4 border-gray-300">
                        <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>開放</div>
                        <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></div>注意</div>
                        <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>封閉</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Hero = ({ onNavigate, trailStatuses }: { onNavigate: (tab: string) => void, trailStatuses: typeof INITIAL_TRAIL_STATUS_DATA }) => {
    return (
        <div className="relative bg-gray-900 h-[600px] flex items-center justify-center overflow-hidden">
            <img 
                src="https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=1920" 
                alt="Dakeng Landscape" 
                className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="relative z-10 text-center px-4 pb-16">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                    探索大坑 漫步雲端
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-md">
                    台中後花園的極致體驗，結合 AI 智慧導覽，讓您的旅程更安全、更精彩。
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <button 
                        onClick={() => onNavigate('trails')}
                        className="px-8 py-3 bg-secondary hover:bg-orange-600 text-white font-semibold rounded-full shadow-lg transition transform hover:scale-105"
                    >
                        開始探索
                    </button>
                    <button 
                        onClick={() => onNavigate('guide')}
                        className="px-8 py-3 bg-white hover:bg-gray-100 text-primary font-semibold rounded-full shadow-lg transition transform hover:scale-105"
                    >
                        詢問 AI 嚮導
                    </button>
                </div>
            </div>
            
            {/* Real-time Status Board Overlay */}
            <TrailStatusBoard statuses={trailStatuses} />
        </div>
    );
};

const DifficultyBadge = ({ level, levelZh }: { level: string, levelZh: string }) => {
    let barColor = 'bg-gray-300';
    let textColor = 'text-gray-600';
    let activeBars = 0;

    if (level === 'Family') {
        barColor = 'bg-green-500';
        textColor = 'text-green-600';
        activeBars = 1;
    } else if (level === 'Leisure') {
        barColor = 'bg-blue-500';
        textColor = 'text-blue-600';
        activeBars = 2;
    } else if (level === 'Challenge') {
        barColor = 'bg-red-500';
        textColor = 'text-red-600';
        activeBars = 3;
    }

    return (
        <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-full shadow-md flex items-center gap-2 border border-white/20">
            <div className="flex items-end gap-1 h-4">
                <div className={`w-1.5 rounded-sm transition-all duration-300 ${activeBars >= 1 ? barColor : 'bg-gray-200'}`} style={{height: '40%'}}></div>
                <div className={`w-1.5 rounded-sm transition-all duration-300 ${activeBars >= 2 ? barColor : 'bg-gray-200'}`} style={{height: '70%'}}></div>
                <div className={`w-1.5 rounded-sm transition-all duration-300 ${activeBars >= 3 ? barColor : 'bg-gray-200'}`} style={{height: '100%'}}></div>
            </div>
            <span className={`text-xs font-bold ${textColor} tracking-wide`}>
                {levelZh}
            </span>
        </div>
    );
};

const TrailExplorer = ({ trailStatuses }: { trailStatuses: typeof INITIAL_TRAIL_STATUS_DATA }) => {
    const [filter, setFilter] = useState('All');
    
    const filteredTrails = filter === 'All' 
        ? TRAIL_DATA 
        : TRAIL_DATA.filter(t => t.level === filter);

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">步道探索</h2>
                <div className="flex justify-center space-x-2">
                    {['All', 'Family', 'Leisure', 'Challenge'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                filter === type 
                                ? 'bg-primary text-white shadow-md' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {type === 'All' ? '全部' : type === 'Family' ? '親子級' : type === 'Leisure' ? '休閒級' : '挑戰級'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTrails.map(trail => {
                    const status = trailStatuses.find(s => s.id === trail.id);
                    return (
                        <div key={trail.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition duration-300 group">
                            <div className="relative h-48 overflow-hidden">
                                <img 
                                    src={trail.image} 
                                    alt={trail.name} 
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                                />
                                <div className="absolute top-4 right-4">
                                    <DifficultyBadge level={trail.level} levelZh={trail.levelZh} />
                                </div>
                                {/* Status Badge on Card */}
                                {status && status.status !== 'open' && (
                                    <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${status.status === 'closed' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                                        {status.msg}
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{trail.name}</h3>
                                <p className="text-gray-600 text-sm mb-4 h-12 overflow-hidden">{trail.desc}</p>
                                <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
                                    <span className="flex items-center"><i className="far fa-clock mr-1"></i> {trail.time}</span>
                                    <span className="flex items-center"><i className="fas fa-ruler-horizontal mr-1"></i> {trail.len}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const AIGuide = ({ initialMode = 'chat' }: { initialMode?: 'chat' | 'planner' }) => {
    const [mode, setMode] = useState<'chat' | 'planner'>(initialMode);
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
        { role: 'model', text: "您好！我是大坑 AI 智慧嚮導。我可以為您介紹包含1-10號步道、3-1、9-1以及南觀音山步道的特色、規劃行程或提供登山建議。請問今天想去哪裡走走？" }
    ]);
    const [suggestions, setSuggestions] = useState<string[]>([
        "大坑9號步道難度如何？",
        "推薦適合親子的步道",
        "最有挑戰性的是哪一條？",
        "去大坑要帶什麼裝備？",
        "大坑附近有什麼美食推薦？"
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Planner State
    const [planConfig, setPlanConfig] = useState({
        duration: '半日 (約3-4小時)',
        level: '休閒級 (適合一般大眾)',
        notes: ''
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, suggestions, mode]);

    const handleSend = async (textOverride?: string) => {
        const userMsg = textOverride || input;
        if (!userMsg.trim() || isLoading) return;

        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);
        setSuggestions([]);

        try {
            const prompt = `
                你現在是台中大坑步道的專業登山嚮導 "Dakeng Ranger"。
                你的任務是回答遊客關於大坑所有步道（包含1-10號、3-1號、9-1號、中臺科大南觀音山步道）的問題。
                
                請遵循以下原則：
                1. 語氣熱情、專業且友善。
                2. 回答要包含具體資訊（如：公里數、適合對象、風景特色）。
                3. 如果遊客問難度，請清楚區分：
                   - 親子級：6, 7, 8, 9, 9-1
                   - 休閒級：5, 10, 南觀音山
                   - 挑戰級：1, 2, 3, 3-1, 4
                4. 請用繁體中文回答。
                5. 回答必須是 JSON 格式，包含兩個欄位：
                   - reply: 你的回答內容 (String)，支援 Markdown 語法。若為行程規劃，請條列式呈現。
                   - suggestions: 針對使用者的回答，提供 5 個延伸問題 (Array of Strings)，讓使用者可以點選繼續發問。
                
                遊客問題：${userMsg}
            `;

            const response = await ai.models.generateContent({
                model: AI_MODEL_CHAT,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            reply: { type: Type.STRING },
                            suggestions: { 
                                type: Type.ARRAY, 
                                items: { type: Type.STRING } 
                            }
                        }
                    }
                }
            });

            const jsonText = response.text || "{}";
            let parsed;
            try {
                parsed = JSON.parse(jsonText);
            } catch (e) {
                console.error("JSON parse error", e);
                parsed = { reply: response.text, suggestions: [] };
            }

            const text = parsed.reply || "抱歉，我目前無法回答這個問題，請稍後再試。";
            setMessages(prev => [...prev, { role: 'model', text }]);
            
            if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
                setSuggestions(parsed.suggestions);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: "連線發生錯誤，請檢查網路或稍後再試。" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlanSubmit = () => {
        const msg = `請幫我規劃大坑步道行程。
1. 預計時間：${planConfig.duration}
2. 偏好難度：${planConfig.level}
3. 特別需求：${planConfig.notes || '無'}
請提供詳細的行程建議（包含建議路線、休息點、周邊美食）。`;
        
        setMode('chat');
        handleSend(msg);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-140px)] flex flex-col">
            <div className="bg-white rounded-2xl shadow-xl flex-1 flex flex-col overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="bg-primary p-4 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center mr-3">
                            <i className="fas fa-robot text-xl"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">AI 智慧嚮導</h3>
                            <p className="text-xs text-green-100">Powered by Gemini</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50 shrink-0">
                    <button
                        onClick={() => setMode('chat')}
                        className={`flex-1 py-3 text-sm font-bold text-center transition ${
                            mode === 'chat' 
                            ? 'text-primary border-b-2 border-primary bg-white' 
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        <i className="fas fa-comments mr-2"></i>
                        對話諮詢
                    </button>
                    <button
                        onClick={() => setMode('planner')}
                        className={`flex-1 py-3 text-sm font-bold text-center transition ${
                            mode === 'planner' 
                            ? 'text-primary border-b-2 border-primary bg-white' 
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        <i className="fas fa-map-marked-alt mr-2"></i>
                        行程規劃
                    </button>
                </div>
                
                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                    {mode === 'chat' ? (
                        <>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-primary text-white rounded-br-none' 
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                        }`}>
                                            <div className="markdown-body text-sm md:text-base leading-relaxed" style={{whiteSpace: 'pre-wrap'}}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white rounded-2xl rounded-bl-none px-5 py-4 shadow-sm border border-gray-100 flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Suggestions */}
                            {suggestions.length > 0 && !isLoading && (
                                <div className="p-3 bg-gray-50 border-t border-gray-200 overflow-x-auto hide-scrollbar shrink-0">
                                    <div className="flex space-x-2 px-2">
                                        {suggestions.map((s, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSend(s)}
                                                className="flex-shrink-0 px-4 py-2 bg-white text-primary border border-primary/30 rounded-full text-xs md:text-sm hover:bg-primary hover:text-white transition shadow-sm whitespace-nowrap"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="輸入問題，例如：哪裡可以停車？"
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                        disabled={isLoading}
                                    />
                                    <button 
                                        onClick={() => handleSend()}
                                        disabled={isLoading}
                                        className={`px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow-md transition ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
                                    >
                                        <i className="fas fa-paper-plane"></i>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                            <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                        <i className="fas fa-map-marked-alt text-3xl"></i>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">客製化行程規劃</h2>
                                    <p className="text-gray-500 mt-2 text-sm">告訴我您的需求，為您量身打造大坑之旅</p>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            <i className="far fa-clock mr-2 text-primary"></i>
                                            預計停留時間
                                        </label>
                                        <select
                                            value={planConfig.duration}
                                            onChange={(e) => setPlanConfig({...planConfig, duration: e.target.value})}
                                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                                        >
                                            <option value="半日 (約3-4小時)">半日 (約3-4小時)</option>
                                            <option value="全日 (約6-8小時)">全日 (約6-8小時)</option>
                                            <option value="2天1夜">2天1夜</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            <i className="fas fa-chart-line mr-2 text-primary"></i>
                                            偏好強度
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { val: '親子級 (適合一般大眾)', label: '親子休閒', icon: 'fa-child' },
                                                { val: '休閒級 (一般健行)', label: '一般健行', icon: 'fa-walking' },
                                                { val: '挑戰級 (陡坡/圓木棧道)', label: '挑戰級', icon: 'fa-mountain' }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.val}
                                                    onClick={() => setPlanConfig({...planConfig, level: opt.val})}
                                                    className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center justify-center gap-2 transition ${
                                                        planConfig.level === opt.val
                                                        ? 'bg-green-50 border-primary text-primary ring-1 ring-primary'
                                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <i className={`fas ${opt.icon}`}></i>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            <i className="fas fa-pen mr-2 text-primary"></i>
                                            其他需求 (選填)
                                        </label>
                                        <textarea
                                            value={planConfig.notes}
                                            onChange={(e) => setPlanConfig({...planConfig, notes: e.target.value})}
                                            placeholder="例如：想吃甕窯雞、想去農夫市集、需要無障礙廁所..."
                                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-24 resize-none"
                                        ></textarea>
                                    </div>

                                    <button
                                        onClick={handlePlanSubmit}
                                        className="w-full py-4 bg-secondary hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center"
                                    >
                                        <i className="fas fa-magic mr-2"></i>
                                        立即生成行程
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const getWeatherIcon = (code: number) => {
    // WMO Weather interpretation codes
    if (code === 0) return { icon: 'fa-sun', text: '晴朗' };
    if (code >= 1 && code <= 3) return { icon: 'fa-cloud-sun', text: '多雲時晴' };
    if (code === 45 || code === 48) return { icon: 'fa-smog', text: '有霧' };
    if (code >= 51 && code <= 67) return { icon: 'fa-cloud-rain', text: '陣雨' };
    if (code >= 80 && code <= 82) return { icon: 'fa-cloud-showers-heavy', text: '大雨' };
    if (code >= 95) return { icon: 'fa-bolt', text: '雷雨' };
    return { icon: 'fa-cloud', text: '多雲' };
};

const WeatherWidget = () => {
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Open-Meteo API for Dakeng (Lat: 24.18, Long: 120.73)
                const res = await fetch(
                    "https://api.open-meteo.com/v1/forecast?latitude=24.1818&longitude=120.7364&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=Asia%2FTaipei&forecast_days=3"
                );
                const data = await res.json();
                setWeather(data);
            } catch (error) {
                console.error("Failed to fetch weather:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWeather();
    }, []);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
                 <div className="text-xl text-gray-500"><i className="fas fa-spinner fa-spin mr-2"></i> 正在載入即時氣象...</div>
            </div>
        );
    }

    if (!weather) {
        return (
             <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
                 <div className="text-xl text-gray-500">暫時無法取得氣象資訊</div>
            </div>
        );
    }

    const current = weather.current;
    const daily = weather.daily;
    const currentWeatherInfo = getWeatherIcon(current.weather_code);
    const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl shadow-2xl text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                    <i className="fas fa-sun text-9xl"></i>
                </div>
                
                <div className="p-8 md:p-12 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-1">大坑風景區</h2>
                            <p className="text-blue-100">Open-Meteo 即時氣象</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-blue-100">{new Date().toLocaleDateString()}</div>
                            <div className="text-sm font-mono">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center mb-8 md:mb-0">
                            <i className={`fas ${currentWeatherInfo.icon} text-6xl mr-6`}></i>
                            <div>
                                <div className="text-7xl font-bold tracking-tighter">{Math.round(current.temperature_2m)}°</div>
                                <div className="text-xl font-medium mt-1">{currentWeatherInfo.text}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 w-full md:w-auto">
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                                <i className="fas fa-tint mb-2 text-2xl opacity-80"></i>
                                <div className="text-sm opacity-80">濕度</div>
                                <div className="font-bold text-lg">{current.relative_humidity_2m}%</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                                <i className="fas fa-wind mb-2 text-2xl opacity-80"></i>
                                <div className="text-sm opacity-80">風速</div>
                                <div className="font-bold text-lg">{current.wind_speed_10m} km/h</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                                <i className="fas fa-umbrella mb-2 text-2xl opacity-80"></i>
                                <div className="text-sm opacity-80">最高紫外線</div>
                                <div className="font-bold text-lg">{daily.uv_index_max[0]}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/20">
                        <div className="flex items-start">
                            <i className="fas fa-info-circle mt-1 mr-3 text-yellow-300"></i>
                            <p className="text-sm leading-relaxed">
                                今日建議：
                                {daily.uv_index_max[0] > 7 ? ' 紫外線偏高，請注意防曬。' : ''}
                                {current.relative_humidity_2m > 80 ? ' 濕度較高，體感較為悶熱。' : ''}
                                {current.weather_code >= 51 ? ' 可能有雨，請攜帶雨具。' : ' 天氣不錯，適合戶外活動。'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* 3-Day Forecast */}
                 <div className="bg-white p-6 rounded-xl shadow-md">
                     <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">未來三日預報</h3>
                     {daily.time.map((t: string, i: number) => {
                         const date = new Date(t);
                         const dayName = dayNames[date.getDay()];
                         const iconInfo = getWeatherIcon(daily.weather_code[i]);
                         return (
                             <div key={t} className="flex justify-between items-center py-3 text-gray-600 border-b last:border-0 border-gray-100">
                                 <div className="w-16 font-medium">{i === 0 ? '今天' : dayName}</div>
                                 <div className="flex items-center flex-1 justify-center">
                                     <i className={`fas ${iconInfo.icon} mr-2 ${daily.weather_code[i] < 3 ? 'text-yellow-500' : 'text-blue-500'}`}></i>
                                     <span>{iconInfo.text}</span>
                                 </div>
                                 <div className="w-24 text-right font-mono">
                                     {Math.round(daily.temperature_2m_min[i])}° - {Math.round(daily.temperature_2m_max[i])}°
                                 </div>
                             </div>
                         );
                     })}
                 </div>
                 
                 {/* Air Quality Simulation (Open-Meteo Air Quality requires separate call, keeping static for now or can add) */}
                 <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-center items-center">
                     <h3 className="font-bold text-gray-800 mb-4 w-full border-b pb-2">空氣品質 AQI</h3>
                     <div className="w-32 h-32 rounded-full border-8 border-green-500 flex items-center justify-center flex-col text-green-600 mb-2">
                         <span className="text-3xl font-bold">42</span>
                         <span className="text-xs font-bold">良好</span>
                     </div>
                     <p className="text-sm text-gray-500 text-center">空氣品質數據來源於環境監測站模擬</p>
                 </div>
            </div>
        </div>
    );
};

const MapView = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
             <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">步道地圖導覽</h2>
                <p className="text-gray-600 mt-2">點擊地圖可查看詳細路線</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4 h-[600px] relative overflow-hidden group">
                {/* Simulated Interactive Map using an Image */}
                <div className="w-full h-full bg-gray-200 relative rounded-lg overflow-hidden">
                     <img 
                        src="https://www.taichung.gov.tw/media/427909/51131154541.jpg" 
                        alt="Dakeng Map" 
                        className="w-full h-full object-contain"
                    />
                    
                    {/* Interactive Points (Simulated) */}
                    <div className="absolute top-[30%] left-[40%] group-hover:scale-110 transition-transform cursor-pointer">
                        <i className="fas fa-map-marker-alt text-red-600 text-3xl drop-shadow-md animate-bounce"></i>
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap">4號步道入口</span>
                    </div>
                     <div className="absolute bottom-[40%] right-[30%] group-hover:scale-110 transition-transform cursor-pointer">
                        <i className="fas fa-map-marker-alt text-blue-600 text-3xl drop-shadow-md"></i>
                         <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap">9號步道入口</span>
                    </div>
                </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
                 <a href="https://www.google.com/maps/search/Dakeng+Trails" target="_blank" rel="noreferrer" className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition flex items-center">
                     <i className="fab fa-google mr-2"></i> 開啟 Google Maps 導航
                 </a>
            </div>
        </div>
    );
};

const TransportInfo = () => {
    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">交通指引</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-green-500">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-4">
                            <i className="fas fa-bus text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-bold">大眾運輸</h3>
                    </div>
                    <ul className="space-y-4 text-gray-700">
                        <li className="flex items-start">
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded mr-3 mt-1">66路</span>
                            <span>大坑循環公車：經一、二、三號步道入口</span>
                        </li>
                        <li className="flex items-start">
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded mr-3 mt-1">15路</span>
                            <span>台中刑務所演武場 - 國軍台中總醫院</span>
                        </li>
                        <li className="flex items-start">
                            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded mr-3 mt-1">21路</span>
                            <span>台中刑務所演武場 - 三貴城 (經大坑9號步道)</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-blue-500">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4">
                            <i className="fas fa-parking text-2xl"></i>
                        </div>
                        <h3 className="text-xl font-bold">停車資訊</h3>
                    </div>
                    <ul className="space-y-4 text-gray-700">
                        <li className="flex items-start">
                             <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                            <span><b>經補庫停車場</b>：位於九號步道對面，車位多，免費。</span>
                        </li>
                         <li className="flex items-start">
                             <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                            <span><b>地震公園停車場</b>：近9、10號步道。</span>
                        </li>
                         <li className="flex items-start">
                             <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                            <span><b>各登山口路邊停車</b>：1-4號步道登山口腹地較小，建議提早前往。</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

const SafetyInfo = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">登山安全須知</h2>
            
            <div className="space-y-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
                    <h3 className="text-xl font-bold text-red-700 mb-2"><i className="fas fa-phone-alt mr-2"></i>緊急聯絡</h3>
                    <p className="text-red-800">如遇緊急狀況，請立即撥打 119 求救，或 112 (手機訊號不佳時)。</p>
                    <p className="text-red-800 mt-1">大坑風景區管理站電話：04-22289111</p>
                </div>

                <div className="bg-white shadow-md rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">裝備檢查表</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['足夠飲水', '透氣衣物', '登山鞋', '防蚊液', '簡易急救包', '雨具', '行動電源', '少量乾糧'].map(item => (
                            <div key={item} className="flex items-center text-gray-700">
                                <i className="far fa-check-square text-primary mr-2"></i>
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white shadow-md rounded-xl p-6">
                     <h3 className="text-lg font-bold text-gray-800 mb-3">獼猴應對守則</h3>
                     <p className="text-gray-600 mb-2">大坑山區常有台灣獼猴出沒，請遵守「三不原則」：</p>
                     <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                         <li>不餵食：避免獼猴依賴人類食物。</li>
                         <li>不挑釁：請勿直視獼猴眼睛或大聲喧嘩。</li>
                         <li>不接觸：保持距離，以策安全。</li>
                     </ul>
                </div>
            </div>
        </div>
    );
};

// --- Calculator Component ---
const Calculator: React.FC = () => {
  // Use any to allow mixing original TRAIL_DATA with added props
  const [route, setRoute] = useState<any[]>([]);
  const [selectedTrailId, setSelectedTrailId] = useState<string | number>(TRAIL_DATA[0].id);
  const [weight, setWeight] = useState<number>(60);

  // Helper: Parse trail stats on demand
  const getTrailStats = (trailId: string | number) => {
      const trail = TRAIL_DATA.find(t => String(t.id) === String(trailId));
      if (!trail) return null;
      
      const timeMin = parseInt(trail.time.replace(/[^0-9]/g, '')) || 0;
      const lenKm = parseFloat(trail.len.replace(/[^0-9.]/g, '')) || 0;
      let difficulty = 2; // Family
      if (trail.level === 'Leisure') difficulty = 3;
      if (trail.level === 'Challenge') difficulty = 5;
      
      return { ...trail, timeMin, lenKm, difficulty };
  };

  const addToRoute = () => {
    const stats = getTrailStats(selectedTrailId);
    if (stats) {
      setRoute(prev => [...prev, { ...stats, uniqueId: Date.now() }]);
    }
  };

  const removeFromRoute = (indexToRemove: number) => {
    setRoute(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const totalStats = useMemo(() => {
    let calories = 0;
    let water = 0;
    let time = 0;
    let distance = 0;
    const foodSet = new Set<string>();

    route.forEach(item => {
      // METs approx
      let met = 3.5;
      if (item.difficulty >= 4) met = 7.0;
      else if (item.difficulty === 3) met = 5.0;

      const hours = item.timeMin / 60;
      calories += Math.round(met * weight * hours);
      
      // Water: approx 5-8ml per kg per hour
      const waterBase = 5; 
      const waterDiffFactor = 1 + (item.difficulty * 0.1);
      water += Math.round(weight * waterBase * hours * waterDiffFactor);
      
      time += item.timeMin;
      distance += item.lenKm;

      if (item.difficulty >= 4) {
        ['能量膠', '鹽糖', '香蕉'].forEach(f => foodSet.add(f));
      } else if (item.difficulty === 3) {
        ['飯糰', '堅果', '巧克力'].forEach(f => foodSet.add(f));
      } else {
        ['小餅乾', '水果'].forEach(f => foodSet.add(f));
      }
    });

    return {
      calories,
      water,
      time,
      distance: parseFloat(distance.toFixed(1)),
      food: Array.from(foodSet)
    };
  }, [route, weight]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-gray-100 pb-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <i className="fas fa-heartbeat text-primary mr-3"></i>
            行程運動量計算
            </h2>
            <div className="bg-orange-50 text-orange-800 px-5 py-3 rounded-xl text-sm font-medium flex items-center shadow-sm">
            <span className="mr-2 font-bold"><i className="fas fa-weight mr-1"></i> 體重設定:</span>
            <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-20 p-1 bg-white border border-orange-200 rounded text-center focus:outline-none focus:ring-2 focus:ring-orange-300 font-bold"
                min="20"
                max="200"
            />
            <span className="ml-1 font-bold">kg</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Route Builder */}
            <div className="lg:col-span-7 space-y-6">
            
            {/* Add Segment Control */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-inner">
                <label className="block text-base font-bold text-gray-800 mb-3">
                {route.length === 0 ? '選擇起點 (Starting Point)' : '連接下一段步道 (Next Segment)'}
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <select
                        value={selectedTrailId}
                        onChange={(e) => setSelectedTrailId(e.target.value)}
                        className="w-full appearance-none p-4 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary shadow-sm outline-none transition text-gray-900 text-lg font-medium cursor-pointer pr-10"
                    >
                        {TRAIL_DATA.map(trail => (
                        <option key={trail.id} value={trail.id} className="text-gray-900">
                            {trail.name} — {trail.len} ({trail.levelZh})
                        </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-600">
                        <i className="fas fa-chevron-down text-lg"></i>
                    </div>
                </div>
                <button
                    onClick={addToRoute}
                    className="bg-primary hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-transform active:scale-95 shadow-lg flex items-center justify-center text-lg shrink-0"
                >
                    <i className="fas fa-plus mr-2"></i>
                    加入
                </button>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start shadow-sm">
                    <i className="fas fa-info-circle text-blue-500 mt-1 mr-3 shrink-0 text-lg"></i>
                    <p className="text-base text-blue-900 font-medium">
                        {TRAIL_DATA.find(t => String(t.id) === String(selectedTrailId))?.desc}
                    </p>
                </div>
            </div>

            {/* Route Timeline */}
            <div className="relative">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i className="fas fa-route mr-2 text-primary"></i>
                    您的規劃路線
                </h3>
                
                {route.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 bg-gray-50/50">
                    <i className="fas fa-hiking text-4xl mb-3 opacity-30"></i>
                    <p className="text-lg font-medium text-gray-500">尚未加入任何步道</p>
                    <p className="text-sm">請從上方選擇並加入您的第一段行程</p>
                </div>
                ) : (
                <div className="space-y-0 pl-2">
                    {route.map((trail, index) => (
                    <div key={`${trail.uniqueId}`} className="relative pl-8 pb-8 last:pb-0 group">
                        {/* Timeline Line */}
                        {index !== route.length - 1 && (
                            <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-200 group-hover:bg-green-200 transition-colors" />
                        )}
                        
                        {/* Timeline Dot/Icon */}
                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 bg-white shadow-sm
                            ${index === 0 ? 'border-green-500 text-green-600' : 
                            index === route.length - 1 ? 'border-red-500 text-red-600' : 'border-gray-400 text-gray-500'}
                        `}>
                            <i className={`fas text-[10px] ${
                                index === 0 ? 'fa-map-marker-alt' : 
                                index === route.length - 1 ? 'fa-flag-checkered' : 'fa-circle text-[6px]'
                            }`}></i>
                        </div>

                        {/* Content Card */}
                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex justify-between items-center group-hover:border-green-200 group-hover:translate-x-1">
                            <div>
                                <div className="font-bold text-gray-800 flex items-center text-lg">
                                {trail.name}
                                <span className="ml-3 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-normal border border-gray-200">
                                    {trail.lenKm}km
                                </span>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                預估 {trail.timeMin} 分鐘 • 難度 {trail.difficulty}
                                </div>
                            </div>
                            <button 
                            onClick={() => removeFromRoute(index)}
                            className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="移除此段"
                            >
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </div>
                        
                        {/* Arrow between segments */}
                        {index !== route.length - 1 && (
                            <div className="absolute left-[5px] -bottom-3 text-gray-300 z-0">
                                <i className="fas fa-arrow-down text-xs"></i>
                            </div>
                        )}
                    </div>
                    ))}
                </div>
                )}
            </div>
            </div>

            {/* Right Column: Statistics Summary */}
            <div className="lg:col-span-5">
                <div className="bg-green-50 rounded-3xl p-6 sticky top-24 border border-green-100 shadow-lg">
                    <h3 className="text-xl font-bold text-green-900 mb-6 border-b border-green-200 pb-4 flex items-center">
                        <i className="fas fa-chart-pie mr-2"></i>
                        統計總結
                    </h3>

                    {route.length > 0 ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 text-center">
                                    <div className="text-gray-500 text-xs mb-1 font-bold uppercase tracking-wider">總距離</div>
                                    <div className="text-2xl font-black text-gray-800">
                                        {totalStats.distance} <span className="text-sm font-normal text-gray-500">km</span>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 text-center">
                                    <div className="text-gray-500 text-xs mb-1 font-bold uppercase tracking-wider">總時間</div>
                                    <div className="text-2xl font-black text-gray-800">
                                        {totalStats.time} <span className="text-sm font-normal text-gray-500">min</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-orange-100 p-5 rounded-2xl flex items-center justify-between border border-orange-200">
                                <div className="flex items-center">
                                    <div className="bg-orange-500 w-10 h-10 flex items-center justify-center rounded-lg text-white mr-3 shadow-sm">
                                        <i className="fas fa-fire-alt"></i>
                                    </div>
                                    <div>
                                        <div className="text-sm text-orange-900 font-bold">消耗熱量</div>
                                        <div className="text-xs text-orange-700/80">約 {weight}kg 成人</div>
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-orange-600">
                                    {totalStats.calories} <span className="text-sm font-bold">kcal</span>
                                </div>
                            </div>

                            <div className="bg-blue-100 p-5 rounded-2xl flex items-center justify-between border border-blue-200">
                                <div className="flex items-center">
                                    <div className="bg-blue-500 w-10 h-10 flex items-center justify-center rounded-lg text-white mr-3 shadow-sm">
                                        <i className="fas fa-tint"></i>
                                    </div>
                                    <div>
                                        <div className="text-sm text-blue-900 font-bold">建議飲水</div>
                                        <div className="text-xs text-blue-700/80">依強度加權</div>
                                    </div>
                                </div>
                                <div className="text-3xl font-black text-blue-600">
                                    {totalStats.water} <span className="text-sm font-bold">ml</span>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="flex items-center mb-3 text-gray-700 font-bold text-sm">
                                    <i className="fas fa-utensils mr-2 text-gray-400"></i>
                                    建議補給清單
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {totalStats.food.length > 0 ? totalStats.food.map((food, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-xs font-bold text-gray-600">
                                            {food}
                                        </span>
                                    )) : <span className="text-xs text-gray-400 italic">尚無特別建議</span>}
                                </div>
                            </div>
                            
                            <div className="text-center pt-2">
                                <button 
                                    onClick={() => setRoute([])}
                                    className="text-sm text-gray-400 hover:text-red-500 underline decoration-dotted transition-colors"
                                >
                                    清除所有路線
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 py-12">
                            <i className="fas fa-clipboard-list text-4xl mb-3 opacity-20"></i>
                            <div className="mb-1 font-bold">尚無數據</div>
                            <div className="text-xs">請先在左側加入步道</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </div>
    </div>
  );
};

const Gallery = () => {
    const images = [
        "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1506103099413-58eb0de57e65?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600",
    ];

    return (
         <div className="max-w-7xl mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">精選相簿</h2>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                {images.map((src, idx) => (
                    <div key={idx} className="break-inside-avoid rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300">
                        <img src={src} alt={`Gallery ${idx}`} className="w-full h-auto" />
                    </div>
                ))}
            </div>
        </div>
    );
};

const Footer = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
    return (
        <footer className="bg-gray-800 text-gray-300 py-12">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                    <h3 className="text-white text-xl font-bold mb-4">Dakeng Trails Pro 2.0</h3>
                    <p className="text-sm leading-relaxed">
                        致力於提供最完整、最即時的大坑步道資訊。結合 AI 科技，讓每一位登山客都能享受安全、愉快的山林之旅。
                    </p>
                </div>
                <div>
                    <h3 className="text-white text-lg font-bold mb-4">快速連結</h3>
                    <ul className="space-y-2 text-sm">
                        <li><button onClick={() => onNavigate('trails')} className="hover:text-white">步道探索</button></li>
                        <li><button onClick={() => onNavigate('weather')} className="hover:text-white">氣象資訊</button></li>
                        <li><button onClick={() => onNavigate('transport')} className="hover:text-white">交通指引</button></li>
                        <li><button onClick={() => onNavigate('safety')} className="hover:text-white">安全須知</button></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white text-lg font-bold mb-4">聯絡資訊</h3>
                    <ul className="space-y-2 text-sm">
                        <li><i className="fas fa-map-marker-alt mr-2"></i> 台中市北屯區東山路一段383巷</li>
                        <li><i className="fas fa-envelope mr-2"></i> service@dakengpro.tw</li>
                        <li><i className="fab fa-facebook mr-2"></i> Dakeng Trails Pro</li>
                    </ul>
                </div>
            </div>
            <div className="text-center text-xs text-gray-500 mt-12 pt-8 border-t border-gray-700">
                &copy; 2024 Dakeng Trails Pro 2.0. All Rights Reserved. Generated by Gemini.
            </div>
        </footer>
    );
};

const App = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [trailStatuses, setTrailStatuses] = useState(INITIAL_TRAIL_STATUS_DATA);

    useEffect(() => {
        // Simulating periodic updates
        const interval = setInterval(() => {
            // Logic to fetch updates would go here
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <>
                        <Hero onNavigate={setActiveTab} trailStatuses={trailStatuses} />
                        <div className="py-12 bg-white">
                             <div className="max-w-7xl mx-auto px-4 text-center">
                                <h2 className="text-3xl font-bold text-gray-800 mb-8">為什麼選擇大坑？</h2>
                                <div className="grid md:grid-cols-3 gap-8">
                                    <div className="p-6">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                            <i className="fas fa-tree text-2xl"></i>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">豐富生態</h3>
                                        <p className="text-gray-600">擁有低海拔闊葉林生態，四季景色變化豐富，是觀察自然的絕佳教室。</p>
                                    </div>
                                    <div className="p-6">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                            <i className="fas fa-walking text-2xl"></i>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">多樣路線</h3>
                                        <p className="text-gray-600">12條難度各異的步道，從親子休閒到專業挑戰，滿足不同族群的需求。</p>
                                    </div>
                                    <div className="p-6">
                                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                                            <i className="fas fa-robot text-2xl"></i>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">AI 智慧導覽</h3>
                                        <p className="text-gray-600">結合 Google Gemini 技術，提供即時路況諮詢與行程建議，讓登山更安全。</p>
                                    </div>
                                </div>
                             </div>
                        </div>
                        <TrailExplorer trailStatuses={trailStatuses} />
                    </>
                );
            case 'trails': return <TrailExplorer trailStatuses={trailStatuses} />;
            case 'guide': return <AIGuide initialMode="chat" />;
            case 'calculator': return <Calculator />;
            // Map the old planner button to the AI Guide in planner mode
            case 'planner': return <AIGuide initialMode="planner" />;
            case 'weather': return <WeatherWidget />;
            case 'map': return <MapView />;
            case 'transport': return <TransportInfo />;
            case 'safety': return <SafetyInfo />;
            case 'gallery': return <Gallery />;
            default: return <Hero onNavigate={setActiveTab} trailStatuses={trailStatuses} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-grow animate-fade-in">
                {renderContent()}
            </main>
            <Footer onNavigate={setActiveTab} />
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
