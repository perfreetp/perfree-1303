import { useState, useMemo, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Image,
  Search,
  Check,
  CheckCheck,
  Bell,
  User,
  Phone,
  AlertCircle,
  X,
  Clock,
  Store,
  PawPrint,
  Camera,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { SenderType } from '../../data/types';

export default function Communication() {
  const { messages, checkIns, pets, owners, getActiveCheckIns, addMessage, markMessageAsRead, employees, currentUserId, currentStoreId } = useAppStore();
  const [selectedCheckInId, setSelectedCheckInId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeCheckIns = getActiveCheckIns();

  const conversations = useMemo(() => {
    const checkInMessages = new Map<string, typeof messages>();
    
    messages.forEach(msg => {
      if (!checkInMessages.has(msg.checkInId)) {
        checkInMessages.set(msg.checkInId, []);
      }
      checkInMessages.get(msg.checkInId)!.push(msg);
    });

    return activeCheckIns.map(checkIn => {
      const msgs = checkInMessages.get(checkIn.id) || [];
      const sortedMsgs = [...msgs].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      const unreadCount = msgs.filter(m => !m.isRead && m.senderType !== 'staff').length;
      const lastMsg = sortedMsgs[sortedMsgs.length - 1];
      
      return {
        checkIn,
        messages: sortedMsgs,
        unreadCount,
        lastMessage: lastMsg,
      };
    }).filter(conv => conv.messages.length > 0 || searchQuery === '')
      .filter(conv => 
        conv.checkIn.pet.name.includes(searchQuery) ||
        conv.checkIn.owner.name.includes(searchQuery)
      )
      .sort((a, b) => {
        if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
        if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
        if (!a.lastMessage && !b.lastMessage) return 0;
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return b.lastMessage.timestamp.localeCompare(a.lastMessage.timestamp);
      });
  }, [messages, activeCheckIns, searchQuery]);

  const selectedConversation = useMemo(() => {
    if (!selectedCheckInId) return null;
    return conversations.find(c => c.checkIn.id === selectedCheckInId);
  }, [conversations, selectedCheckInId]);

  useEffect(() => {
    if (selectedConversation) {
      selectedConversation.messages.forEach(msg => {
        if (!msg.isRead && msg.senderType !== 'staff') {
          markMessageAsRead(msg.id);
        }
      });
    }
  }, [selectedCheckInId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages.length]);

  const handleSendMessage = () => {
    if (!selectedCheckInId || !newMessage.trim()) return;
    
    const employee = employees.find(e => e.id === currentUserId);
    if (!employee) return;

    addMessage({
      checkInId: selectedCheckInId,
      senderType: 'staff',
      senderName: employee.name,
      content: newMessage.trim(),
    });

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    }
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getSenderConfig = (senderType: SenderType) => {
    switch (senderType) {
      case 'staff':
        return { bg: 'bg-primary-500', text: 'text-white', align: 'justify-end', name: '店员' };
      case 'owner':
        return { bg: 'bg-gray-100', text: 'text-gray-800', align: 'justify-start', name: '主人' };
      case 'system':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', align: 'justify-center', name: '系统' };
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="h-[calc(100vh-120px)] animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">客户沟通</h1>
          <p className="text-gray-500 mt-1">与宠物主人保持实时沟通</p>
        </div>
        {totalUnread > 0 && (
          <span className="badge bg-red-100 text-red-600">
            <Bell className="w-3 h-3 mr-1" />
            {totalUnread} 条未读
          </span>
        )}
      </div>

      <div className="h-full flex gap-4">
        <div className="w-80 flex-shrink-0 flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索宠物或主人..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv, index) => (
              <div
                key={conv.checkIn.id}
                onClick={() => setSelectedCheckInId(conv.checkIn.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                  selectedCheckInId === conv.checkIn.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
                }`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img
                      src={conv.checkIn.pet.photoUrl}
                      alt={conv.checkIn.pet.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-800 truncate">{conv.checkIn.pet.name}</h4>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatTime(conv.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                      <User className="w-3 h-3" />
                      <span className="truncate">{conv.checkIn.owner.name}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage ? conv.lastMessage.content : '暂无消息'}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {conversations.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">暂无对话</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedConversation.checkIn.pet.photoUrl}
                    alt={selectedConversation.checkIn.pet.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-800">{selectedConversation.checkIn.pet.name}</h4>
                      <span className="badge bg-green-100 text-green-600 text-xs">
                        <PawPrint className="w-3 h-3 mr-1" />
                        在住中
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {selectedConversation.checkIn.owner.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {selectedConversation.checkIn.owner.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Store className="w-3 h-3" />
                        笼位 {selectedConversation.checkIn.cageNumber}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCheckInId(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {selectedConversation.messages.map((msg, index) => {
                  const config = getSenderConfig(msg.senderType);
                  const showAvatar = index === 0 || 
                    selectedConversation.messages[index - 1].senderType !== msg.senderType;
                  
                  let currentDate = '';
                  const msgDate = formatDate(msg.timestamp);
                  if (index === 0 || formatDate(selectedConversation.messages[index - 1].timestamp) !== msgDate) {
                    currentDate = msgDate;
                  }

                  return (
                    <div key={msg.id}>
                      {currentDate && (
                        <div className="flex justify-center my-4">
                          <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                            {currentDate}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${config.align} mb-4`}>
                        {msg.senderType !== 'staff' && showAvatar && (
                          <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                            <User className="w-4 h-4 text-secondary-600" />
                          </div>
                        )}
                        {msg.senderType === 'staff' && showAvatar && (
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center ml-2 flex-shrink-0 order-2">
                            <User className="w-4 h-4 text-primary-600" />
                          </div>
                        )}
                        <div className={`max-w-[70%] ${msg.senderType === 'staff' ? 'order-1' : ''}`}>
                          {showAvatar && msg.senderType !== 'system' && (
                            <p className={`text-xs text-gray-500 mb-1 ${config.align}`}>
                              {msg.senderName}
                            </p>
                          )}
                          <div className={`rounded-2xl p-3 ${config.bg} ${config.text} ${
                            msg.senderType === 'staff' ? 'rounded-tr-none' : 'rounded-tl-none'
                          }`}>
                            {msg.photoUrl && (
                              <img
                                src={msg.photoUrl}
                                alt="消息图片"
                                className="w-48 h-48 object-cover rounded-lg mb-2"
                              />
                            )}
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${config.align}`}>
                            <Clock className="w-3 h-3" />
                            {formatTime(msg.timestamp)}
                            {msg.senderType === 'staff' && (
                              msg.isRead ? (
                                <CheckCheck className="w-3 h-3 text-blue-500" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-100">
                <div className="flex items-end gap-3">
                  <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                    <Camera className="w-5 h-5 text-gray-500" />
                  </button>
                  <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                    <Image className="w-5 h-5 text-gray-500" />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="输入消息..."
                      className="input pr-12 min-h-[44px] resize-none py-3"
                      rows={1}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white rounded-xl transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageSquare className="w-16 h-16 mb-4" />
              <p className="text-lg">选择一个对话开始沟通</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
