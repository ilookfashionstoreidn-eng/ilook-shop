import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { 
    Send, 
    MessageSquare, 
    Search, 
    ShoppingBag, 
    AlertCircle, 
    User,
    ChevronRight,
    X
} from 'lucide-react';
import axios from 'axios';

export default function Chats() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef(null);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    // Fetch active chat users list
    const fetchUsers = (isFirstLoad = false) => {
        if (isFirstLoad) setLoadingUsers(true);
        axios.get('/admin/api/chats/users')
            .then(res => {
                if (res.data.success) {
                    setUsers(res.data.users);
                }
            })
            .catch(err => console.error('Error fetching chat users:', err))
            .finally(() => {
                if (isFirstLoad) setLoadingUsers(false);
            });
    };

    // Fetch messages for selected user
    const fetchMessages = (userId, isFirstLoad = false) => {
        if (isFirstLoad) setLoadingMessages(true);
        axios.get(`/api/chats/messages?user_id=${userId}`)
            .then(res => {
                if (res.data.success) {
                    setMessages(res.data.messages);
                }
            })
            .catch(err => console.error('Error fetching messages:', err))
            .finally(() => {
                if (isFirstLoad) setLoadingMessages(false);
            });
    };

    // Mark messages as read
    const markAsRead = (userId) => {
        axios.post('/api/chats/read', { sender_id: userId })
            .then(() => {
                // Update local users list to clear unread count
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, unread_count: 0 } : u));
            })
            .catch(err => console.error('Error marking as read:', err));
    };

    // Select a user to chat with
    const handleSelectUser = (user) => {
        setSelectedUser(user);
        fetchMessages(user.id, true);
        markAsRead(user.id);
    };

    // Send a reply
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        // Check if there's an active product context in the conversation to attach
        // We can look at the last user message that has a product
        const lastProductMessage = [...messages]
            .reverse()
            .find(m => m.product_id && m.sender_id === selectedUser.id);
        
        const productId = lastProductMessage ? lastProductMessage.product_id : null;

        const payload = {
            message: newMessage,
            receiver_id: selectedUser.id,
            product_id: productId
        };

        axios.post('/api/chats/messages', payload)
            .then(res => {
                if (res.data.success) {
                    setMessages(prev => [...prev, res.data.message]);
                    setNewMessage('');
                    
                    // Update user's last message locally
                    setUsers(prev => prev.map(u => u.id === selectedUser.id 
                        ? { ...u, last_message: res.data.message.message, last_message_time: res.data.message.created_at }
                        : u
                    ));

                    // Scroll to bottom
                    setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                }
            })
            .catch(err => console.error('Error sending message:', err));
    };

    // Polling effect
    useEffect(() => {
        fetchUsers(true);

        const interval = setInterval(() => {
            fetchUsers();
            if (selectedUser) {
                fetchMessages(selectedUser.id);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedUser?.id]);

    // Scroll to bottom when messages list updates
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    // Filter users list based on search term
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Find if current conversation has a product context being discussed
    const currentProductContext = [...messages]
        .reverse()
        .find(m => m.product)?.product;

    return (
        <AdminLayout>
            <Head title="Chat Pembeli - Admin Panel" />

            <div className="h-[calc(100vh-8rem)] flex bg-white border border-gray-100 shadow-sm overflow-hidden font-sans">
                {/* Left Pane: Users List */}
                <div className="w-80 border-r border-gray-100 flex flex-col h-full bg-gray-50/50">
                    <div className="p-4 bg-white border-b border-gray-100">
                        <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-emerald-600" />
                            <span>Pesan Masuk</span>
                        </h2>
                        <div className="mt-3 relative">
                            <input
                                type="text"
                                placeholder="Cari pembeli..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 focus:outline-none focus:border-emerald-500 placeholder:text-gray-400 text-xs rounded-lg bg-gray-50 text-gray-900"
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-gray-100/50">
                        {loadingUsers ? (
                            <div className="p-8 text-center text-xs text-gray-400">
                                Memuat obrolan...
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                                <AlertCircle className="w-6 h-6 text-gray-300" />
                                <span>Tidak ada obrolan aktif.</span>
                            </div>
                        ) : (
                            filteredUsers.map(user => {
                                const isSelected = selectedUser?.id === user.id;
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => handleSelectUser(user)}
                                        className={`w-full text-left p-4 transition-all flex items-start gap-3 border-l-2 ${
                                            isSelected 
                                                ? 'bg-white border-l-emerald-600 shadow-xs' 
                                                : 'hover:bg-gray-100/60 border-l-transparent'
                                        }`}
                                    >
                                        <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-700 text-sm uppercase flex-shrink-0">
                                            {user.name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className="text-xs font-bold text-gray-900 truncate pr-2">
                                                    {user.name}
                                                </h4>
                                                {user.last_message_time && (
                                                    <span className="text-[9px] text-gray-400">
                                                        {new Date(user.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-400 truncate mb-1">{user.email}</p>
                                            <p className={`text-xs truncate ${user.unread_count > 0 ? 'font-semibold text-gray-950' : 'text-gray-500'}`}>
                                                {user.last_message || 'Mulai obrolan...'}
                                            </p>
                                        </div>
                                        {user.unread_count > 0 && (
                                            <span className="h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white flex-shrink-0 animate-pulse">
                                                {user.unread_count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Pane: Chat Window */}
                <div className="flex-1 flex flex-col h-full bg-white">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between shadow-xs bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-base uppercase">
                                        {selectedUser.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{selectedUser.name}</h3>
                                        <p className="text-[10px] text-gray-400 font-medium">{selectedUser.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Content Body */}
                            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                                {/* Messages List */}
                                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50 flex flex-col">
                                    {loadingMessages ? (
                                        <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                                            Memuat riwayat pesan...
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                                            Tidak ada pesan dalam obrolan ini.
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isMe = msg.sender_id !== selectedUser.id;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                                >
                                                    {/* Display product card right above user's message if associated */}
                                                    {msg.product && (
                                                        <div className="mb-1.5 max-w-[70%] bg-white border border-gray-100 rounded-lg p-2.5 shadow-sm flex items-center gap-3">
                                                            <img
                                                                src={msg.product.images && msg.product.images[0] ? msg.product.images[0] : 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800'}
                                                                alt={msg.product.name}
                                                                className="w-10 h-10 object-cover border border-gray-100 flex-shrink-0"
                                                            />
                                                            <div className="min-w-0">
                                                                <span className="text-[8px] font-bold text-emerald-600 tracking-wider uppercase block">Tanya Produk:</span>
                                                                <h5 className="text-[11px] font-bold text-gray-900 truncate leading-tight">{msg.product.name}</h5>
                                                                <p className="text-[10px] font-semibold text-gray-900 mt-0.5">{formatCurrency(msg.product.base_price)}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div
                                                        className={`max-w-[70%] rounded-xl px-4 py-2.5 text-xs leading-relaxed ${
                                                            isMe
                                                                ? 'bg-emerald-600 text-white rounded-tr-none'
                                                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                                        }`}
                                                    >
                                                        {msg.message}
                                                    </div>
                                                    <span className="text-[9px] text-gray-400 mt-1 uppercase tracking-wider">
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Sidebar Context: Product Info Panel */}
                                {currentProductContext && (
                                    <div className="w-full md:w-60 border-t md:border-t-0 md:border-l border-gray-100 bg-white p-4 flex flex-col justify-start">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Produk Yang Ditanyakan</h4>
                                        <div className="border border-gray-100 p-3 rounded-xl bg-gray-50/50 flex flex-col items-center text-center">
                                            <div className="w-32 aspect-[3/4] bg-gray-100 overflow-hidden mb-3 border border-gray-100">
                                                <img 
                                                    src={currentProductContext.images && currentProductContext.images[0] ? currentProductContext.images[0] : 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800'} 
                                                    alt={currentProductContext.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <h5 className="text-xs font-bold text-gray-900 leading-snug line-clamp-2 px-1">
                                                {currentProductContext.name}
                                            </h5>
                                            <p className="text-xs font-bold text-emerald-600 mt-1">
                                                {formatCurrency(currentProductContext.base_price)}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">SKU: {currentProductContext.sku || 'N/A'}</p>
                                            <a 
                                                href={`/product/${currentProductContext.slug}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="mt-4 px-4 py-2 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors rounded-lg flex items-center gap-1.5 w-full justify-center"
                                            >
                                                <ShoppingBag className="w-3.5 h-3.5" />
                                                <span>Lihat Produk</span>
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Reply Input Area */}
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white flex gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSendMessage(e);
                                        }
                                    }}
                                    placeholder={`Kirim balasan ke ${selectedUser.name}...`}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 text-xs focus:outline-none focus:border-emerald-500 placeholder:text-gray-400 rounded-lg bg-gray-50 text-gray-900"
                                />
                                <button
                                    type="submit"
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors rounded-lg flex-shrink-0"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Kirim</span>
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50">
                            <MessageSquare className="w-12 h-12 text-gray-300 mb-4 animate-bounce" />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Mulai Percakapan</h3>
                            <p className="text-xs text-gray-400 mt-1 max-w-sm">
                                Pilih pembeli dari panel kiri untuk membalas pesan dan melihat detail produk yang ditanyakan.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
