import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Phone, MessageSquare, MapPin, X, Check, CheckCheck, ChevronLeft } from "lucide-react";
import "./UsedPhones.css";
import { useNavigate } from "react-router-dom";

function UsedPhones() {
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [showConversations, setShowConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const socketRef = useRef(null);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser._id ? parsedUser : { ...parsedUser, _id: parsedUser.id });
      } catch (err) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("user");
        navigate('/login');
      }
    }
  }, [navigate]);

  // Socket connection
useEffect(() => {
    if (!user) return;

    const socket = io("http://localhost:5000", {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      auth: {
        token: localStorage.getItem("userToken")
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      autoConnect: true
    });

    const messageHandler = (newMessage) => {
      setMessages(prev => {
        const exists = prev.some(msg => 
          msg._id === newMessage._id || 
          (msg.tempId && msg.tempId === newMessage.tempId) ||
          (msg.timestamp && newMessage.timestamp && 
           msg.timestamp.toString() === newMessage.timestamp.toString() &&
           msg.content === newMessage.content)
        );
        
        return exists ? prev : [...prev, newMessage];
      });
      
      // Update last message in conversations list
      setConversations(prev => prev.map(conv => 
        conv._id === newMessage.conversation 
          ? { ...conv, lastMessage: newMessage } 
          : conv
      ));
    };

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setError(null);
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setError("Connection error. Trying to reconnect...");
    });

    socket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      if (reason === "io server disconnect") {
        socket.connect();
      }
    });

    socket.on("receiveMessage", messageHandler);

    socket.on("messageError", (error) => {
      console.error("Message error:", error);
      setError(error.error);
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current?.connected) {
        socketRef.current.off("receiveMessage", messageHandler);
        socketRef.current.disconnect();
      }
    };
  }, [user]);
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [phonesRes, conversationsRes] = await Promise.all([
          axios.get('http://localhost:5000/'),
          user ? axios.get("http://localhost:5000/conversations", {
            headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` }
          }) : Promise.resolve({ data: [] })
        ]);

        setPhones(phonesRes.data.data);
        setConversations(conversationsRes.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

 const handleOpenChat = async (phone) => {
  if (!user) {
    window.open(`https://wa.me/${phone.phoneNumber}?text=Hi, I'm interested in your ${phone.adTitle}`);
    return;
  }

  try {
    setLoadingMessages(true);
    setError(null);
    const token = localStorage.getItem("userToken");
    
    // Validate phone data
    if (!phone?._id || !phone?.seller?._id) {
      throw new Error("Invalid phone data - missing ID fields");
    }

    // 1. First check for existing conversation
    const existingConv = conversations.find(conv => 
      conv.listing?._id === phone._id
    );

    if (existingConv) {
      return handleOpenExistingConversation(existingConv);
    }

    // 2. Create new conversation if none exists
    const response = await axios.post(
      "http://localhost:5000/conversations",
      { 
        listingId: phone._id, 
        receiverId: phone.seller._id 
      },
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 3. Set up the chat modal
    const newConversation = response.data;
    setConversation(newConversation);
    setSelectedPhone(phone);
    setMessages([]);
    
    // 4. Update conversations list
    setConversations(prev => [...prev, newConversation]);
    
    // 5. Join socket room
    if (socketRef.current?.connected) {
      socketRef.current.emit("joinConversation", newConversation._id);
    }
    
    // 6. Open the modal
    setShowModal(true);
    setShowConversations(false);

  } catch (error) {
    console.error("Error opening chat:", {
      error: error.response?.data || error.message,
      phoneId: phone?._id
    });
    
    let errorMessage = error.response?.data?.message || error.message;
    if (errorMessage.includes("Listing not found")) {
      // Remove stale listing from UI
      setPhones(prev => prev.filter(p => p._id !== phone._id));
      errorMessage = "This listing is no longer available";
    }
    
    setError(errorMessage);
  } finally {
    setLoadingMessages(false);
  }
};

  const handleOpenExistingConversation = async (conversation) => {
    try {
      setLoadingMessages(true);
      const token = localStorage.getItem("userToken");
      
      const [messagesRes] = await Promise.all([
        axios.get(`http://localhost:5000/conversations/${conversation._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.patch(`http://localhost:5000/mark-read/${conversation._id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setMessages(messagesRes.data);
      setConversation(conversation);
      
      // Find or create phone data
      const phone = phones.find(p => p._id === conversation.listingId) || {
        _id: conversation.listingId,
        adTitle: conversation.listing?.adTitle || "Deleted Listing",
        seller: conversation.participants.find(p => p._id !== user._id) || {}
      };
      
      setSelectedPhone(phone);
      setShowModal(true);
      setShowConversations(false);

      if (socketRef.current?.connected) {
        socketRef.current.emit("joinConversation", conversation._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to open conversation");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!conversation || !message.trim()) return;

    try {
      setSending(true);
      const tempId = `temp-${Date.now()}`;
      const messageData = {
        tempId,
        conversation: conversation._id,
        sender: { _id: user._id, name: user.name },
        content: message,
        timestamp: new Date(),
        read: false,
        status: 'sending'
      };

      setMessages(prev => [...prev, messageData]);
      setMessage("");

      if (socketRef.current?.connected) {
        socketRef.current.emit("sendMessage", {
          conversationId: conversation._id,
          sender: user._id,
          content: message,
          tempId
        }, (ack) => {
          setMessages(prev => prev.map(msg => 
            msg.tempId === tempId 
              ? ack?.error 
                ? { ...msg, status: 'failed', error: ack.error }
                : { ...ack, tempId, status: 'delivered' } 
              : msg
          ));
          if (ack?.error) setError(ack.error);
        });
      }
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // UI rendering
  if (!user && !loading) {
    return (
      <div className="auth-prompt">
        <h3>Please log in to message sellers directly</h3>
        <button onClick={() => navigate('/login')}>Login</button>
      </div>
    );
  }

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (error) return <div className="error-message"><p>{error}</p><button onClick={() => window.location.reload()}>Retry</button></div>;

  const filteredPhones = phones.filter(phone => {
    const matchesFilter = activeFilter === "all" || phone.brand.toLowerCase() === activeFilter;
    const matchesSearch = phone.adTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="used-phones-marketplace">
      <header className="marketplace-hero">
        <div className="hero-content">
          <h1>Premium Used Phones Marketplace</h1>
          <p>Find quality pre-owned smartphones at competitive prices</p>
        </div>
      </header>

      <main className="marketplace-container">
        <div className="search-filter-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search phones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-buttons">
            <button className={activeFilter === "all" ? "active" : ""} onClick={() => setActiveFilter("all")}>
              All Brands
            </button>
            {['Apple', 'Samsung', 'Tecno', 'Redmi', 'POCO'].map(brand => (
              <button
                key={brand}
                className={activeFilter === brand.toLowerCase() ? "active" : ""}
                onClick={() => setActiveFilter(brand.toLowerCase())}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {filteredPhones.length === 0 ? (
          <div className="no-phones">
            <Phone size={48} className="no-phones-icon" />
            <h3>No phones found</h3>
          </div>
        ) : (
          <div className="phones-grid">
            {filteredPhones.map((phone) => (
              <div key={phone._id} className="phone-card">
                <div className="card-badges">
                  <span className="brand-badge">{phone.brand}</span>
                  {phone.price < 300 && <span className="deal-badge">Great Deal</span>}
                </div>
                
                <div className="phone-image-container">
                  {phone.images?.length > 0 ? (
                    <img src={`http://localhost:5000${phone.images[0].url}`} alt={phone.adTitle} />
                  ) : (
                    <div className="image-placeholder"><Phone size={36} /></div>
                  )}
                </div>

                <div className="phone-details">
                  <h3>{phone.adTitle}</h3>
                  <p className="description">{phone.description}</p>
                  <div className="price-location">
                    <div className="price">${phone.price.toLocaleString()}</div>
                    <div className="location"><MapPin size={14} />{phone.location}</div>
                  </div>
                </div>

                <div className="card-actions">
                  {phone.seller?._id === user?._id ? (
                    <button className="view-messages-btn" onClick={() => setShowConversations(true)}>
                      <MessageSquare size={16} /> View Messages
                    </button>
                  ) : (
                    <button className="contact-btn" onClick={() => handleOpenChat(phone)}>
                      <MessageSquare size={16} /> Contact Seller
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showConversations && (
        <div className="conversations-drawer">
          <div className="drawer-header">
            <button className="btn1" onClick={() => setShowConversations(false)}>
              <ChevronLeft size={20} />
            </button>
            <h3 className="h3">Your Conversations</h3>
          </div>
          
          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="no-conversations">
                <MessageSquare size={48} />
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations.map(conv => {
                const otherUser = conv.participants.find(p => p._id !== user._id);
                return (
                  <div key={conv._id} className="conversation-item" onClick={() => handleOpenExistingConversation(conv)}>
                    <div className="conversation-avatar">
                      {otherUser?.avatar ? (
                        <img src={`http://localhost:5000${otherUser.avatar}`} alt="" />
                      ) : (
                        <div className="avatar-placeholder">{otherUser?.name?.charAt(0) || "U"}</div>
                      )}
                    </div>
                    
                    <div className="conversation-details">
                      <div className="conversation-header">
                        <h4>{otherUser?.name || "Unknown User"}</h4>
                        <span className="conversation-time">
                          {conv.lastMessage?.timestamp 
                            ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                      </div>
                      <div className="conversation-preview">
                        <p>{conv.lastMessage?.content || "No messages yet"}</p>
                        {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {showModal && conversation && (
        <div className="message-modal-overlay">
          <div className="message-modal">
            <div className="modal-header">
              <button className="btn1" onClick={() => { setShowModal(false); setShowConversations(true); }}>
                <ChevronLeft size={20} />
              </button>
              <h3>
                {selectedPhone?.seller?._id === user._id 
                  ? `Conversation About Your Listing` 
                  : `Chat with ${selectedPhone?.seller?.name || "Seller"}`
                }
              </h3>
              <button className="btn1" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            
            <div className="modal-body">
              {selectedPhone && (
                <div className="product-info">
                  <div className="product-image">
                    {selectedPhone.images?.length > 0 ? (
                      <img src={`http://localhost:5000${selectedPhone.images[0].url}`} alt={selectedPhone.adTitle} />
                    ) : (
                      <div className="image-placeholder"><Phone size={36} /></div>
                    )}
                  </div>
                  <div className="product-details">
                    <h4>{selectedPhone.adTitle || "Unknown Listing"}</h4>
                    {selectedPhone.price && <p className="price">${selectedPhone.price.toLocaleString()}</p>}
                  </div>
                </div>
              )}
              
              <div className="chat-messages">
                {loadingMessages ? (
                  <div className="loading-messages">Loading...</div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const isCurrentUser = msg.sender?._id === user._id;
                      return (
                        <div key={index} className={`message ${isCurrentUser ? 'sent' : 'received'}`}>
                          <p>{msg.content}</p>
                          <span className="message-time">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isCurrentUser && (
                              <span className="read-receipt">
                                {msg.read ? <CheckCheck size={12} className="read" /> : <Check size={12} className="unread" />}
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
              
              <form onSubmit={handleMessageSubmit} className="chat-input">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  required
                  disabled={loadingMessages}
                />
                <button type="submit" disabled={!message.trim() || sending}>
                  {sending ? "Sending..." : "Send"}
                </button>
                {error && <div className="error-message">{error}</div>}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsedPhones;